import Link from "next/link";
import type { Workspace } from "@/server/db/schema";
import { SuiteLauncher } from "@/components/suite-launcher";
import { WorkspaceAuthControls } from "./workspace-auth-controls";

/**
 * Slim public header for the workspace roadmap surface.
 * Shows workspace identity + Roadmap product wordmark.
 * Replaces the marketing SiteNav on workspace-scoped pages.
 *
 * Layer 4 (seamless-ecosystem-2026-05-18): Added WorkspaceAuthControls
 * island — when authed, the owner sees an "Edit" shortcut and the Clerk
 * UserButton with the "View public site" escape hatch. Guests see nothing
 * in that position (minimal public UX unchanged).
 *
 * ClerkProvider wraps so the child client island can read auth state.
 * The public /{workspaceSlug} route doesn't have ClerkProvider in its
 * layout (root layout is auth-agnostic), so it's scoped here.
 *
 * refusedCount: gate the "What didn't make it" nav link — only show
 * it when there are actually refused items. Forwarded stakeholders
 * (e.g. a couple receiving a plan) should never see a dead link.
 */
export function WorkspaceHeader({
  workspace,
  refusedCount = 0,
}: {
  workspace: Workspace;
  refusedCount?: number;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-line-soft/60 bg-bg/85 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-12 w-full max-w-[1240px] items-center justify-between px-6">
        {/* Left: workspace identity */}
        <div className="flex items-center gap-3">
          <Link
            href={`/${workspace.slug}`}
            className="flex items-center gap-2 hover:opacity-80"
            style={{ transition: "opacity var(--motion-fast) var(--ease-standard)" }}
          >
            <span
              className="inline-block h-5 w-5 rounded-md"
              style={{ background: "var(--brand)" }}
              aria-hidden
            />
            <span className="text-[14px] font-semibold tracking-[-0.01em] text-ink">
              {workspace.name}
            </span>
          </Link>
          <span className="hidden text-[11px] text-ink-faint sm:inline">
            /{workspace.slug}
          </span>
        </div>

        {/* Right: nav links + suite launcher + product wordmark + auth controls */}
        <div className="flex items-center gap-4">
          <Link
            href={`/${workspace.slug}/update?source=roadmap_share&segment=general&role=viewer&campaign=collaboration_proof&artefact=shared_update`}
            className="hidden text-[12px] text-ink-quiet hover:text-ink sm:inline"
            style={{ transition: "color var(--motion-fast) var(--ease-standard)" }}
          >
            Shared update
          </Link>
          {refusedCount > 0 ? (
            <Link
              href={`/${workspace.slug}/refusals`}
              aria-label={`What didn't make it — ${refusedCount} item${refusedCount === 1 ? "" : "s"} we said no to`}
              className="hidden items-center gap-1.5 rounded-full border border-line-soft/70 bg-bg-elevated/40 px-2.5 py-1 text-[11px] font-medium tracking-[-0.005em] text-ink-quiet transition-colors hover:border-line-soft hover:bg-bg-elevated hover:text-ink sm:inline-flex"
              style={{ transition: "color var(--motion-fast) var(--ease-standard), background var(--motion-fast) var(--ease-standard), border-color var(--motion-fast) var(--ease-standard)" }}
            >
              <span>What didn&rsquo;t make it</span>
              <span
                aria-hidden
                className="inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums text-ink-faint"
                style={{ background: "color-mix(in srgb, var(--ink-faint) 18%, transparent)" }}
              >
                {refusedCount}
              </span>
            </Link>
          ) : null}
          {/* P2-4 fix: SuiteLauncher IS the product identity anchor — it shows
              "signal studio." and contains the roadmap entry in its menu.
              The standalone <Wordmark> duplicated "roadmap." in the same
              header row, creating a double-brand strip. One identity element
              per header is the IA_COHERENCE.md canon. */}
          <div className="hidden sm:inline-flex">
            <SuiteLauncher current="roadmap" />
          </div>
          {/* Auth-aware owner controls — client island, renders nothing for guests */}
          <WorkspaceAuthControls ownerUserId={workspace.ownerUserId} />
        </div>
      </div>
    </header>
  );
}
