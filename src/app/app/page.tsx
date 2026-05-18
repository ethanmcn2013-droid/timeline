import Link from "next/link";
import { requireUser, getCurrentWorkspace } from "@/server/auth";
import { getProjectsForWorkspace, isWorkspacePublished } from "@/server/db/queries";
import { resolveEntitlement } from "@/lib/entitlements-shared/reads";
import { TIER_LABEL } from "@/lib/entitlements-shared/tiers";
import { CreateWorkspaceForm } from "./_components/create-workspace-form";
import { CreateProjectForm } from "./_components/create-project-form";
import { PublishControl } from "./_components/publish-control";
import { ROADMAP_URL } from "@/lib/product-urls";

export const metadata = { title: "Dashboard — Roadmap" };
export const dynamic = "force-dynamic";

export default async function AppPage() {
  const userId = await requireUser();
  const workspace = await getCurrentWorkspace(userId);

  // ── No workspace yet ────────────────────────────────────────────────────
  if (!workspace) {
    return <CreateWorkspaceForm />;
  }

  // ── Workspace exists — show dashboard ───────────────────────────────────
  const [projects, workspacePublished, { tier }] = await Promise.all([
    getProjectsForWorkspace(workspace.slug),
    isWorkspacePublished(workspace.slug),
    resolveEntitlement(userId),
  ]);
  const publicBase = process.env.NEXT_PUBLIC_SITE_URL ?? ROADMAP_URL;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      {/* Workspace header */}
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--brand)", letterSpacing: "0.12em" }}
          >
            Workspace
          </p>
          <h1
            className="text-3xl font-semibold"
            style={{ letterSpacing: "-0.03em", color: "var(--ink)" }}
          >
            {workspace.name}
          </h1>
          {/* Publish control — Layer 1 (seamless-ecosystem-2026-05-18); includes URL chip */}
          <div className="mt-3">
            <PublishControl
              workspaceSlug={workspace.slug}
              initialPublished={workspacePublished}
              publicUrl={`${publicBase}/${workspace.slug}`}
            />
          </div>
        </div>
        <span
          className="mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            background: "var(--brand-soft)",
            color: "var(--brand-deep)",
          }}
        >
          {TIER_LABEL[tier]}
        </span>
      </div>

      {/* Project list */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--ink-soft)" }}
          >
            Projects
          </h2>
        </div>

        {projects.length === 0 ? (
          <EmptyProjects workspaceSlug={workspace.slug} />
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-2">
              {projects.map((p) => (
                <Link
                  key={p.slug}
                  href={`/app/plan/${p.slug}`}
                  className="flex items-center justify-between rounded-xl border px-4 py-3.5 hover:border-indigo-300"
                  style={{
                    background: "var(--bg-elev)",
                    borderColor: "var(--border)",
                    transition: "border-color var(--motion-base) var(--ease-standard)",
                  }}
                >
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--ink)" }}
                    >
                      {p.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--ink-quiet)" }}
                    >
                      /{p.slug}
                    </p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "var(--ink-quiet)" }}
                    aria-hidden
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>

            {/* Inline create form below the list */}
            <AddProjectPanel workspaceSlug={workspace.slug} />
          </>
        )}
      </section>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function EmptyProjects({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <div
      className="rounded-xl border px-6 py-10 text-center"
      style={{
        borderColor: "var(--border)",
        borderStyle: "dashed",
        background: "var(--bg-deep)",
      }}
    >
      <p
        className="mb-1 text-sm font-medium"
        style={{ color: "var(--ink-soft)" }}
      >
        Add your first project
      </p>
      <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--ink-quiet)" }}>
        A project is one roadmap — one plan, one slice of work. Name it, mark
        tasks as milestones in Signal Tasks, and you&apos;ll have a public link to share.
      </p>
      <CreateProjectForm workspaceSlug={workspaceSlug} />
    </div>
  );
}

function AddProjectPanel({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <details className="group">
      <summary
        className="cursor-pointer list-none text-sm font-medium"
        style={{ color: "var(--brand)" }}
      >
        + Add project
      </summary>
      <div
        className="mt-4 rounded-xl border p-5"
        style={{
          background: "var(--bg-elev)",
          borderColor: "var(--border)",
        }}
      >
        <CreateProjectForm workspaceSlug={workspaceSlug} />
      </div>
    </details>
  );
}
