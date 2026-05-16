import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getWorkspace,
  getProject,
  getTasksForProject,
} from "@/server/db/queries";
import type { Task } from "@/server/db/schema";
import { BigStat } from "@/components/roadmap/big-stat";
import { WorkspaceHeader } from "@/components/roadmap/workspace-header";
import { ItemRow } from "@/components/roadmap/item-row";
import { MetaStrip } from "@/components/roadmap/meta-strip";
import { ShortcutsOverlay } from "@/components/roadmap/shortcuts-overlay";
import { SiteFooter } from "@/components/marketing/site-footer";
import Link from "next/link";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectSlug: string }>;
}): Promise<Metadata> {
  const { workspaceSlug, projectSlug } = await params;
  const [workspace, project] = await Promise.all([
    getWorkspace(workspaceSlug),
    getProject(workspaceSlug, projectSlug),
  ]);
  if (!workspace || !project) return { title: "Not Found" };
  return {
    title: `${project.name} · ${workspace.name} — Roadmap`,
    description: project.oneLiner || `Roadmap for ${project.name}.`,
  };
}

export default async function ProjectDrillDownPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectSlug: string }>;
}) {
  const { workspaceSlug, projectSlug } = await params;

  const [workspace, project] = await Promise.all([
    getWorkspace(workspaceSlug),
    getProject(workspaceSlug, projectSlug),
  ]);

  if (!workspace) notFound();
  if (!project) notFound();

  const allTasks = await getTasksForProject(workspaceSlug, projectSlug);
  const visibleTasks = allTasks.filter((t) => t.status !== "refused");
  const refusedCount = allTasks.filter((t) => t.status === "refused").length;

  const groups = groupByWeek(visibleTasks);

  // Per-status counts
  const shipped = allTasks.filter((t) => t.status === "shipped").length;
  const inFlight = allTasks.filter((t) => t.status === "in-flight").length;
  const blocked = allTasks.filter((t) => t.status === "blocked").length;
  const next = allTasks.filter((t) => t.status === "next").length;

  // Meta-strip data — same shape as the workspace surface, scoped
  // to this project's slice of items. Carries the brand's steady
  // pulse-rhythm across surfaces (see docs/REVIEW_2026_05_12.md §5.2).
  const datedTasks = allTasks
    .filter((t) => t.targetDate && t.status !== "refused")
    .map((t) => t.targetDate!);
  const dateRange = datedTasks.length
    ? {
        from: datedTasks.reduce((a, b) => (a < b ? a : b)),
        to: datedTasks.reduce((a, b) => (a > b ? a : b)),
      }
    : null;
  const milestonesInProject = allTasks.filter(
    (t) =>
      (t.kind === "milestone" || t.isLaunch) && t.status !== "refused",
  ).length;

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      <WorkspaceHeader workspace={workspace} />
      <ShortcutsOverlay />

      <main className="flex-1">
        {/* Project hero */}
        <section
          className="border-b border-line-soft/60 px-6 py-12"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${project.accent} 6%, var(--bg)) 0%, var(--bg) 60%)`,
          }}
        >
          <div className="mx-auto w-full max-w-[1240px]">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-1.5 text-[11.5px] text-ink-quiet">
              <Link
                href={`/${workspaceSlug}`}
                className="transition-colors hover:text-ink"
              >
                {workspace.name}
              </Link>
              <span aria-hidden>/</span>
              <span className="text-ink">{project.name}</span>
            </nav>

            <MetaStrip
              anchor={project.name}
              items={[
                dateRange ? `${dateRange.from} → ${dateRange.to}` : null,
                dateRange
                  ? `${weeksBetween(dateRange.from, dateRange.to)} weeks`
                  : null,
                milestonesInProject > 0
                  ? `${milestonesInProject} milestone${milestonesInProject === 1 ? "" : "s"}`
                  : null,
              ]}
            />

            <div className="flex items-start gap-4">
              <div
                aria-hidden
                className="mt-1 h-8 w-1.5 flex-shrink-0 rounded-full"
                style={{ background: project.accent }}
              />
              <div>
                <h1 className="text-[clamp(1.75rem,1.5rem+2vw,3rem)] font-semibold tracking-[-0.03em] text-ink">
                  {/[.!?]$/.test(project.name) ? project.name : `${project.name}.`}
                </h1>
                {project.oneLiner ? (
                  <p className="mt-2 max-w-lg text-[15px] leading-[1.55] text-ink-soft">
                    {project.oneLiner}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Status row — BigStat tabular treatment, parity with the
                workspace surface so the visual register is consistent
                across all workspace-scoped heroes. */}
            {allTasks.length > 0 ? (
              <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-3">
                <BigStat label="Total" value={allTasks.length} />
                {shipped > 0 ? (
                  <BigStat label="Done" value={shipped} tone="shipped" />
                ) : null}
                {inFlight > 0 ? (
                  <BigStat label="Doing" value={inFlight} tone="flight" />
                ) : null}
                {next > 0 ? <BigStat label="Next" value={next} /> : null}
                {blocked > 0 ? (
                  <BigStat label="Blocked" value={blocked} tone="blocked" />
                ) : null}
                {refusedCount > 0 ? (
                  <Link
                    href={`/${workspaceSlug}/refusals`}
                    className="transition-colors"
                  >
                    <BigStat
                      label="Won't do"
                      value={refusedCount}
                      tone="refused"
                    />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1240px] px-6 py-12">
          {visibleTasks.length === 0 ? (
            <p className="text-[14px] text-ink-quiet">
              Nothing here yet. The owner is still drafting.
            </p>
          ) : (
            <div className="space-y-8">
              {groups.map(({ heading, tasks: groupTasks }) => (
                <section key={heading ?? "__none__"}>
                  {heading ? (
                    <h2 className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
                      {heading}
                    </h2>
                  ) : null}
                  <ul className="overflow-hidden rounded-xl border border-line-soft">
                    {groupTasks.map((t) => (
                      <ItemRow
                        key={t.id}
                        task={t}
                        workspaceSlug={workspaceSlug}
                        projectAccent={project.accent}
                        projectName={project.name}
                        showProject={false}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function weeksBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso + "T00:00:00Z").getTime();
  const to = new Date(toIso + "T00:00:00Z").getTime();
  return Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24 * 7)));
}

function groupByWeek(tasks: Task[]): { heading: string | null; tasks: Task[] }[] {
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
