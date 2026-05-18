import Link from "next/link";
import { formatRelative } from "@/lib/format";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WorkspaceHeader } from "@/components/roadmap/workspace-header";
import { InvitedByBar } from "@/components/roadmap/invited-by-bar";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  buildSharedUpdate,
  type SharedUpdateTone,
} from "@/lib/roadmap/shared-update";
import {
  getDemoSharedUpdateDataset,
} from "@/lib/roadmap/demo-data";
import {
  getLastUpdatedForWorkspace,
  getProjectsForWorkspace,
  getTasksForWorkspace,
  getUpcomingTasks,
  getWorkspace,
  isWorkspacePublished,
} from "@/server/db/queries";
import { getCurrentUser } from "@/server/auth";
import type { Project, Task, Workspace } from "@/server/db/schema";

// Public shared-update page — read-only. ISR with a 5-min window matches
// the workspace and project pages; revalidatePath on source-save covers
// fresh data immediately. The tracking searchParams do not branch the
// data fetch so ISR is preserved.
export const revalidate = 300;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}): Promise<Metadata> {
  const { workspaceSlug } = await params;
  const workspace = await getWorkspaceForMetadata(workspaceSlug);
  if (!workspace) return { title: "Not Found" };

  return {
    title: `${workspace.name} update — Roadmap`,
    description: `A plain-English update for ${workspace.name}.`,
    openGraph: {
      title: `${workspace.name} update`,
      description: `A plain-English update for ${workspace.name}.`,
      type: "article",
    },
  };
}

async function getWorkspaceForMetadata(workspaceSlug: string) {
  try {
    return (await getWorkspace(workspaceSlug)) ?? getDemoSharedUpdateDataset(workspaceSlug)?.workspace ?? null;
  } catch {
    return getDemoSharedUpdateDataset(workspaceSlug)?.workspace ?? null;
  }
}

