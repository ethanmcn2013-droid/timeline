import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { formatRelative } from "@/lib/format";
import {
  getWorkspace,
  getProjectsForWorkspace,
  getTasksForWorkspace,
  getUpcomingTasks,
  getLastUpdatedForWorkspace,
} from "@/server/db/queries";
import type { Task, Project } from "@/server/db/schema";
import { WorkspaceHeader } from "@/components/roadmap/workspace-header";
import { ProjectCard } from "@/components/roadmap/project-card";
import type { ProjectWithCounts } from "@/components/roadmap/project-card";
import { ItemRow } from "@/components/roadmap/item-row";
import { BigStat } from "@/components/roadmap/big-stat";
import { BlockerCard } from "@/components/roadmap/blocker-card";
import { MilestoneCard } from "@/components/roadmap/milestone-card";
import { MetaStrip } from "@/components/roadmap/meta-strip";
import { ProgressRing } from "@/components/roadmap/progress-ring";
import { ShortcutsOverlay } from "@/components/roadmap/shortcuts-overlay";
import { WorkspaceViewSwitcher } from "@/components/roadmap/workspace-view-switcher";
import { ScheduleView } from "@/components/roadmap/schedule-view";
import { RoadmapFlow } from "@/components/roadmap/roadmap-flow";
import { MilestoneMap } from "@/components/roadmap/milestone-map";
import { SiteFooter } from "@/components/marketing/site-footer";
import type { WorkspaceView } from "@/components/showcase/types";
import Link from "next/link";

// Public roadmap is read-only. ISR with a 5-min window; the source-save
// action calls revalidatePath on edit so stakeholders see fresh data
// immediately rather than waiting out the window.
//
// Note: searchParams are passed to the page but the DATA fetch is not
// branched per view — all views use the same allTasks/projects/etc fetch
// that happens once. Only the JSX branch changes. ISR is preserved.
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}): Promise<Metadata> {
  const { workspaceSlug } = await params;
  const workspace = await getWorkspace(workspaceSlug);
  if (!workspace) return { title: "Not Found" };
  return {
    title: `${workspace.name} — Roadmap`,
    description: `Public roadmap for ${workspace.name}.`,
  };
}

