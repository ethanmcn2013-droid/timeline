import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { formatRelative } from "@/lib/format";
import {
  getWorkspace,
  getProjectsForWorkspace,
  getTasksForWorkspace,
  getEffectiveNodesForWorkspace,
  getUpcomingTasks,
  getLastUpdatedForWorkspace,
  isWorkspacePublished,
} from "@/server/db/queries";
import { getCurrentUser } from "@/server/auth";
import type { Task, Project } from "@/server/db/schema";
import { WorkspaceHeader } from "@/components/roadmap/workspace-header";
import { ProjectCard } from "@/components/roadmap/project-card";
import type { ProjectWithCounts } from "@/components/roadmap/project-card";
import { ItemRow } from "@/components/roadmap/item-row";
import { BigStat } from "@/components/roadmap/big-stat";
import { BlockerCard } from "@/components/roadmap/blocker-card";
import { MilestoneCard } from "@/components/roadmap/milestone-card";
import { MetaStrip } from "@/components/roadmap/meta-strip";
import { ShortcutsOverlay } from "@/components/roadmap/shortcuts-overlay";
import {
  WorkspaceViewSwitcher,
  WorkspaceViewSwitcherStatic,
} from "@/components/roadmap/workspace-view-switcher";
import {
  WorkspaceViewBody,
  WorkspaceViewBodyStatic,
  OverviewOnly,
  OverviewOnlyStatic,
} from "@/components/roadmap/workspace-view-client";
import { ScheduleView } from "@/components/roadmap/schedule-view";
import { RoadmapFlow } from "@/components/roadmap/roadmap-flow";
import { MilestoneMap } from "@/components/roadmap/milestone-map";
import { SiteFooter } from "@/components/marketing/site-footer";
import Link from "next/link";

// Public roadmap is read-only, ISR with a 5-min window. The page reads
// NO dynamic APIs (no searchParams/cookies/headers) so this revalidate
// genuinely engages — every shared-link hit is served from cache, not a
// fresh 4-query Turso round-trip. The source-save action calls
// revalidatePath on edit so stakeholders see changes immediately rather
// than waiting out the window. View selection (?view=) is resolved
// client-side by WorkspaceViewBody — see that component for why reading
// it server-side here would silently break ISR.
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

// ── P1-3 shell / content split ────────────────────────────────────────────────
// The outer page component resolves only getWorkspace (React-cached — the
// generateMetadata call above reuses the same request-deduped query).
// Everything that requires data — the draft/publish gate plus the four heavy
// reads — lives in WorkspaceContentWell behind a Suspense boundary scoped to
// the content well only. The WorkspaceHeader + ShortcutsOverlay paint
// immediately from the cache; they never re-blank while the data resolves.
//
// revalidate=300 still engages: the outer shell and the content well are
// co-located in the same route segment, so ISR caches the whole composed
// output at the pathname boundary. The Suspense split is a streaming
// concern, not a caching concern.

export default async function WorkspaceRoadmapPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;

  // getWorkspace is React-cached — shared with generateMetadata above and
  // with WorkspaceContentWell below (all three reuse one Turso round-trip).
  const workspace = await getWorkspace(workspaceSlug);
  if (!workspace) notFound();

  return (
    // data-workspace-view-root: anchor for the pre-paint inline script that
    // sets data-view="<active>" before first render so CSS immediately shows
    // only the deep-linked view panel without a flash. Placed on the outer
    // shell so the script is present even during Suspense resolution.
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--bg)" }}
      data-workspace-view-root
    >
      {/*
        Pre-paint view selection: runs synchronously during HTML parse,
        before any pixels are drawn. Reads ?view= from the URL, sets
        data-view on the root wrapper, and corrects aria-current on the
        static switcher tabs so the correct panel and active tab are
        visible on the very first frame — no flash, no hydration wait.

        Paired <style> block: hides non-matching panels when data-view is
        set (deep-linked non-overview views only — when there is no view
        param the attribute is absent and no CSS fires, so overview shows
        as the safe default).

        No-JS: script never runs → no data-view → overview shows (correct).
        Hydration: WorkspaceViewBody + WorkspaceViewSwitcher take over for
        subsequent in-page switching, making the data-view attribute and
        static aria-current values irrelevant.
      */}
      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
