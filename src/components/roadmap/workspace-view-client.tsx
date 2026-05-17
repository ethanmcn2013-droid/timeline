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

/** Renders children unconditionally — the no-JS baseline for the stats band. */
export function OverviewOnlyStatic({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * Renders all four view panels in SSR HTML.
 *
 * Each panel carries a `data-view-panel` attribute. An inline script
 * (injected early in the page, before first paint) reads `location.search`,
 * sets `data-view="<active>"` on the nearest ancestor wrapper, and a paired
 * CSS rule hides every panel whose `data-view-panel` does not match. This
 * means a deep-linked `?view=schedule` URL shows the schedule panel
 * immediately — no flash, no hydration dependency.
 *
 * When JS is absent (or no `view` param is present) there is no
 * `data-view` attribute, so no CSS rule fires and the overview panel
 * renders normally — the safe, correct default.
 *
 * Once the client hydrates, `WorkspaceViewBody` takes over and handles
 * subsequent in-page switching.
 */
export function WorkspaceViewBodyStatic({
  overview,
  roadmap,
  milestones,
  schedule,
}: {
  overview: ReactNode;
  roadmap?: ReactNode;
  milestones?: ReactNode;
  schedule?: ReactNode;
}) {
  return (
    <>
      <div data-view-panel="overview">{overview}</div>
      {roadmap !== undefined && (
        <div data-view-panel="roadmap">{roadmap}</div>
      )}
      {milestones !== undefined && (
        <div data-view-panel="milestones">{milestones}</div>
      )}
      {schedule !== undefined && (
        <div data-view-panel="schedule">{schedule}</div>
      )}
    </>
  );
}

function activeViewFrom(raw: string | null): WorkspaceView {
  return raw === "roadmap" || raw === "milestones" || raw === "schedule"
    ? raw
    : "overview";
}

/** Renders children only when the active view is "overview". Used for the
 *  hero stats band, which the three map views carry in-surface instead. */
export function OverviewOnly({ children }: { children: ReactNode }) {
  const view = activeViewFrom(useSearchParams().get("view"));
  if (view !== "overview") return null;
  return <>{children}</>;
}

/** Picks which pre-rendered view body to show. All four are
 *  server-rendered from the same single data fetch and passed in as
 *  already-built nodes; this only toggles visibility. */
export function WorkspaceViewBody({
  overview,
  roadmap,
  milestones,
  schedule,
}: {
  overview: ReactNode;
  roadmap: ReactNode;
  milestones: ReactNode;
  schedule: ReactNode;
}) {
  const view = activeViewFrom(useSearchParams().get("view"));
  if (view === "milestones") return <>{milestones}</>;
  if (view === "schedule") return <>{schedule}</>;
  if (view === "roadmap") return <>{roadmap}</>;
  return <>{overview}</>;
}
