/**
 * H1 (roadmap-elevation): in-app loading boundary for the (app) route group.
 *
 * Replaces the SuiteLoaderField re-export. SuiteLoaderField is
 * position:fixed; inset:0; z-index:9999, a full-screen takeover that
 * covers the persistent (app) shell on every /app → /app/plan/[projectSlug]
 * transition, negating the route-group win.
 *
 * This component renders in normal document flow (no fixed positioning,
 * no z-index override) below the persistent shell header. The shell
 * remains visible and interactive while page RSCs resolve.
 *
 * Container classes matched to (app)/page.tsx:
 *   mx-auto w-full max-w-4xl px-6 py-12
 *
 * Reduced-motion: .skeleton-shimmer degrades to a static var(--bg-deep)
 * block via the prefers-reduced-motion media query in globals.css, no
 * additional guard needed here.
 *
 * Server Component, no "use client", zero client JS.
 */
export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12" aria-hidden>
      {/* Workspace header skeleton */}
      <div className="mb-10 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="skeleton-shimmer h-3 w-20 rounded" />
          <div className="skeleton-shimmer h-7 w-48 rounded" />
          <div className="skeleton-shimmer mt-1 h-4 w-32 rounded" />
        </div>
        <div className="skeleton-shimmer mt-1 h-5 w-16 rounded-full" />
      </div>

      {/* Projects section skeleton */}
      <section>
        <div className="mb-4">
          <div className="skeleton-shimmer h-3.5 w-14 rounded" />
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border px-4 py-3.5"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex flex-col gap-1.5">
                <div className="skeleton-shimmer h-3.5 w-36 rounded" />
                <div className="skeleton-shimmer h-3 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
