import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getWorkspace,
  getProjectsForWorkspace,
  getTasksForWorkspace,
  getCountsForWorkspace,
  getUpcomingTasks,
} from "@/server/db/queries";
import type { Task, Project } from "@/server/db/schema";
import { WorkspaceHeader } from "@/components/roadmap/workspace-header";
import { ProjectCard } from "@/components/roadmap/project-card";
import type { ProjectWithCounts } from "@/components/roadmap/project-card";
import { ItemRow } from "@/components/roadmap/item-row";
import { ShortcutsOverlay } from "@/components/roadmap/shortcuts-overlay";
import { SiteFooter } from "@/components/marketing/site-footer";
import Link from "next/link";

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
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;

  const workspace = await getWorkspace(workspaceSlug);
  if (!workspace) notFound();

  const [projects, allTasks, counts, upcoming] = await Promise.all([
    getProjectsForWorkspace(workspaceSlug),
    getTasksForWorkspace(workspaceSlug),
    getCountsForWorkspace(workspaceSlug),
    getUpcomingTasks(workspaceSlug, 7),
  ]);

  // Build project lookup maps
  const projectMap = new Map<string, Project>(projects.map((p) => [p.slug, p]));

  // Compute per-project counts
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

  // Group non-refused tasks by project then week heading
  const visibleTasks = allTasks.filter((t) => t.status !== "refused");
  const tasksByProject = new Map<string, Task[]>();
  for (const t of visibleTasks) {
    const arr = tasksByProject.get(t.projectSlug) ?? [];
    arr.push(t);
    tasksByProject.set(t.projectSlug, arr);
  }

  const hasItems = allTasks.length > 0;

  const isDemoWorkspace = workspace.slug === "tasks";

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      <WorkspaceHeader workspace={workspace} />
      {isDemoWorkspace && (
        <div
          className="w-full border-b px-6 py-2 text-center text-[12px] text-ink-soft"
          style={{ background: "var(--bg-deep)", borderColor: "var(--line-soft)" }}
        >
          You&apos;re viewing a public demo workspace — this is what your team&apos;s roadmap could look like.
        </div>
      )}
      <ShortcutsOverlay />

      <main className="flex-1">
        {/* Hero strip */}
        <section className="border-b border-line-soft/60 px-6 py-12">
          <div className="mx-auto w-full max-w-[1240px]">
            <h1 className="text-[clamp(2rem,2rem+2vw,3.5rem)] font-semibold tracking-[-0.03em] text-ink">
              {workspace.name}
            </h1>
            <p className="mt-3 max-w-xl text-[16px] leading-[1.55] text-ink-soft">
              {workspace.description?.trim() || `Where ${workspace.name} is going.`}
            </p>

            {/* Stats strip */}
            {hasItems ? (
              <div className="mt-8 flex flex-wrap gap-6">
                <StatChip label="Total" value={counts.total} />
                <StatChip label="Done" value={counts.shipped} tone="shipped" />
                <StatChip label="Doing" value={counts.inFlight} tone="flight" />
                <StatChip label="Blocked" value={counts.blocked} tone="blocked" />
                <StatChip
                  label="Won't do"
                  value={counts.refused}
                  tone="refused"
                />
              </div>
            ) : null}
          </div>
        </section>

        {!hasItems ? (
          /* Empty state */
          <section className="px-6 py-24 text-center">
            <div className="mx-auto max-w-md">
              <p className="text-[15px] text-ink-soft">
                Nothing yet. The owner is still drafting.
              </p>
            </div>
          </section>
        ) : (
          <div className="mx-auto w-full max-w-[1240px] px-6 py-12">
            <div className="flex gap-12 lg:gap-16">
              {/* Main body */}
              <div className="min-w-0 flex-1">
                {/* Project cards */}
                {projects.length > 1 ? (
                  <section className="mb-10">
                    <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
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
                {projects.map((project) => {
                  const projectTasks = tasksByProject.get(project.slug) ?? [];
                  if (projectTasks.length === 0) return null;

                  // Group by weekHeading
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
                            <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
                              {heading}
                            </div>
                          ) : null}
                          <ul className="overflow-hidden rounded-xl border border-line-soft">
                            {groupTasks.map((t) => (
                              <ItemRow
                                key={t.id}
                                task={t}
                                workspaceSlug={workspaceSlug}
                                projectAccent={project.accent}
                                projectName={project.name}
                                showProject={projects.length > 1}
                              />
                            ))}
                          </ul>
                        </div>
                      ))}
                    </section>
                  );
                })}
              </div>

              {/* Right rail */}
              <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
                <div className="sticky top-20 space-y-8">
                  {/* Coming up */}
                  {upcoming.length > 0 ? (
                    <section>
                      <h3 className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
                        Coming up
                      </h3>
                      <ul className="space-y-2">
                        {upcoming.map((t) => {
                          const proj = projectMap.get(t.projectSlug);
                          return (
                            <li key={t.id}>
                              <Link
                                href={`/${workspaceSlug}/${t.projectSlug}/${t.id}`}
                                className="group flex flex-col gap-0.5"
                              >
                                <span className="text-[12px] leading-[1.4] text-ink transition-colors group-hover:text-ink-soft line-clamp-2">
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

                  {/* Refusals link */}
                  {counts.refused > 0 ? (
                    <section>
                      <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
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

                  {/* Shortcuts hint */}
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
        )}
      </main>

      <SiteFooter />
    </div>
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

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "shipped" | "flight" | "blocked" | "refused";
}) {
  const colorMap = {
    shipped: { fg: "var(--status-shipped)", bg: "var(--status-shipped-bg)" },
    flight: { fg: "var(--status-flight)", bg: "var(--status-flight-bg)" },
    blocked: { fg: "var(--status-blocked)", bg: "var(--status-blocked-bg)" },
    refused: { fg: "var(--status-refused)", bg: "var(--status-refused-bg)" },
  };
  const colors = tone ? colorMap[tone] : null;

  return (
    <div
      className="flex flex-col gap-0.5 rounded-lg px-3 py-2"
      style={colors ? { background: colors.bg } : { background: "var(--bg-deep)" }}
    >
      <span
        className="text-[22px] font-semibold tabular-nums leading-none"
        style={colors ? { color: colors.fg } : { color: "var(--ink)" }}
      >
        {value}
      </span>
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.1em]"
        style={
          colors
            ? { color: colors.fg, opacity: 0.85 }
            : { color: "var(--ink-quiet)" }
        }
      >
        {label}
      </span>
    </div>
  );
}
