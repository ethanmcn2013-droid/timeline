import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getWorkspace,
  getProjectsForWorkspace,
  getRefusedTasks,
  isWorkspacePublished,
} from "@/server/db/queries";
import { getCurrentUser } from "@/server/auth";
import type { Project, Task } from "@/server/db/schema";
import { WorkspaceHeader } from "@/components/roadmap/workspace-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import Link from "next/link";

// Public refusals page — read-only. ISR matches the workspace and project
// pages (5-min window); revalidatePath on source-save covers fresh data.
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
    title: `What didn't make it · ${workspace.name} — Timeline`,
    description: `What ${workspace.name} said no to.`,
  };
}

export default async function RefusalsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;

  const workspace = await getWorkspace(workspaceSlug);
  if (!workspace) notFound();

  // Publish gate — mirrors WorkspaceContentWell in [workspaceSlug]/page.tsx.
  // Draft workspaces are only visible to their owner; non-owners (including
  // logged-out visitors) see notFound() rather than the refused-task list.
  const [published, currentUser] = await Promise.all([
    isWorkspacePublished(workspaceSlug),
    getCurrentUser(),
  ]);
  if (!published && currentUser?.userId !== workspace.ownerUserId) {
    notFound();
  }

  const [refused, projects] = await Promise.all([
    getRefusedTasks(workspaceSlug),
    getProjectsForWorkspace(workspaceSlug),
  ]);

  const projectMap = new Map<string, Project>(projects.map((p) => [p.slug, p]));

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--bg-deep)" }}
    >
      <WorkspaceHeader workspace={workspace} refusedCount={refused.length} />

      <main className="flex-1">
        {/* Hero — quieter than the main roadmap */}
        <section
          className="border-b px-6 py-12"
          style={{ borderColor: "color-mix(in srgb, var(--border) 50%, transparent)" }}
        >
          <div className="mx-auto w-full max-w-[1240px]">
            {/* Breadcrumb — reader vocabulary. "Refusals" is the operator's
                word; "What didn't make it" is the phrase the recipient
                already meets in the workspace right rail. One word, one
                source of truth across nav chip, breadcrumb, and title.
                (REVIEW Gap 4, L2.) */}
            <nav className="mb-4 flex items-center gap-1.5 text-[11.5px] text-ink-quiet">
              <Link
                href={`/${workspaceSlug}`}
                className="transition-colors hover:text-ink"
              >
                {workspace.name}
              </Link>
              <span aria-hidden>/</span>
              <span className="text-ink">What didn&rsquo;t make it</span>
            </nav>

            {/* MetaStrip cut — this surface has no timeline or count rhythm
                to anchor, so the uppercase mono row was pure decoration. The
                H1 carries the meaning on its own. (REVIEW Gap 4, L2.) */}

            <h1 className="text-[clamp(1.75rem,1.5rem+2vw,3rem)] font-semibold tracking-[-0.03em] text-ink-soft">
              What didn&rsquo;t make it.
            </h1>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1240px] px-6 py-12">
          {refused.length === 0 ? (
            <p className="text-[14px] text-ink-quiet">No no&rsquo;s yet.</p>
          ) : (
            <ul className="space-y-2">
              {refused.map((task) => {
                const project = projectMap.get(task.projectSlug);
                return (
                  <RefusalRow
                    key={task.id}
                    task={task}
                    workspaceSlug={workspaceSlug}
                    projectName={project?.name ?? task.projectSlug}
                    projectAccent={project?.accent ?? "var(--ink-quiet)"}
                  />
                );
              })}
            </ul>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function RefusalRow({
  task,
  workspaceSlug,
  projectName,
  projectAccent,
}: {
  task: Task;
  workspaceSlug: string;
  projectName: string;
  projectAccent: string;
}) {
  return (
    <li className="group flex items-start gap-3 rounded-xl border border-line-soft bg-bg-elevated/60 px-4 py-3 transition-all hover:bg-bg-elevated">
      {/* Project accent dot */}
      <span
        aria-hidden
        className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full opacity-50"
        style={{ background: projectAccent }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <Link
            href={`/${workspaceSlug}/${task.projectSlug}`}
            className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint transition-colors hover:text-ink-quiet"
          >
            {projectName}
          </Link>
          {task.targetDate ? (
            <span className="text-[10.5px] tabular-nums text-ink-faint">
              {task.targetDate}
            </span>
          ) : null}
        </div>
        <Link
          href={`/${workspaceSlug}/${task.projectSlug}/${task.id}`}
          className="mt-0.5 block text-[13px] font-medium tracking-[-0.005em] text-ink-quiet line-through transition-colors hover:text-ink-soft"
        >
          {task.title}
        </Link>
        {task.description ? (
          <p className="mt-1 text-[11.5px] leading-[1.5] text-ink-faint">
            {task.description}
          </p>
        ) : null}
      </div>
    </li>
  );
}
