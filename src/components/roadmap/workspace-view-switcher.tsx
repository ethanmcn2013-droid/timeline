"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { WorkspaceView } from "@/components/showcase/types";

// The two public views. Order here is the tab order. "gantt" is the default
// (bare URL); "timeline" is the single deep-linkable ?view= value.
const VIEWS: { id: WorkspaceView; label: string }[] = [
  { id: "gantt", label: "Gantt" },
  { id: "timeline", label: "Timeline" },
];

/**
 * Server-safe (no useSearchParams) version of the view switcher.
 * Used as the Suspense fallback so the nav renders in SSR HTML and is
 * visible without JavaScript.
 *
 * The SSR output defaults to Overview as the active tab (correct for the
 * no-JS / no-param case). An inline script (injected early in the page)
 * reads `location.search` before first paint and corrects both `aria-current`
 * and the visual active-pill style on the matching `data-view-tab` anchor —
 * so a deep-linked `?view=schedule` URL shows "Schedule" as active
 * immediately with correct WCAG 4.1.2 semantics, before hydration.
 *
 * The client version (WorkspaceViewSwitcher) takes over once JS hydrates.
 */
export function WorkspaceViewSwitcherStatic({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  function hrefFor(view: WorkspaceView): string {
    if (view === "gantt") return `/${workspaceSlug}`;
    return `/${workspaceSlug}?view=${view}`;
  }

  return (
    <nav aria-label="Workspace view">
      <div
        className="relative inline-flex items-center gap-0.5 rounded-full border p-0.5"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--bg-elev)",
        }}
      >
        {VIEWS.map((item) => {
          // SSR default: gantt is active. The inline pre-paint script corrects
          // aria-current + visual state for a deep-linked ?view=timeline before
          // the browser renders the first frame.
          const isActive = item.id === "gantt";
          return (
            <a
              key={item.id}
              href={hrefFor(item.id)}
              aria-current={isActive ? "page" : undefined}
              data-view-tab={item.id}
              className="view-switcher-link relative inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium"
              style={{
                color: isActive ? "#ffffff" : "var(--ink-quiet)",
                background: isActive ? "var(--ink)" : "transparent",
              }}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

type Props = {
  /** The workspace slug, used to construct the URL. */
  workspaceSlug: string;
};

/**
 * Rounded-pill view switcher for the public workspace viewer.
 * Sits in the workspace hero header row near "Last updated".
 * Active pill: bg-ink text-white. Inactive: border-only.
 *
 * Implemented as plain anchor links pointing at ?view=<id> so it works
 * without JavaScript and is correctly indexable. The server reads the
 * ?view= param via WorkspaceViewBody (client), which keeps ISR intact —
 * the route still caches by pathname only.
 *
 * aria-current="page" marks the active link. No role=tablist/tab: those
 * roles require a true in-place tabpanel contract (aria-controls, JS-only
 * panel swap) — this switcher changes the URL, not a panel, so nav links
 * are the correct semantic.
 */
export function WorkspaceViewSwitcher({ workspaceSlug }: Props) {
  const searchParams = useSearchParams();
  const rawView = searchParams.get("view");
  const activeView: WorkspaceView = rawView === "timeline" ? "timeline" : "gantt";

  function hrefFor(view: WorkspaceView): string {
    if (view === "gantt") return `/${workspaceSlug}`;
    return `/${workspaceSlug}?view=${view}`;
  }

  return (
    <nav aria-label="Workspace view">
      <div
        className="relative inline-flex items-center gap-0.5 rounded-full border p-0.5"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--bg-elev)",
        }}
      >
        {VIEWS.map((item) => {
          const isActive = item.id === activeView;
          return (
            // P1-5 fix: <Link> with scroll={false} + replace so tab switches
            // are client-side URL updates, never full page reloads. Plain
            // <a> tags caused full navigations → loading.tsx triggered → white
            // flash on every tab switch. scroll={false} preserves position.
            <Link
              key={item.id}
              href={hrefFor(item.id)}
              scroll={false}
              replace
              aria-current={isActive ? "page" : undefined}
              data-view-tab={item.id}
              className="view-switcher-link relative inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium"
              style={{
                color: isActive ? "#ffffff" : "var(--ink-quiet)",
                background: isActive ? "var(--ink)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
