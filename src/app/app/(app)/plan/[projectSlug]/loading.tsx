/**
 * H1 (roadmap-elevation): in-app loading boundary for /app/plan/[projectSlug].
 *
 * Fires on the /app → /app/plan/[projectSlug] transition (and cold-load of
 * the plan route) while the PlanPage RSC resolves its auth + DB queries.
 *
 * Renders in normal document flow, no fixed positioning, no z-index override,
 * no full-screen takeover. The (app) shell header from layout.tsx remains
 * visible and interactive above this content well.
 *
 * Container classes matched to plan/[projectSlug]/page.tsx:
 *   mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10
 *
 * Reduced-motion: .skeleton-shimmer degrades to a static var(--bg-deep)
 * block via the prefers-reduced-motion media query in globals.css, no
 * additional guard needed here.
 *
 * Server Component, no "use client", zero client JS.
 */
export default function PlanLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10"
      aria-hidden
    >
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-1.5">
        <div className="skeleton-shimmer h-3 w-20 rounded" />
        <div className="h-3 w-2 rounded" style={{ background: "var(--bg-deep)" }} />
        <div className="skeleton-shimmer h-3 w-28 rounded" />
      </div>

      {/* Title block skeleton */}
      <div className="mb-8 flex flex-col gap-2">
        <div className="skeleton-shimmer h-7 w-56 rounded" />
        <div className="skeleton-shimmer h-4 w-72 rounded" />
      </div>

      {/* Milestones section skeleton */}
      <div className="flex flex-col gap-3">
        <div className="skeleton-shimmer h-4 w-24 rounded" />
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border px-4 py-3"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="skeleton-shimmer h-4 w-4 flex-shrink-0 rounded" />
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="skeleton-shimmer h-3.5 w-48 rounded" />
              <div className="skeleton-shimmer h-3 w-32 rounded" />
            </div>
            <div className="skeleton-shimmer h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