[data-workspace-view-root][data-view] [data-view-panel] { display: none; }
[data-workspace-view-root][data-view="overview"] [data-view-panel="overview"],
[data-workspace-view-root][data-view="roadmap"] [data-view-panel="roadmap"],
[data-workspace-view-root][data-view="milestones"] [data-view-panel="milestones"],
[data-workspace-view-root][data-view="schedule"] [data-view-panel="schedule"] { display: revert; }
`.trim(),
        }}
      />
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `(function(){try{
var m=location.search.match(/[?&]view=(roadmap|milestones|schedule)(?:&|$)/);
if(!m)return;
var v=m[1];
var root=document.querySelector('[data-workspace-view-root]');
if(!root)return;
root.setAttribute('data-view',v);
var tabs=root.querySelectorAll('[data-view-tab]');
for(var i=0;i<tabs.length;i++){
  var t=tabs[i];
  var tid=t.getAttribute('data-view-tab');
  if(tid===v){
    t.setAttribute('aria-current','page');
    t.style.color='#ffffff';
    t.style.background='var(--ink)';
  } else {
    t.removeAttribute('aria-current');
    t.style.color='var(--ink-quiet)';
    t.style.background='transparent';
  }
}
}catch(e){}})();`,
        }}
      />

      {/* Chrome: renders from the React-cached getWorkspace — no Turso
          round-trip beyond what generateMetadata already consumed.
          refusedCount=0 here; WorkspaceHeader will update when content
          resolves via the content well (nice-to-have detail, not blocking). */}
      <WorkspaceHeader workspace={workspace} refusedCount={0} />
      <ShortcutsOverlay />

      {/* Content well: draft gate + 4 heavy reads deferred to Suspense.
          The header above always paints first; the content area streams in
          behind it. Fallback scoped to the content well only (P1-3). */}
      <Suspense fallback={null}>
        <WorkspaceContentWell workspaceSlug={workspaceSlug} workspace={workspace} />
      </Suspense>
    </div>
  );
}

// ── Content-well fallback (RW-5) ─────────────────────────────────────────────
// Wordmark identity loader — replaces the prior SuiteLoaderField bare 12px dot
// (whose `var(--load-dot-size, 12px)` was visually swallowed by the cross-origin
// pre-CSS window, reading as a much larger circle to the visitor). Letters of
// "roadmap" rise with stagger; indigo dot lands with overshoot; canonical
// Roadmap sweep gesture continues during the wait. Server Component, zero JS.
function ContentWellFallback() {
  const word = "roadmap";
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper, #ffffff)",
        zIndex: 9999,
      }}
    >
      <span
        style={{
          fontFamily:
            'var(--font-geist-sans), "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          fontWeight: 600,
          fontSize: 36,
          letterSpacing: "-0.04em",
          lineHeight: 0.96,
          color: "var(--ink, #14151a)",
          display: "inline-flex",
          alignItems: "baseline",
          whiteSpace: "nowrap",
        }}
      >
        {word.split("").map((c, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              animation: `signal-letter-rise 280ms cubic-bezier(0.16,1,0.3,1) ${i * 55}ms both`,
            }}
          >
            {c}
          </span>
        ))}
        <span
          style={{
            display: "inline-block",
            width: 11,
            height: 11,
            maxWidth: 11,
            maxHeight: 11,
            borderRadius: "50%",
            background: "var(--indigo, #4f46e5)",
            marginLeft: 6,
            transform: "translateY(-2px)",
            flexShrink: 0,
            animation: `signal-dot-land 360ms cubic-bezier(0.34,1.56,0.64,1) ${word.length * 55 + 80}ms both, signal-roadmap-sweep 5.4s cubic-bezier(.22,.7,.2,1) ${word.length * 55 + 600}ms infinite`,
          }}
        />
      </span>
      <style>{`
        @keyframes signal-letter-rise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes signal-dot-land {
          0%   { opacity: 0; transform: translateY(-2px) scale(0.4); }
          60%  { opacity: 1; transform: translateY(-2px) scale(1.18); }
          100% { opacity: 1; transform: translateY(-2px) scale(1); }
        }
        @keyframes signal-roadmap-sweep {
          0%   { transform: translateY(-2px) translateX(0); opacity: 1; }
          60%  { transform: translateY(-2px) translateX(4px); opacity: 1; }
          62%  { transform: translateY(-2px) translateX(4px); opacity: 0; }
          70%  { transform: translateY(-2px) translateX(0);   opacity: 0; }
          78%  { transform: translateY(-2px) translateX(0);   opacity: 1; }
          100% { transform: translateY(-2px) translateX(0);   opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes signal-letter-rise {
            from { opacity: 1; transform: none; }
            to   { opacity: 1; transform: none; }
          }
          @keyframes signal-dot-land {
            from, to { opacity: 1; transform: translateY(-2px) scale(1); }
          }
          @keyframes signal-roadmap-sweep {
            from, to { transform: translateY(-2px); opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
}
// ── Content well ─────────────────────────────────────────────────────────────
// Async Server Component owning the draft/publish gate + the 4 heavy reads.
// Sits behind the Suspense boundary above. The WorkspaceHeader renders before
// this resolves (P1-3 fix).
//
// workspace is already resolved by the outer page component from the cache —
// passed down to avoid a second lookup while keeping the type narrowed.
async function WorkspaceContentWell({
  workspaceSlug,
  workspace,
}: {
  workspaceSlug: string;
  workspace: {
    ownerUserId: string;
    name: string;
    isDemo: boolean;
    description: string | null;
    slug: string;
    ownerName: string | null;
  };
}) {
  // Draft/publish gate (Layer 1 — seamless-ecosystem-2026-05-18).
  // Run in parallel to keep the happy path fast.
  //
  // Rule:
  //   - Published → everyone sees the roadmap.
  //   - Draft + owner (current authed user) → owner preview allowed.
  //   - Draft + non-owner (or logged out) → calm "Not published yet" content.
  //
  // This is NOT a login wall. Logged-out visitors to a draft workspace see
  // the friendly not-published message — not a sign-in redirect.
  const [published, currentUser] = await Promise.all([
    isWorkspacePublished(workspaceSlug),
    getCurrentUser(),
  ]);
  const isOwner = currentUser?.userId === workspace.ownerUserId;
  if (!published && !isOwner) {
    return (
      <>
        <DraftNotPublishedContent workspaceName={workspace.name} />
        <SiteFooter />
      </>
    );
  }

  // Single data fetch — all four views share this payload.
  // No per-view branching in the data layer; ISR remains intact.
  // effectiveNodes is included to support manual-only workspaces (D1 fix):
  // milestones created via "+ Add a milestone" live only in node_overlays,
  // not in the tasks table. getEffectiveNodesForWorkspace is React-cached so
  // this call deduplicates with any prior call in the same request.
  const [projects, allTasks, effectiveNodes, upcoming, lastUpdated] = await Promise.all([
    getProjectsForWorkspace(workspaceSlug),
    getTasksForWorkspace(workspaceSlug),
    getEffectiveNodesForWorkspace(workspaceSlug),
    getUpcomingTasks(workspaceSlug, 14),
    getLastUpdatedForWorkspace(workspaceSlug),
  ]);

  // Workspace-level status counts derived from the task list already fetched,
  // rather than a second full-table read (was getCountsForWorkspace).
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
  //
  // D1 fix: manual milestones (source="manual" in node_overlays, never
  // written to tasks) are not in allTasks. Merge them in from effectiveNodes
  // so manual-only workspaces render milestones on the public page.
  // Manual nodes are hidden=false (hidden ones are excluded by isWorkspacePublished
  // and the owner uses the curation surface to toggle them).
  const syncedMilestones = allTasks.filter(
    (t) => (t.kind === "milestone" || t.isLaunch) && t.status !== "refused",
  );
  // Ids of synced milestones already accounted for — prevents double-rendering
  // an effective node whose backing task row is already in syncedMilestones.
  const syncedMilestoneIds = new Set(syncedMilestones.map((t) => t.id));
  // Fabricate Task-shaped objects for manual nodes so all downstream consumers
  // (MilestoneCard, MilestoneMap, ScheduleView, right rail) work unchanged.
  // Only fields actually read by those consumers are populated; the rest get
  // safe zero-values. The first project slug is used as projectSlug because
  // manual nodes are workspace-scoped, not project-scoped at the DB level.
  const defaultProjectSlug = projects[0]?.slug ?? workspaceSlug;
  const manualMilestones: Task[] = effectiveNodes
    .filter(
      (n) =>
        n.source === "manual" &&
        !n.hidden &&
        n.status !== "refused" &&
        !syncedMilestoneIds.has(n.id),
    )
    .map((n) => ({
      id: n.id,
      projectSlug: defaultProjectSlug,
      workspaceSlug,
      title: n.title,
      description: "",
      status: n.status,
      phase: null,
      tier: null,
      assignee: "claude-code" as const,
      cycleLabel: null,
      targetDate: n.targetDate,
      sortOrder: n.sortOrder,
      kind: "milestone" as const,
      category: null,
      priority: null,
      blockerId: null,
      unblocks: null,
      weekHeading: null,
      channel: null,
      isLaunch: true,
      day: null,
      postingTime: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      completedAt: null,
    }));

  const milestones = [...syncedMilestones, ...manualMilestones].sort((a, b) => {
    if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate);
    if (a.targetDate) return -1;
    if (b.targetDate) return 1;
    return a.sortOrder - b.sortOrder;
  });

  // Un-shipped milestones with a date, in chronological order. The
  // page renders each item with a soft "→ for <milestone>" line pointing at
  // the earliest such milestone the item falls under (item.targetDate ≤
  // milestone.targetDate). Refused items skip the line entirely.
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

  // Blockers: status=blocked items. Surfaced as a card grid above the list.
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

  // D1 fix: a manual-only workspace has allTasks.length === 0 but has
  // visible effective nodes. hasItems gates the "Nothing here yet" path,
  // so we must include non-hidden effective nodes in the count.
  const visibleEffectiveNodes = effectiveNodes.filter((n) => !n.hidden);
  const hasItems = allTasks.length > 0 || visibleEffectiveNodes.length > 0;
  // isDemoWorkspace: reads the explicit schema flag, not a reserved-slug check.
  const isDemoWorkspace = workspace.isDemo;

  // The dial + Next-milestone lockup earn their hero placement only
  // when the workspace tells a *story* — not when it's just rendering a count.
  const hasMomentum = totalForProgress >= 5 || milestones.length > 0;

  // H1 always ends in a period — the rhythmic signature of the brand —
  // without doubling up when a workspace name already ends in one.
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

  // Serialisable inputs for the client visualisations:
  // Roadmap flow map: precompute milestoneFor() per task (fn can't cross RSC boundary).
  // Milestone map: precompute scope + feeding-item statuses per milestone.
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
    <>
      {isDemoWorkspace && (
        <div
          className="w-full border-b px-6 py-2 text-center text-[12px] text-ink-soft"
          style={{ background: "var(--bg-deep)", borderColor: "var(--line-soft)" }}
        >
          You&apos;re viewing a public demo workspace — this is what your roadmap could look like.
        </div>
      )}

      <main className="flex-1">
        {/* Hero — typographic title + meta strip + progress dial + view switcher */}
        <section className="border-b border-line-soft/60 px-6 pb-10 pt-12">
          <div className="mx-auto w-full max-w-[1240px]">
            <MetaStrip
              anchor={workspace.name}
              items={[
                dateRange ? `${formatShortDate(dateRange.from)} → ${formatShortDate(dateRange.to)}` : null,
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
                      useSearchParams() suspends until params are known.
                      The static fallback renders the nav in SSR HTML so
                      no-JS visitors see the tabs immediately. */}
                  <Suspense fallback={<WorkspaceViewSwitcherStatic workspaceSlug={workspaceSlug} />}>
                    <WorkspaceViewSwitcher workspaceSlug={workspaceSlug} />
                  </Suspense>
                </div>
              </div>

              {hasItems && totalForProgress > 0 ? (
                hasMomentum ? (
                  <div className="hidden flex-shrink-0 sm:block">
                    {/* CREATIVE_SPEC §1.4: one composed milestone emphasis block —
                        NextMilestoneStrip + ProgressRing collapsed into a single unit. */}
                    <MilestoneEmphasisBlock
                      milestones={milestones}
                      progress={progress}
                      totalForProgress={totalForProgress}
                      shipped={counts.shipped}
                    />
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
                own counts in-surface; the band there is redundant. */}
            {hasItems ? (
              <Suspense
                fallback={
                  // Wrap in data-view-panel="overview" so the pre-paint CSS
                  // rule hides the stats band when a non-overview view is
                  // deep-linked — consistent with OverviewOnly on the client.
                  <OverviewOnlyStatic>
                    <div
                      data-view-panel="overview"
                      className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-3"
                    >
                      {/* CREATIVE_SPEC §1.6: public view — all var(--ink), no tones.
                          "Blocked" in red is alarming to a recipient who doesn't
                          know what blocked means in this context. */}
                      <BigStat label="Total" value={counts.total} />
                      <BigStat label="Done" value={counts.shipped} />
                      <BigStat label="Doing" value={counts.inFlight} />
                      <BigStat label="Next" value={counts.next} />
                      {counts.blocked > 0 ? (
                        <BigStat label="Blocked" value={counts.blocked} />
                      ) : null}
                      {counts.refused > 0 ? (
                        <BigStat label="Won't do" value={counts.refused} />
                      ) : null}
                    </div>
                  </OverviewOnlyStatic>
                }
              >
                <OverviewOnly>
                  <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-3">
                    {/* CREATIVE_SPEC §1.6: public view — all var(--ink), no tones. */}
                    <BigStat label="Total" value={counts.total} />
                    <BigStat label="Done" value={counts.shipped} />
                    <BigStat label="Doing" value={counts.inFlight} />
                    <BigStat label="Next" value={counts.next} />
                    {counts.blocked > 0 ? (
                      <BigStat label="Blocked" value={counts.blocked} />
                    ) : null}
                    {counts.refused > 0 ? (
                      <BigStat label="Won't do" value={counts.refused} />
                    ) : null}
                  </div>
                </OverviewOnly>
              </Suspense>
            ) : null}
          </div>
        </section>

        {/* ── View body ─────────────────────────────────────────────────────── */}
        {!hasItems ? (
          // Published workspace with projects but no items yet (can occur if
          // the owner publishes right after content is removed). The prior copy
          // "Nothing yet. The owner is still drafting." is wrong here — the
          // owner is NOT drafting, the workspace is published. Calm, accurate.
          <section className="px-6 py-24 text-center">
            <div className="mx-auto max-w-md space-y-2">
              <p className="text-[15px] text-ink-soft">
                Nothing here yet.
              </p>
              <p className="text-[13px] text-ink-quiet">
                This page updates as the plan moves — check back, or bookmark it.
              </p>
            </div>
          </section>
        ) : (
          /* All four views are server-rendered once from the single data fetch;
             WorkspaceViewBody (client) shows the one matching ?view=.
             Suspense is required by useSearchParams. The static fallback
             renders the overview in SSR HTML so no-JS visitors see the full
             roadmap content immediately. */
          <Suspense
            fallback={
              // All four view panels are pre-rendered in the SSR HTML.
              // The pre-paint inline script + CSS selectively shows only the
              // panel that matches ?view=, so deep-linked views render
              // immediately without a flash or hydration wait.
              // No-JS visitors get the overview (safe default).
              <WorkspaceViewBodyStatic
                overview={
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
                }
                roadmap={
                  <RoadmapFlow
                    tasks={visibleTasks}
                    projects={projects}
                    milestoneLabels={milestoneLabels}
                  />
                }
                schedule={
                  <ScheduleView
                    tasks={visibleTasks}
                    milestones={milestones}
                    projects={projects}
                    projectMap={projectMap}
                  />
                }
                milestones={
                  milestones.length === 0 ? (
                    <section className="px-6 py-24 text-center">
                      <div className="mx-auto max-w-md space-y-2">
                        <p className="text-[15px] text-ink-soft">
                          No milestones yet.
                        </p>
                        <p className="text-[13px] text-ink-quiet">
                          This page updates as the plan moves — check back, or
                          bookmark it.
                        </p>
                      </div>
                    </section>
                  ) : (
                    <MilestoneMap
                      milestones={milestoneNodes}
                      projects={projects}
                    />
                  )
                }
              />
            }
          >
            <WorkspaceViewBody
              overview={
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
              }
              roadmap={
                <RoadmapFlow
                  tasks={visibleTasks}
                  projects={projects}
                  milestoneLabels={milestoneLabels}
                />
              }
              schedule={
                <ScheduleView
                  tasks={visibleTasks}
                  milestones={milestones}
                  projects={projects}
                  projectMap={projectMap}
                />
              }
              milestones={
                milestones.length === 0 ? (
                  <section className="px-6 py-24 text-center">
                    <div className="mx-auto max-w-md space-y-2">
                      <p className="text-[15px] text-ink-soft">
                        No milestones yet.
                      </p>
                      <p className="text-[13px] text-ink-quiet">
                        This page updates as the plan moves — check back, or
                        bookmark it.
                      </p>
                    </div>
                  </section>
                ) : (
                  <MilestoneMap
                    milestones={milestoneNodes}
                    projects={projects}
                  />
                )
              }
            />
          </Suspense>
        )}
      </main>

      <SiteFooter />
    </>
  );
}

// ── View: Overview ────────────────────────────────────────────────────────────
// The full layout: blockers, milestones, project cards, item list, right rail.
// Default when ?view= is absent.

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
                            {t.targetDate ? formatShortDate(t.targetDate) : null}
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

          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Shared sub-component ──────────────────────────────────────────────────────
// Item list grouped by project then week heading.

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

// ── Helpers ───────────────────────────────────────────────────────────────────

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

/**
 * Format ISO date as "Jun 12" — CREATIVE_SPEC §1.3.
 * Year shown only when it differs from the current calendar year.
 */
function formatShortDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const year = Number(m[1]);
  const d = new Date(year, Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(year !== new Date().getFullYear() ? { year: "numeric" } : {}),
  });
}

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

/**
 * CREATIVE_SPEC §1.4 — milestone emphasis block.
 * Collapses the prior NextMilestoneStrip + ProgressRing sibling pair into
 * one composed unit: eyebrow + title + date/count meta on the left,
 * 48px ProgressRing on the right. One block, not two widgets.
 *
 * Exact tokens from §1.4:
 *   padding: 16px 20px
 *   border: 1px solid var(--hairline)
 *   border-radius: 10px   (--r-3)
 *   background: var(--paper)
 *   min-width: 220px, max-width: 280px
 *
 * The T-N countdown number uses var(--accent) — one of six named indigo uses
 * (CREATIVE_SPEC §1.7). Everything else stays ink / ink-quiet.
 */
function MilestoneEmphasisBlock({
  milestones,
  progress,
  totalForProgress,
  shipped,
}: {
  milestones: Task[];
  progress: number;
  totalForProgress: number;
  shipped: number;
}) {
  const next = milestones.find(
    (m) => m.status !== "shipped" && m.targetDate,
  );
  // When there is no upcoming dated milestone, fall back to overall progress only.
  // §1.4 block still renders so the ring earns its hero placement.
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  const size = 48;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));

  const days = next?.targetDate ? daysUntilSimple(next.targetDate) : null;

  return (
    <div
      style={{
        padding: "16px 20px",
        border: "1px solid var(--hairline, #e4e4e7)",
        borderRadius: 10,
        background: "var(--paper, #ffffff)",
        minWidth: 220,
        maxWidth: 280,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Left: eyebrow + title + date meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Eyebrow — §1.4 exact token */}
        <div
          style={{
            fontFamily: "var(--font-mono-stack)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--ink-quiet)",
            marginBottom: 6,
          }}
        >
          Next milestone
        </div>

        {/* Title — §1.4: 15px / 600 / -0.02em */}
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {next?.title ?? "No upcoming milestone"}
        </div>

        {/* Date + count meta — §1.4 mono 11px, marginTop 4px */}
        <div
          style={{
            fontFamily: "var(--font-mono-stack)",
            fontSize: 11,
            color: "var(--ink-quiet)",
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {next?.targetDate ? (
            <>
              <span>{formatShortDate(next.targetDate)}</span>
              {days !== null ? (
                <span
                  style={{
                    // §1.4 + §1.7: T-N is the indigo use in this block.
                    color: days >= 0 ? "var(--accent, #4f46e5)" : "var(--ink-quiet)",
                    fontWeight: 600,
                  }}
                >
                  {days >= 0 ? `T-${days}` : `−${Math.abs(days)}d`}
                </span>
              ) : null}
            </>
          ) : null}
          <span>{totalForProgress > 0 ? `${shipped} of ${totalForProgress} shipped` : null}</span>
        </div>
      </div>

      {/* Right: 48px ProgressRing — inside the block per §1.4 */}
      <div
        role="img"
        aria-label={`Progress: ${pct}%`}
        style={{ position: "relative", flexShrink: 0, width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--line-soft)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--status-shipped)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono-stack)",
            fontSize: Math.round(size * 0.28),
            fontWeight: 600,
            color: "var(--ink)",
            lineHeight: 1,
          }}
        >
          {pct}
          <span style={{ fontSize: 8, opacity: 0.7, marginLeft: 1 }}>%</span>
        </span>
      </div>
    </div>
  );
}

// ── Draft / not-published content ─────────────────────────────────────────────
// Shown inside the content well (behind WorkspaceHeader) to non-owners
// visiting a draft workspace. Not a 404, not a login wall. Brand voice:
// plain English, no "error" framing, no sign-in invitation.
//
// The outer shell always renders WorkspaceHeader; this component only
// provides the content area message. LAYER0_ROUTE_ALLOWLIST.md §Roadmap.

function DraftNotPublishedContent({ workspaceName }: { workspaceName: string }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mx-auto max-w-sm">
        <p
          className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: "var(--ink-quiet)" }}
        >
          Not published yet
        </p>
        <h1
          className="mb-4 text-[clamp(1.75rem,1.4rem+1.5vw,2.5rem)] font-semibold leading-[1.1]"
          style={{ letterSpacing: "-0.035em", color: "var(--ink)" }}
        >
          {workspaceName}.
        </h1>
        <p
          className="mb-10 text-[15px] leading-[1.55]"
          style={{ color: "var(--ink-soft)" }}
        >
          This plan isn&apos;t public yet. The owner will share it when it&apos;s ready.
        </p>
      </div>
    </main>
  );
}
