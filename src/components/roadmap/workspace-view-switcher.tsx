"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGroup, motion } from "motion/react";
import type { WorkspaceView } from "@/components/showcase/types";

// The four public views. "Schedule" is the gated fast-follow (P5) — items on
// a real month axis by targetDate. Order here is the tab order.
const VIEWS: { id: WorkspaceView; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "roadmap", label: "Roadmap" },
  { id: "milestones", label: "Milestones" },
  { id: "schedule", label: "Schedule" },
];

type Props = {
  /** Current active view, derived server-side from the ?view= param. */
  activeView: WorkspaceView;
  /** The workspace slug, used to construct the URL. */
  workspaceSlug: string;
};

/**
 * Rounded-pill view switcher for the public workspace viewer.
 * Sits in the workspace hero header row near "Last updated".
 * Active pill: bg-ink text-white. Inactive: border-only.
 *
 * Implemented as a client island — reads and writes ?view= search param.
 * All view data is fetched server-side in a single pass; switching views
 * only changes which slice of that data renders (no extra fetches).
 * ISR (revalidate=300) is preserved: the page is NOT made dynamic.
 *
 * Navigation uses router.push with shallow=false (default) so the server
 * component re-renders with the new searchParam but the fetch is cached.
 */
export function WorkspaceViewSwitcher({ activeView, workspaceSlug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSwitch(view: WorkspaceView) {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "overview") {
      params.delete("view");
    } else {
      params.set("view", view);
    }
    const query = params.toString();
    router.push(`/${workspaceSlug}${query ? `?${query}` : ""}`, { scroll: false });
  }

  return (
    <LayoutGroup id="workspace-view-switcher">
      <div
        role="tablist"
        aria-label="View"
        className="relative inline-flex items-center gap-0.5 rounded-full border p-0.5"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--bg-elev)",
        }}
      >
        {VIEWS.map((item) => {
          const isActive = item.id === activeView;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSwitch(item.id)}
              className="relative inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium transition-colors"
              style={{
                color: isActive ? "#ffffff" : "var(--ink-quiet)",
              }}
            >
              {isActive ? (
                <motion.span
                  layoutId="workspace-view-switcher-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--ink)" }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              ) : null}
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
