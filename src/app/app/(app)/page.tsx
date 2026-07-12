import Link from "next/link";
import {
  requireUser,
  getCurrentWorkspace,
  resolveTimelineContext,
} from "@/server/auth";
import { getProjectsForWorkspace, isWorkspacePublished } from "@/server/db/queries";
import { resolveEntitlement } from "@/lib/entitlements-shared/reads";
import { TIER_LABEL } from "@/lib/entitlements-shared/tiers";
import { CreateWorkspaceForm } from "./_components/create-workspace-form";
import { CreateProjectForm } from "./_components/create-project-form";
import { PublishControl } from "./_components/publish-control";
import { TIMELINE_URL } from "@/lib/product-urls";

export const metadata = { title: "Dashboard, Timeline" };
export const dynamic = "force-dynamic";

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ workspaceId?: string; planningPeriodId?: string }>;
}) {
  const userId = await requireUser();
  const requested = await searchParams;
  const requestedWorkspaceId = requested.workspaceId?.trim();
  const resolvedContext = requestedWorkspaceId
    ? await resolveTimelineContext(
        userId,
        requestedWorkspaceId,
        requested.planningPeriodId?.trim(),
      )
    : null;
  if (requestedWorkspaceId && !resolvedContext) {
    return <UnavailableWorkspaceContext />;
  }
  const workspace = resolvedContext?.workspace ?? (await getCurrentWorkspace(userId));
  const contextQuery = resolvedContext
    ? `?workspaceId=${encodeURIComponent(resolvedContext.workspaceId)}${
        resolvedContext.planningPeriodId
          ? `&planningPeriodId=${encodeURIComponent(resolvedContext.planningPeriodId)}`
          : ""
      }`
    : "";

  // ── No workspace yet ────────────────────────────────────────────────────
  if (!workspace) {
    // Server-side check only, never expose env state to client JS.
    // When Upstash isn't configured in prod, checkRateLimit() fails closed
    // and would block every submit with a confusing message. Signal the
    // operator-side pause up front so the form reads honestly instead.
    const writesPaused =
      process.env.NODE_ENV === "production" &&
      !process.env.UPSTASH_REDIS_REST_URL;
    return <CreateWorkspaceForm writesPaused={writesPaused} />;
  }

  // ── Workspace exists, show dashboard ───────────────────────────────────
  const [projects, workspacePublished, { tier }] = await Promise.all([
    getProjectsForWorkspace(workspace.slug),
    isWorkspacePublished(workspace.slug),
    resolveEntitlement(userId),
  ]);
  const publicBase = process.env.NEXT_PUBLIC_SITE_URL ?? TIMELINE_URL;

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
          {/* Publish control, Layer 1 (seamless-ecosystem-2026-05-18); includes URL chip */}
          {/* id="publish": M4 nudge hash anchor, no smooth-scroll, native fragment jump */}
          <div id="publish" className="mt-3">
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--ink-soft)" }}
          >
            Projects
          </h2>
          <Link
            href={`/app/audience${contextQuery}`}
            className="rounded-lg border border-line-soft bg-white px-3 py-2 text-sm font-medium text-ink-soft hover:border-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Audience Timelines
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyProjects workspaceSlug={workspace.slug} />
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-2">
              {projects.map((p) => (
                <Link
                  key={p.slug}
                  href={`/app/plan/${p.slug}${contextQuery}`}
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

function UnavailableWorkspaceContext() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 items-center px-6 py-16 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-quiet">Workspace context</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-ink">That workspace is not available here.</h1>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          Timeline could not confirm a current Signal Tasks membership and local mapping. Return to Your Work and choose a workspace you can access.
        </p>
      </div>
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
        A project is one roadmap, one plan, one slice of work. Name it, mark
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
