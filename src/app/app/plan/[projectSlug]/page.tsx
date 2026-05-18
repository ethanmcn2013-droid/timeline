import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser, getCurrentWorkspace } from "@/server/auth";
import {
  getProjectsForWorkspace,
  getEffectiveNodesForWorkspace,
  isWorkspacePublished,
} from "@/server/db/queries";
import { CurationSurface } from "./_components/curation-surface";
import { ROADMAP_URL } from "@/lib/product-urls";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  return { title: `Plan — ${projectSlug} — Roadmap` };
}

export default async function PlanPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const userId = await requireUser();
  const workspace = await getCurrentWorkspace(userId);

  if (!workspace) notFound();

  // Verify the project belongs to this workspace
  const projects = await getProjectsForWorkspace(workspace.slug);
  const project = projects.find((p) => p.slug === projectSlug);
  if (!project) notFound();

  const [effectiveNodes, workspacePublished] = await Promise.all([
    getEffectiveNodesForWorkspace(workspace.slug),
    isWorkspacePublished(workspace.slug),
  ]);

  const publicBase = process.env.NEXT_PUBLIC_SITE_URL ?? ROADMAP_URL;
  const publicUrl = `${publicBase}/${workspace.slug}`;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10">
      {/* Breadcrumb */}
      <nav
        className="mb-6 flex items-center gap-1.5 text-xs"
        style={{ color: "var(--ink-quiet)" }}
      >
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
        <span>plan</span>
      </nav>

      {/* Heading */}
      <div className="mb-8">
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
          Curate your milestones. Only published items reach the shared link.
        </p>
      </div>

      {/* Curation surface */}
      <CurationSurface
        initialNodes={effectiveNodes}
        workspaceSlug={workspace.slug}
        projectSlug={projectSlug}
        isPublished={workspacePublished}
        publicUrl={publicUrl}
      />
    </div>
  );
}
