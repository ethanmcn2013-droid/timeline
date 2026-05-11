import Link from "next/link";
import type { Workspace } from "@/server/db/schema";
import { Wordmark } from "@/components/brand/wordmark";

/**
 * Slim public header for the workspace roadmap surface.
 * Shows workspace identity + Roadmap product wordmark.
 * Replaces the marketing SiteNav on workspace-scoped pages.
 */
export function WorkspaceHeader({ workspace }: { workspace: Workspace }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line-soft/60 bg-bg/85 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-12 w-full max-w-[1240px] items-center justify-between px-6">
        {/* Left: workspace identity */}
        <div className="flex items-center gap-3">
          <Link
            href={`/${workspace.slug}`}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
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

        {/* Right: Roadmap wordmark + sign-in */}
        <div className="flex items-center gap-4">
          <Link
            href={`/${workspace.slug}/update?source=roadmap_share&segment=general&role=viewer&campaign=collaboration_proof&artefact=shared_update`}
            className="hidden text-[12px] text-ink-quiet transition-colors hover:text-ink sm:inline"
          >
            Update
          </Link>
          <Link
            href={`/${workspace.slug}/refusals`}
            className="hidden text-[12px] text-ink-quiet transition-colors hover:text-ink sm:inline"
          >
            Refusals
          </Link>
          <Wordmark size="sm" href="/" />
        </div>
      </div>
    </header>
  );
}