export default async function SharedUpdatePage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: SearchParams;
}) {
  const { workspaceSlug } = await params;
  const trackingParams = await searchParams;

  const dataset = await loadSharedUpdateDataset(workspaceSlug);
  if (!dataset) notFound();

  const { workspace, projects, tasks, upcoming } = dataset;

  // For invited-by bar; safe with the demo-dataset fallback since
  // getLastUpdatedForWorkspace returns null when the workspace has no
  // tasks rather than throwing.
  let lastUpdated: Date | null = null;
  try {
    lastUpdated = await getLastUpdatedForWorkspace(workspaceSlug);
  } catch {
    lastUpdated = null;
  }
  const lastUpdatedLabel = lastUpdated ? formatRelative(lastUpdated) : null;

  const projectMap = new Map(projects.map((project) => [project.slug, project]));
  const update = buildSharedUpdate({
    workspace,
    projects,
    tasks,
    upcoming,
    searchParams: trackingParams,
  });

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      <WorkspaceHeader workspace={workspace} />
      <InvitedByBar workspace={workspace} lastUpdatedLabel={lastUpdatedLabel} />

      <main className="flex-1">
        <section className="border-b border-line-soft/70 px-6 py-12">
          <div className="mx-auto grid w-full max-w-[1180px] gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <nav className="mb-5 flex items-center gap-1.5 text-[11.5px] text-ink-quiet">
                <Link href={`/${workspaceSlug}`} className="transition-colors hover:text-ink">
                  {workspace.name}
                </Link>
                <span aria-hidden>/</span>
                <span className="text-ink">Shared update</span>
              </nav>

              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
                Shared update
              </p>
              <h1 className="max-w-3xl text-[clamp(2rem,1.65rem+2vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-ink">
                {workspace.name}
              </h1>
              <p className="mt-4 max-w-2xl text-[16px] leading-[1.6] text-ink-soft">
                {update.summary}
              </p>
            </div>

            <div className="rounded-2xl border border-line-soft bg-bg-elevated p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
                    Current state
                  </p>
                  <p className="mt-1 text-[24px] font-semibold tracking-[-0.025em] text-ink">
                    {update.state.label}
                  </p>
                </div>
                <StateDot tone={update.state.tone} />
              </div>
              <p className="text-[13px] leading-[1.55] text-ink-soft">
                {update.state.detail}
              </p>
              {update.nextClearStep ? (
                <div className="mt-5 border-t border-line-soft pt-4">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
                    Next clear step
                  </p>
                  <ItemLink
                    task={update.nextClearStep}
                    project={projectMap.get(update.nextClearStep.projectSlug)}
                    workspaceSlug={workspaceSlug}
                    compact
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="px-6 py-10">
          <div className="mx-auto grid w-full max-w-[1180px] gap-6 lg:grid-cols-3">
            <UpdateCard
              title="Now"
              empty="Nothing is visibly in motion yet."
              items={update.focus}
              projectMap={projectMap}
              workspaceSlug={workspaceSlug}
            />
            <UpdateCard
              title="Needs attention"
              empty="Nothing is visibly held up."
              items={update.needsAttention}
              projectMap={projectMap}
              workspaceSlug={workspaceSlug}
              tone="attention"
            />
            <UpdateCard
              title="Next"
              empty="No next step has been published yet."
              items={update.nextUp}
              projectMap={projectMap}
              workspaceSlug={workspaceSlug}
            />
          </div>
        </section>

        <section className="border-t border-line-soft/70 px-6 py-10">
          <div className="mx-auto grid w-full max-w-[1180px] gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
                    Plan snapshot
                  </p>
                  <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.025em] text-ink">
                    Where the work stands
                  </h2>
                </div>
                <Link
                  href={`/${workspaceSlug}`}
                  className="hidden text-[12px] font-medium text-ink-quiet underline underline-offset-4 transition-colors hover:text-ink sm:inline"
                >
                  Open full roadmap
                </Link>
              </div>

              {update.projects.length > 0 ? (
                <div className="grid gap-3">
                  {update.projects.map((snapshot) => (
                    <ProjectSnapshot key={snapshot.project.slug} snapshot={snapshot} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-line-soft bg-bg-elevated p-6 text-[14px] text-ink-quiet">
                  No projects have been published yet.
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-line-soft bg-bg-elevated p-5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
                  What changed
                </p>
                {update.recentlyDone.length > 0 ? (
                  <ul className="mt-3 space-y-3">
                    {update.recentlyDone.map((task) => (
                      <li key={task.id}>
                        <ItemLink
                          task={task}
                          project={projectMap.get(task.projectSlug)}
                          workspaceSlug={workspaceSlug}
                          compact
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-[13px] leading-[1.55] text-ink-soft">
                    No finished work is visible on this update yet.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-line-soft bg-bg-elevated p-5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
                  Safe to share
                </p>
                <p className="mt-3 text-[13px] leading-[1.6] text-ink-soft">
                  This page is read-only and only uses visible roadmap items.
                  Private notes and internal work are not included here.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-t border-line-soft/70 px-6 py-10">
          <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 rounded-2xl border border-line-soft bg-bg-elevated p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
                Created with Signal Studio
              </p>
              <p className="mt-2 max-w-xl text-[15px] leading-[1.6] text-ink-soft">
                Clear workspaces for people who need the plan without anything
                to decode.
              </p>
            </div>
            <Link
              href={update.studioUrl}
              className="inline-flex items-center justify-center rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
              See Signal Studio
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

async function loadSharedUpdateDataset(
  workspaceSlug: string,
): Promise<{
  workspace: Workspace;
  projects: Project[];
  tasks: Task[];
  upcoming: Task[];
} | null> {
  try {
    const workspace = await getWorkspace(workspaceSlug);
    if (!workspace) return getDemoSharedUpdateDataset(workspaceSlug);

    // Publish gate — mirrors WorkspaceContentWell in [workspaceSlug]/page.tsx.
    // Draft workspaces are only visible to their owner; non-owners (including
    // logged-out visitors) receive null, which the caller converts to notFound().
    const [published, currentUser] = await Promise.all([
      isWorkspacePublished(workspaceSlug),
      getCurrentUser(),
    ]);
    if (!published && currentUser?.userId !== workspace.ownerUserId) {
      return null;
    }

    const [projects, tasks, upcoming] = await Promise.all([
      getProjectsForWorkspace(workspaceSlug),
      getTasksForWorkspace(workspaceSlug),
      getUpcomingTasks(workspaceSlug, 14),
    ]);

    return { workspace, projects, tasks, upcoming };
  } catch (error) {
    const fallback = getDemoSharedUpdateDataset(workspaceSlug);
    if (fallback) return fallback;
    throw error;
  }
}

function UpdateCard({
  title,
  empty,
  items,
  projectMap,
  workspaceSlug,
  tone = "clear",
}: {
  title: string;
  empty: string;
  items: Task[];
  projectMap: Map<string, Project>;
  workspaceSlug: string;
  tone?: SharedUpdateTone;
}) {
  return (
    <section className="rounded-2xl border border-line-soft bg-bg-elevated p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        <StateDot tone={tone} small />
      </div>
      {items.length > 0 ? (
        <ul className="space-y-4">
          {items.map((task) => (
            <li key={task.id}>
              <ItemLink
                task={task}
                project={projectMap.get(task.projectSlug)}
                workspaceSlug={workspaceSlug}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] leading-[1.55] text-ink-soft">{empty}</p>
      )}
    </section>
  );
}

function ItemLink({
  task,
  project,
  workspaceSlug,
  compact = false,
}: {
  task: Task;
  project: Project | undefined;
  workspaceSlug: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/${workspaceSlug}/${task.projectSlug}/${task.id}`}
      className="group block"
    >
      <span
        className={
          compact
            ? "text-[13px] font-medium leading-[1.4] text-ink transition-colors group-hover:text-ink-soft"
            : "text-[14px] font-medium leading-[1.4] text-ink transition-colors group-hover:text-ink-soft"
        }
      >
        {task.title}
      </span>
      <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-quiet">
        {project ? <span>{project.name}</span> : null}
        {task.targetDate ? (
          <>
            <span aria-hidden>·</span>
            <span className="tabular-nums">{task.targetDate}</span>
          </>
        ) : null}
      </span>
    </Link>
  );
}

function ProjectSnapshot({
  snapshot,
}: {
  snapshot: {
    project: Project;
    total: number;
    done: number;
    doing: number;
    next: number;
    blocked: number;
    progress: number;
  };
}) {
  return (
    <Link
      href={`/${snapshot.project.workspaceSlug}/${snapshot.project.slug}`}
      className="grid gap-4 rounded-2xl border border-line-soft bg-bg-elevated p-5 transition-colors hover:border-ink-quiet/40 md:grid-cols-[minmax(0,1fr)_220px]"
    >
      <div>
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2 w-2 rounded-full"
            style={{ background: snapshot.project.accent }}
          />
          <h3 className="text-[16px] font-semibold text-ink">
            {snapshot.project.name}
          </h3>
        </div>
        {snapshot.project.oneLiner ? (
          <p className="mt-2 text-[13px] leading-[1.55] text-ink-soft">
            {snapshot.project.oneLiner}
          </p>
        ) : null}
      </div>
      <div className="self-center">
        <div className="mb-2 flex items-center justify-between text-[11px] text-ink-quiet">
          <span>{snapshot.progress}% done</span>
          <span>{snapshot.total} visible items</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg-deep">
          <div
            className="h-full rounded-full"
            style={{
              width: `${snapshot.progress}%`,
              background: snapshot.project.accent,
            }}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[10.5px] text-ink-quiet">
          <span>{snapshot.doing} doing</span>
          <span>{snapshot.next} next</span>
          {snapshot.blocked > 0 ? (
            <span style={{ color: "var(--status-blocked)" }}>
              {snapshot.blocked} held up
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function StateDot({
  tone,
  small = false,
}: {
  tone: SharedUpdateTone;
  small?: boolean;
}) {
  const color =
    tone === "attention"
      ? "var(--status-blocked)"
      : tone === "clear"
        ? "var(--status-shipped)"
        : "var(--ink-quiet)";

  return (
    <span
      className={small ? "h-2.5 w-2.5 rounded-full" : "h-3 w-3 rounded-full"}
      style={{
        background: color,
        boxShadow: `0 0 0 5px color-mix(in srgb, ${color} 14%, transparent)`,
      }}
      aria-hidden
    />
  );
}

// formatRelative extracted to src/lib/format.ts — Phase 11.3