export default async function WorkspaceRoadmapPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { workspaceSlug } = await params;
  const sp = await searchParams;

  // Derive active view from ?view= param. Default is "overview".
  // Validate against known values so a typo doesn't crash the render.
  const rawView = typeof sp.view === "string" ? sp.view : undefined;
  const activeView: WorkspaceView =
    rawView === "roadmap" ||
    rawView === "milestones" ||
    rawView === "schedule"
      ? rawView
      : "overview";

  const workspace = await getWorkspace(workspaceSlug);
  if (!workspace) notFound();

  // Single data fetch — all three views share this payload.
  // No per-view branching in the data layer; ISR is not broken.
  const [projects, allTasks, upcoming, lastUpdated] = await Promise.all([
    getProjectsForWorkspace(workspaceSlug),
    getTasksForWorkspace(workspaceSlug),
    getUpcomingTasks(workspaceSlug, 14),
    getLastUpdatedForWorkspace(workspaceSlug),
  ]);

  // Workspace-level status counts derived from the task list we already
  // fetched, rather than a second full-table read (was getCountsForWorkspace).
  const counts = {
    total: allTasks.length,
    shipped: 0,
    inFlight: 0,
    blocked: 0,
    next: 0,
    refused: 0,
  };
  for (const t of allTasks) {
    if (t.status === "shipped") counts.shipped++;
    else if (t.status === "in-flight") counts.inFlight++;
    else if (t.status === "blocked") counts.blocked++;
    else if (t.status === "next") counts.next++;
    else if (t.status === "refused") counts.refused++;
  }

  const projectMap = new Map<string, Project>(projects.map((p) => [p.slug, p]));

  const projectCounts = new Map<
    string,
    ProjectWithCounts["counts"] & { total: number }
  >();
  for (const p of projects) {
    projectCounts.set(p.slug, {
      shipped: 0,
      "in-flight": 0,
      blocked: 0,
      next: 0,
      refused: 0,
      total: 0,
    });
  }
  for (const t of allTasks) {
    const c = projectCounts.get(t.projectSlug);
    if (!c) continue;
    c.total++;
    if (t.status === "shipped") c.shipped++;
    else if (t.status === "in-flight") c["in-flight"]++;
    else if (t.status === "blocked") c.blocked++;
    else if (t.status === "next") c.next++;
    else if (t.status === "refused") c.refused++;
  }

  const projectsWithCounts: ProjectWithCounts[] = projects.map((p) => {
    const c = projectCounts.get(p.slug)!;
    return { ...p, total: c.total, counts: c };
  });

  // Non-refused, non-milestone tasks render in the main list. Milestones
  // and blockers get their own sections above.
  const visibleTasks = allTasks.filter(
    (t) => t.status !== "refused" && t.kind !== "milestone",
  );
  const tasksByProject = new Map<string, Task[]>();
  for (const t of visibleTasks) {
    const arr = tasksByProject.get(t.projectSlug) ?? [];
    arr.push(t);
    tasksByProject.set(t.projectSlug, arr);
  }

  // Milestones (kind=milestone OR isLaunch), sorted by targetDate asc,
  // un-dated last. Refused milestones drop out.
  const milestones = allTasks
    .filter(
      (t) =>
        (t.kind === "milestone" || t.isLaunch) && t.status !== "refused",
    )
    .sort((a, b) => {
      if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate);
      if (a.targetDate) return -1;
      if (b.targetDate) return 1;
      return a.sortOrder - b.sortOrder;
    });

  // Un-shipped milestones with a date, in chronological order. The
  // page renders each item with a soft "→ for <milestone>" line that
  // points at the *earliest* such milestone the item falls under
  // (item.targetDate ≤ milestone.targetDate). Refused items skip the
  // line entirely — they're not building toward anything.
  const pendingMilestones = milestones.filter(
    (m) => m.status !== "shipped" && m.targetDate,
  );

  function milestoneFor(t: Task): string | null {
    if (!t.targetDate) return null;
    if (t.status === "refused") return null;
    if (t.kind === "milestone" || t.isLaunch) return null;
    for (const m of pendingMilestones) {
      if (t.targetDate <= m.targetDate!) return m.title;
    }
    return null;
  }

  // Blockers: status=blocked items. We don't gate the roadmap on these,
  // but we surface them as a card grid above the list (Tasks GTM rhythm).
  const blockers = allTasks
    .filter((t) => t.status === "blocked")
    .sort((a, b) => {
      if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate);
      return a.sortOrder - b.sortOrder;
    });

  // Date range across all targetDates for the meta strip.
  const datedTasks = allTasks
    .filter((t) => t.targetDate && t.status !== "refused")
    .map((t) => t.targetDate!);
  const dateRange = datedTasks.length
    ? {
        from: datedTasks.reduce((a, b) => (a < b ? a : b)),
        to: datedTasks.reduce((a, b) => (a > b ? a : b)),
      }
    : null;

  const totalForProgress = counts.total - counts.refused;
  const progress = totalForProgress > 0 ? counts.shipped / totalForProgress : 0;

  const hasItems = allTasks.length > 0;
  const isDemoWorkspace = workspace.slug === "tasks";

  // The dial + Next-milestone lockup earn their hero placement only
  // when the workspace tells a *story* — not when it's just rendering
  // a count.
  const hasMomentum = totalForProgress >= 5 || milestones.length > 0;

  // Make sure the h1 always ends in a period — the rhythmic signature
  // of "studio. shipping log." / "The other roadmap." — without
  // doubling up when a workspace name already ends in one.
  const heroTitle = /[.!?]$/.test(workspace.name)
    ? workspace.name
    : `${workspace.name}.`;

  // Per-milestone progress: share of non-refused dated items due on or
  // before the milestone date that have shipped. Cheap O(n·m).
  const milestoneScopes = milestones.map((m) => {
    if (!m.targetDate) {
      return { inScope: counts.total - counts.refused, shipped: counts.shipped };
    }
    let inScope = 0;
    let shipped = 0;
    for (const t of allTasks) {
      if (t.status === "refused") continue;
      if (t.kind === "milestone" || t.isLaunch) continue;
      if (!t.targetDate) continue;
      if (t.targetDate > m.targetDate) continue;
      inScope++;
      if (t.status === "shipped") shipped++;
    }
    if (inScope === 0) {
      return { inScope: counts.total - counts.refused, shipped: counts.shipped };
    }
    return { inScope, shipped };
  });

  // ── Serialisable inputs for the client visualisations ────────────────────
  // Roadmap flow map: precompute milestoneFor() per task (the fn can't cross
  // the RSC boundary). Milestone map: precompute scope + feeding-item statuses
  // per milestone using the same predicate MilestonesView used.
  const milestoneLabels: Record<string, string | null> = {};
  for (const t of visibleTasks) milestoneLabels[t.id] = milestoneFor(t);

  const milestoneNodes = milestones.map((m, i) => {
    const feeding = allTasks
      .filter((t) => {
        if (t.status === "refused") return false;
        if (t.kind === "milestone" || t.isLaunch) return false;
        if (!m.targetDate) return true;
        if (!t.targetDate) return false;
        return t.targetDate <= m.targetDate;
      })
      .map((t) => t.status);
    return {
      id: m.id,
      title: m.title,
      projectSlug: m.projectSlug,
      targetDate: m.targetDate,
      status: m.status,
      inScope: milestoneScopes[i].inScope,
      shipped: milestoneScopes[i].shipped,
      feeding,
    };
  });

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      <WorkspaceHeader workspace={workspace} />
      {isDemoWorkspace && (
        <div
          className="w-full border-b px-6 py-2 text-center text-[12px] text-ink-soft"
          style={{ background: "var(--bg-deep)", borderColor: "var(--line-soft)" }}
        >
          You&apos;re viewing a public demo workspace — this is what your roadmap could look like.
        </div>
      )}
      <ShortcutsOverlay />

      <main className="flex-1">
        {/* Hero — typographic title + meta strip + progress dial + view switcher */}
        <section className="border-b border-line-soft/60 px-6 pb-10 pt-12">
          <div className="mx-auto w-full max-w-[1240px]">
            <MetaStrip
              anchor={workspace.name}
              items={[
                dateRange ? `${dateRange.from} → ${dateRange.to}` : null,
                dateRange
                  ? `${weeksBetween(dateRange.from, dateRange.to)} weeks`
                  : null,
                milestones.length > 0
                  ? `${milestones.length} milestone${milestones.length === 1 ? "" : "s"}`
                  : null,
              ]}
            />

            {/* Title + dial row */}
            <div className="flex items-start justify-between gap-8">
              <div className="min-w-0 flex-1">
                <h1 className="text-[clamp(1.85rem,1.25rem+2.8vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink text-balance">
                  {heroTitle}
                </h1>
                <p className="mt-3 max-w-2xl text-[16px] leading-[1.55] text-ink-soft">
                  {workspace.description?.trim() ||
                    `What ${workspace.name} is building next, written in plain English.`}
                </p>
                {/* Last updated + owner + view switcher row */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {(workspace.ownerName || lastUpdated) ? (
                    <p className="text-[12.5px] text-ink-quiet">
                      {workspace.ownerName ? (
                        <>
                          Shared by{" "}
                          <span className="font-medium text-ink-soft">
                            {workspace.ownerName}
                          </span>
                        </>
                      ) : null}
                      {workspace.ownerName && lastUpdated ? (
                        <span className="mx-1.5 text-ink-faint">&middot;</span>
                      ) : null}
                      {lastUpdated ? (
                        <>
                          Last updated{" "}
                          <span className="text-ink-soft">
                            {formatRelative(lastUpdated)}
                          </span>
                        </>
                      ) : null}
                    </p>
                  ) : null}
                  {/* View switcher — client island. Suspense required because
                      useSearchParams() inside suspends until params are known. */}
                  <Suspense fallback={null}>
                    <WorkspaceViewSwitcher
                      activeView={activeView}
                      workspaceSlug={workspaceSlug}
                    />
                  </Suspense>
                </div>
              </div>

              {hasItems && totalForProgress > 0 ? (
                hasMomentum ? (
                  <div className="hidden flex-shrink-0 items-center gap-6 sm:flex">
                    <NextMilestoneStrip milestones={milestones} />
                    <ProgressRing value={progress} size={80} label="done" />
                  </div>
                ) : (
                  <div className="hidden flex-shrink-0 self-end text-right sm:block">
                    <span className="text-[12px] tabular-nums text-ink-quiet">
                      {counts.shipped} of {totalForProgress} shipped
                    </span>
                  </div>
                )
              ) : null}
            </div>

            {/* Stats row — semantic counts — Overview only. The three map
                views (Roadmap board / Milestones / Schedule) each carry their
                own counts in-surface; the band there is redundant and, on the
                board, contradictory (it counts milestones the lanes exclude). */}
            {hasItems && activeView === "overview" ? (
              <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-3">
                <BigStat label="Total" value={counts.total} />
                <BigStat label="Done" value={counts.shipped} tone="shipped" />
                <BigStat label="Doing" value={counts.inFlight} tone="flight" />
                <BigStat label="Next" value={counts.next} />
                {counts.blocked > 0 ? (
                  <BigStat label="Blocked" value={counts.blocked} tone="blocked" />
                ) : null}
                {counts.refused > 0 ? (
                  <BigStat label="Won't do" value={counts.refused} tone="refused" />
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        {/* ── View body ─────────────────────────────────────────────────────── */}
        {!hasItems ? (
          <section className="px-6 py-24 text-center">
            <div className="mx-auto max-w-md">
              <p className="text-[15px] text-ink-soft">
                Nothing yet. The owner is still drafting.
              </p>
            </div>
          </section>
        ) : activeView === "milestones" ? (
          milestones.length === 0 ? (
            <section className="px-6 py-24 text-center">
              <div className="mx-auto max-w-md">
                <p className="text-[15px] text-ink-soft">
                  No milestones yet. The owner is still drafting.
                </p>
              </div>
            </section>
          ) : (
            <MilestoneMap milestones={milestoneNodes} projects={projects} />
          )
        ) : activeView === "schedule" ? (
          <ScheduleView
            tasks={visibleTasks}
            milestones={milestones}
            projects={projects}
            projectMap={projectMap}
          />
        ) : activeView === "roadmap" ? (
          <RoadmapFlow
            tasks={visibleTasks}
            projects={projects}
            milestoneLabels={milestoneLabels}
          />
        ) : (
          /* overview — the original full layout */
          <OverviewView
            blockers={blockers}
            milestones={milestones}
            milestoneScopes={milestoneScopes}
            projects={projects}
            projectsWithCounts={projectsWithCounts}
            projectMap={projectMap}
            tasksByProject={tasksByProject}
            milestoneFor={milestoneFor}
            workspaceSlug={workspaceSlug}
            upcoming={upcoming}
            counts={counts}
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

// ── View: Overview ────────────────────────────────────────────────────────────
// The current full-featured layout: blockers, milestones, project cards, item
// list, right rail. This is the default when ?view= is absent.

function OverviewView({
  blockers,
  milestones,
  milestoneScopes,
  projects,
  projectsWithCounts,
  projectMap,
  tasksByProject,
  milestoneFor,
  workspaceSlug,
  upcoming,
  counts,
}: {
  blockers: Task[];
  milestones: Task[];
  milestoneScopes: { inScope: number; shipped: number }[];
  projects: Project[];
  projectsWithCounts: ProjectWithCounts[];
  projectMap: Map<string, Project>;
  tasksByProject: Map<string, Task[]>;
  milestoneFor: (t: Task) => string | null;
  workspaceSlug: string;
  upcoming: Task[];
  counts: {
    total: number;
    shipped: number;
    inFlight: number;
    blocked: number;
    next: number;
    refused: number;
  };
}) {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-10">
      <div className="flex gap-12 lg:gap-16">
        <div className="min-w-0 flex-1">
          {/* Blockers card grid */}
          {blockers.length > 0 ? (
            <section className="mb-12">
              <div className="mb-4 flex items-baseline gap-2">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
                  Blockers
                </h2>
                <span className="text-[11px] text-ink-faint">
                  · {blockers.length} held up
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {blockers.map((b) => {
                  const proj = projectMap.get(b.projectSlug);
                  return (
                    <BlockerCard
                      key={b.id}
                      blocker={b}
                      workspaceSlug={workspaceSlug}
                      projectAccent={proj?.accent ?? "var(--brand)"}
                    />
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* Milestones */}
          {milestones.length > 0 ? (
            <section className="mb-12">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
                    Milestones
                  </h2>
                  <span className="text-[11px] text-ink-faint">
                    · the moments the rest of this is building toward
                  </span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {milestones.map((m, i) => {
                  const proj = projectMap.get(m.projectSlug);
                  const scope = milestoneScopes[i];
                  return (
                    <MilestoneCard
                      key={m.id}
                      milestone={m}
                      workspaceSlug={workspaceSlug}
                      projectAccent={proj?.accent ?? "var(--brand)"}
                      progress={
                        scope.inScope > 0 ? scope.shipped / scope.inScope : 0
                      }
                      itemsInScope={scope.inScope}
                      itemsShipped={scope.shipped}
                    />
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* Project cards */}
          {projects.length > 1 ? (
            <section className="mb-10">
              <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
                Projects
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projectsWithCounts.map((p) => (
                  <ProjectCard
                    key={p.slug}
                    project={p}
                    workspaceSlug={workspaceSlug}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {/* All items, grouped by project then week heading */}
          <ItemListByProject
            projects={projects}
            tasksByProject={tasksByProject}
            milestoneFor={milestoneFor}
            workspaceSlug={workspaceSlug}
          />
        </div>

        {/* Right rail */}
        <aside className="hidden w-60 shrink-0 lg:block xl:w-64">
          <div className="sticky top-20 space-y-8">
            {/* Coming up — next 14 days */}
            {upcoming.length > 0 ? (
              <section>
                <h3 className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
                  Next 14 days
                </h3>
                <ul className="space-y-3">
                  {upcoming.map((t) => {
                    const proj = projectMap.get(t.projectSlug);
                    return (
                      <li key={t.id}>
                        <Link
                          href={`/${workspaceSlug}/${t.projectSlug}/${t.id}`}
                          className="group flex flex-col gap-0.5"
                        >
                          <span
                            className={
                              "line-clamp-2 text-[12px] leading-[1.4] transition-colors group-hover:text-ink-soft " +
                              (t.isLaunch
                                ? "font-semibold text-ink"
                                : "text-ink")
                            }
                          >
                            {t.title}
                          </span>
                          <span className="text-[10.5px] tabular-nums text-ink-quiet">
                            {t.targetDate?.slice(5)}
                            {proj ? ` · ${proj.name}` : null}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {/* Milestones list — T-N treatment */}
            {milestones.length > 0 ? (
              <section>
                <h3 className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
                  Milestones
                </h3>
                <ul className="space-y-2.5">
                  {milestones.slice(0, 5).map((m) => {
                    const days = m.targetDate
                      ? daysUntilSimple(m.targetDate)
                      : null;
                    const isShipped = m.status === "shipped";
                    return (
                      <li
                        key={m.id}
                        className="flex items-baseline justify-between gap-2"
                      >
                        <Link
                          href={`/${workspaceSlug}/${m.projectSlug}/${m.id}`}
                          className={
                            "min-w-0 truncate text-[12px] transition-colors hover:text-ink-soft " +
                            (isShipped
                              ? "text-ink-quiet line-through"
                              : "font-medium text-ink")
                          }
                        >
                          {m.title}
                        </Link>
                        <span className="flex-shrink-0 text-[10.5px] tabular-nums text-ink-quiet">
                          {isShipped
                            ? "done"
                            : days === null
                              ? "—"
                              : days === 0
                                ? "today"
                                : days < 0
                                  ? `−${Math.abs(days)}d`
                                  : `T-${days}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {/* Shared update */}
            <section>
              <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
                Shared update
              </h3>
              <p className="mb-2 text-[12px] leading-[1.45] text-ink-quiet">
                The short version for anyone who just needs the state of the work.
              </p>
              <Link
                href={`/${workspaceSlug}/update?source=roadmap_share&segment=general&role=viewer&campaign=collaboration_proof&artefact=shared_update`}
                className="text-[12px] text-ink-quiet underline underline-offset-2 transition-colors hover:text-ink"
              >
                Open shared update
              </Link>
            </section>

            {/* Refusals link */}
            {counts.refused > 0 ? (
              <section>
                <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
                  What didn&apos;t make it
                </h3>
                <Link
                  href={`/${workspaceSlug}/refusals`}
                  className="text-[12px] text-ink-quiet underline underline-offset-2 transition-colors hover:text-ink"
                >
                  {counts.refused} refused item{counts.refused !== 1 ? "s" : ""}
                </Link>
              </section>
            ) : null}

            <p className="text-[10.5px] text-ink-faint">
              Press{" "}
              <kbd className="rounded border border-line px-1 py-0.5 font-mono text-[10px]">
                ?
              </kbd>{" "}
              for shortcuts
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── View: Roadmap ─────────────────────────────────────────────────────────────
// Focused scannable item list — the dated item list grouped by project then
// week heading, as it renders today, as a named destination. No right rail,
// no blocker cards. Just the items.

function RoadmapView({
  projects,
  projectsWithCounts,
  tasksByProject,
  projectMap,
  milestoneFor,
  workspaceSlug,
}: {
  projects: Project[];
  projectsWithCounts: ProjectWithCounts[];
  projectMap: Map<string, Project>;
  tasksByProject: Map<string, Task[]>;
  milestoneFor: (t: Task) => string | null;
  workspaceSlug: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-10">
      {/* Project cards when multiple */}
      {projects.length > 1 ? (
        <section className="mb-10">
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
            Projects
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projectsWithCounts.map((p) => (
              <ProjectCard
                key={p.slug}
                project={p}
                workspaceSlug={workspaceSlug}
              />
            ))}
          </div>
        </section>
      ) : null}

      <ItemListByProject
        projects={projects}
        tasksByProject={tasksByProject}
        milestoneFor={milestoneFor}
        workspaceSlug={workspaceSlug}
      />
    </div>
  );
}

// ── View: Milestones ──────────────────────────────────────────────────────────
// Milestone cards promoted to the full body — progress bars + T-N countdowns
// + items owned by each milestone listed below the card.

function MilestonesView({
  milestones,
  milestoneScopes,
  projectMap,
  allTasks,
  workspaceSlug,
}: {
  milestones: Task[];
  milestoneScopes: { inScope: number; shipped: number }[];
  projectMap: Map<string, Project>;
  allTasks: Task[];
  workspaceSlug: string;
}) {
  if (milestones.length === 0) {
    return (
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-md">
          <p className="text-[15px] text-ink-soft">
            No milestones yet. The owner is still drafting.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-10">
      <div className="space-y-10">
        {milestones.map((m, i) => {
          const proj = projectMap.get(m.projectSlug);
          const scope = milestoneScopes[i];

          // Items that fall under this milestone: non-refused, non-milestone
          // tasks with a date on or before m.targetDate. Undated milestones
          // show all non-refused tasks.
          const ownedItems = allTasks.filter((t) => {
            if (t.status === "refused") return false;
            if (t.kind === "milestone" || t.isLaunch) return false;
            if (!m.targetDate) return true;
            if (!t.targetDate) return false;
            return t.targetDate <= m.targetDate!;
          });

          return (
            <section key={m.id}>
              {/* Milestone card — full width */}
              <div className="mb-4 sm:max-w-xl">
                <MilestoneCard
                  milestone={m}
                  workspaceSlug={workspaceSlug}
                  projectAccent={proj?.accent ?? "var(--brand)"}
                  progress={
                    scope.inScope > 0 ? scope.shipped / scope.inScope : 0
                  }
                  itemsInScope={scope.inScope}
                  itemsShipped={scope.shipped}
                />
              </div>

              {/* Owned items */}
              {ownedItems.length > 0 ? (
                <div>
                  <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
                    Items toward this milestone
                  </div>
                  <ul className="overflow-hidden rounded-xl border border-line-soft">
                    {ownedItems.map((t) => {
                      const itemProj = projectMap.get(t.projectSlug);
                      return (
                        <ItemRow
                          key={t.id}
                          task={t}
                          workspaceSlug={workspaceSlug}
                          projectAccent={itemProj?.accent ?? "var(--brand)"}
                          projectName={itemProj?.name ?? t.projectSlug}
                          showProject={true}
                        />
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ── Shared sub-component ──────────────────────────────────────────────────────
// Item list grouped by project then week heading. Used by overview + roadmap views.

function ItemListByProject({
  projects,
  tasksByProject,
  milestoneFor,
  workspaceSlug,
}: {
  projects: Project[];
  tasksByProject: Map<string, Task[]>;
  milestoneFor: (t: Task) => string | null;
  workspaceSlug: string;
}) {
  return (
    <>
      {projects.map((project) => {
        const projectTasks = tasksByProject.get(project.slug) ?? [];
        if (projectTasks.length === 0) return null;

        const groups = groupByWeek(projectTasks);

        return (
          <section key={project.slug} className="mb-10">
            {projects.length > 1 ? (
              <div className="mb-4 flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: project.accent }}
                />
                <h2 className="text-[13px] font-semibold text-ink">
                  {project.name}
                </h2>
              </div>
            ) : null}

            {groups.map(({ heading, tasks: groupTasks }) => (
              <div key={heading ?? "__none__"} className="mb-6">
                {heading ? (
                  <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
                    {heading}
                  </div>
                ) : null}
                <ul className="overflow-hidden rounded-xl border border-line-soft">
                  {groupTasks.map((t, i) => {
                    const label = milestoneFor(t);
                    const prevLabel =
                      i > 0 ? milestoneFor(groupTasks[i - 1]) : null;
                    const showLabel =
                      label && label !== prevLabel ? label : null;
                    return (
                      <ItemRow
                        key={t.id}
                        task={t}
                        workspaceSlug={workspaceSlug}
                        projectAccent={project.accent}
                        projectName={project.name}
                        showProject={projects.length > 1}
                        milestoneLabel={showLabel}
                      />
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        );
      })}
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function groupByWeek(
  tasks: Task[],
): { heading: string | null; tasks: Task[] }[] {
  const groups: { heading: string | null; tasks: Task[] }[] = [];
  let current: { heading: string | null; tasks: Task[] } | null = null;

  for (const t of tasks) {
    const h = t.weekHeading ?? null;
    if (!current || current.heading !== h) {
      current = { heading: h, tasks: [] };
      groups.push(current);
    }
    current.tasks.push(t);
  }

  return groups;
}

function weeksBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso + "T00:00:00Z").getTime();
  const to = new Date(toIso + "T00:00:00Z").getTime();
  const weeks = Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24 * 7)));
  return weeks;
}

// formatRelative extracted to src/lib/format.ts — Phase 11.3

function daysUntilSimple(iso: string): number {
  const target = new Date(iso + "T00:00:00Z").getTime();
  const today = new Date();
  const todayUTC = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  return Math.round((target - todayUTC) / (1000 * 60 * 60 * 24));
}

function NextMilestoneStrip({ milestones }: { milestones: Task[] }) {
  // Surface the next un-shipped milestone with a date.
  const next = milestones.find(
    (m) => m.status !== "shipped" && m.targetDate,
  );
  if (!next) return null;
  const days = daysUntilSimple(next.targetDate!);
  return (
    <div className="flex flex-col items-end text-right">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
        Next milestone
      </span>
      <span className="mt-0.5 max-w-[180px] truncate text-[13px] font-semibold text-ink">
        {next.title}
      </span>
      <span className="text-[11px] tabular-nums text-ink-quiet">
        {next.targetDate}
        {days >= 0 ? ` · T-${days}` : ` · −${Math.abs(days)}d`}
      </span>
    </div>
  );
}
