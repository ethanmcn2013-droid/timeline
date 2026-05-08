import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser, getCurrentWorkspace } from "@/server/auth";
import {
  getProjectsForWorkspace,
  getProjectSource,
} from "@/server/db/queries";
import { SourceEditor } from "./_components/source-editor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  return { title: `Source — ${projectSlug} — Roadmap` };
}

export default async function SourcePage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const userId = await requireUser();
  const workspace = await getCurrentWorkspace(userId);

  if (!workspace) {
    // No workspace yet — shouldn't normally be reachable but handle it.
    notFound();
  }

  // Verify the project belongs to this workspace
  const projects = await getProjectsForWorkspace(workspace.slug);
  const project = projects.find((p) => p.slug === projectSlug);
  if (!project) notFound();

  const source = await getProjectSource(projectSlug, workspace.slug);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-quiet)" }}>
        <Link
          href="/app"
          className="transition-colors hover:text-ink"
          style={{ color: "var(--ink-soft)" }}
        >
          {workspace.name}
        </Link>
        <span aria-hidden>/</span>
        <span style={{ color: "var(--ink)" }}>{project.name}</span>
        <span aria-hidden>/</span>
        <span>source</span>
      </nav>

      {/* Heading */}
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ letterSpacing: "-0.025em", color: "var(--ink)" }}
        >
          {project.name}
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--ink-soft)" }}
        >
          Markdown source
        </p>
      </div>

      <SourceEditor
        projectSlug={projectSlug}
        workspaceSlug={workspace.slug}
        initialContent={source?.rawMarkdown ?? ""}
        initialLastParsedAt={source?.lastParsedAt?.toISOString() ?? null}
        initialCount={null}
      />
    </div>
  );
}
