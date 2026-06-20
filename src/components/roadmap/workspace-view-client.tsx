"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { WorkspaceView } from "@/components/showcase/types";

/**
 * Client-side view selection for the public workspace viewer.
 *
 * Why this exists: the page used to read `?view=` server-side via
 * `searchParams`, which silently opted the whole route OUT of ISR —
 * every visit to a shared roadmap link ran 4 uncached Turso round-trips.
 * ISR also caches by *pathname only*, so `?view=schedule` and the bare
 * URL are the same cache entry anyway. The only design that gives both
 * real caching AND deep-linkable views is: render every view server-side
 * once (ISR-cached), then pick which one is visible on the client from
 * the search param. That is what these two components do.
 */

// ── Server-safe (no useSearchParams) fallbacks ───────────────────────────────
// These are NOT "use client" — they are plain functions imported from a
// "use client" module boundary, which Next.js allows: the file is the
// client boundary, but these particular exports use no client-only APIs.
// They exist solely as Suspense fallbacks so SSR / JS-disabled visitors
// see the overview content and nav without waiting for client hydration.

/**
 * Renders both view panels in SSR HTML.
 *
 * Each panel carries a `data-view-panel` attribute. A paired CSS rule
 * (in [workspaceSlug]/page.tsx) hides the timeline panel by default and
 * shows the gantt panel, so the bare URL renders the Gantt view even with
 * no JS. An inline pre-paint script reads `location.search`; when it sees
 * `?view=timeline` it sets `data-view="timeline"` on the root wrapper, and
 * the CSS flips which panel shows — no flash, no hydration dependency.
 *
 * Once the client hydrates, `WorkspaceViewBody` takes over and handles
 * subsequent in-page switching.
 */
export function WorkspaceViewBodyStatic({
  gantt,
  timeline,
}: {
  gantt: ReactNode;
  timeline: ReactNode;
}) {
  return (
    <>
      <div data-view-panel="gantt">{gantt}</div>
      <div data-view-panel="timeline">{timeline}</div>
    </>
  );
}

function activeViewFrom(raw: string | null): WorkspaceView {
  return raw === "timeline" ? "timeline" : "gantt";
}

/** Picks which pre-rendered view body to show. Both are server-rendered from
 *  the same single data fetch and passed in as already-built nodes; this only
 *  toggles visibility. */
export function WorkspaceViewBody({
  gantt,
  timeline,
}: {
  gantt: ReactNode;
  timeline: ReactNode;
}) {
  const view = activeViewFrom(useSearchParams().get("view"));
  if (view === "timeline") return <>{timeline}</>;
  return <>{gantt}</>;
}
