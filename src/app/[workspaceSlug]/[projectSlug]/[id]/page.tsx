import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  getWorkspace,
  getProject,
  getTask,
  getActivityForTask,
  getRefusedTasks,
} from "@/server/db/queries";
import { WorkspaceHeader } from "@/components/roadmap/workspace-header";
import { StatusPill } from "@/components/roadmap/status-pill";
import { KindPill } from "@/components/roadmap/kind-pill";
import { ActivityPanel } from "@/components/roadmap/activity-panel";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  isManualMilestoneId,
  milestoneAnchorId,
} from "@/components/roadmap/milestone-card";
import Link from "next/link";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    workspaceSlug: string;
    projectSlug: string;
    id: string;
  }>;
}): Promise<Metadata> {
  const { workspaceSlug, projectSlug, id } = await params;
  // Symmetry with the page redirect: a manual-milestone id has no task row;
  // signal the overview as the canonical destination via noindex so robots
  // don't waste a crawl on the about-to-redirect URL.
  if (isManualMilestoneId(id)) {
    return { title: "Timeline", robots: { index: false, follow: true } };
  }
  const task = await getTask(workspaceSlug, projectSlug, id);
  if (!task) return { title: "Not Found" };
  return {
    title: `${task.title} — Timeline`,
    description: task.description || undefined,
  };
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{
    workspaceSlug: string;
    projectSlug: string;
    id: string;
  }>;
}) {
  const { workspaceSlug, projectSlug, id } = await params;

  // Manual-milestone deep links pre-dating the in-page-anchor fix would land
  // here with a synthetic id and a `projects[0]` projectSlug — neither has a
  // backing tasks row to resolve. Redirect to the overview anchor instead of
  // 404'ing so external/shared links and crawlers degrade gracefully.
  if (isManualMilestoneId(id)) {
    redirect(`/${workspaceSlug}#${milestoneAnchorId(id)}`);
  }

  const [workspace, project, task, refused] = await Promise.all([
    getWorkspace(workspaceSlug),
    getProject(workspaceSlug, projectSlug),
    getTask(workspaceSlug, projectSlug, id),
    getRefusedTasks(workspaceSlug),
  ]);

  if (!workspace) notFound();
  if (!project) notFound();
  if (!task) notFound();

  const taskActivity = await getActivityForTask(workspaceSlug, task.id);

  const isDone = task.status === "shipped";

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      <WorkspaceHeader workspace={workspace} refusedCount={refused.length} />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-6 py-12">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-[11.5px] text-ink-quiet">
            <Link
              href={`/${workspaceSlug}`}
              className="transition-colors hover:text-ink"
            >
              {workspace.name}
            </Link>
            <span aria-hidden>/</span>
            <Link
              href={`/${workspaceSlug}/${projectSlug}`}
              className="transition-colors hover:text-ink"
            >
              {project.name}
            </Link>
            <span aria-hidden>/</span>
            <span className="max-w-[160px] truncate text-ink">{task.title}</span>
          </nav>

          {/* Task header */}
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusPill status={task.status} />
              <KindPill kind={task.kind} forceShow />
              {task.isLaunch ? (
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{
                    background: "var(--roadmap-violet-bg)",
                    color: "var(--roadmap-violet-fg)",
                  }}
                >
                  Launch
                </span>
              ) : null}
            </div>

            <h1
              className={
                "text-[clamp(1.5rem,1.2rem+2vw,2.25rem)] font-semibold tracking-[-0.02em] leading-[1.2] " +
                (isDone ? "text-ink-soft line-through" : "text-ink")
              }
            >
              {task.title}
            </h1>

            {/* Meta strip */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-quiet">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: project.accent }}
                />
                <Link
                  href={`/${workspaceSlug}/${projectSlug}`}
                  className="transition-colors hover:text-ink"
                >
                  {project.name}
                </Link>
              </span>
              {task.targetDate ? (
                <span className="tabular-nums">{task.targetDate}</span>
              ) : null}
              {task.weekHeading ? (
                <span>{task.weekHeading}</span>
              ) : null}
            </div>
          </header>

          {/* Description */}
          {task.description ? (
            <section className="mt-8">
              <p className="text-[15px] leading-[1.7] text-ink-soft whitespace-pre-wrap">
                {task.description}
              </p>
            </section>
          ) : null}

          {/* Activity */}
          <ActivityPanel events={taskActivity} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
