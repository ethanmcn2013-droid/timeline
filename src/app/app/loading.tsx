/**
 * Authenticated app segment loading boundary (App Router).
 *
 * Renders a nav-skeleton + content shimmer instead of a blank white
 * frame during auth resolution and data fetches. Prevents the
 * sign-in flash (R5) by keeping the app chrome visible while the
 * server resolves the Clerk session.
 *
 * Gesture: sweep — dot tracks left→right on the wordmark.
 */
export default function AppLoading() {
  return (
    <div
      aria-label="Loading your workspace"
      role="status"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg, #ffffff)",
      }}
    >
      {/* App top bar skeleton — mirrors AppLayout chrome */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid var(--border, rgba(17,17,17,0.10))",
          background: "color-mix(in srgb, var(--bg, #fff) 85%, transparent)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            margin: "0 auto",
            maxWidth: "64rem",
            padding: "0 1.5rem",
            height: "3rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Wordmark with sweep animation */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "-0.05em",
              color: "var(--ink, #111111)",
              userSelect: "none",
            }}
          >
            roadmap
            <span
              className="roadmap-dot"
              aria-hidden
              style={{
                width: "clamp(4px, 0.30em, 8px)",
                height: "clamp(4px, 0.30em, 8px)",
              }}
            />
          </span>

          {/* Avatar placeholder */}
          <div
            aria-hidden
            className="skeleton-shimmer"
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "50%",
            }}
          />
        </div>
      </header>

      {/* Content shimmer */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          maxWidth: "64rem",
          width: "100%",
          margin: "0 auto",
          padding: "3rem 1.5rem",
          gap: "1rem",
        }}
      >
        {/* Title skeleton */}
        <div
          aria-hidden
          className="skeleton-shimmer"
          style={{
            height: "1.75rem",
            width: "12rem",
            borderRadius: "6px",
          }}
        />
        {/* Subtitle skeleton */}
        <div
          aria-hidden
          className="skeleton-shimmer"
          style={{
            height: "1rem",
            width: "8rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
          }}
        />
        {/* Row skeletons */}
        {[100, 85, 92].map((w, i) => (
          <div
            key={i}
            aria-hidden
            className="skeleton-shimmer"
            style={{
              height: "3.5rem",
              width: `${w}%`,
              borderRadius: "10px",
            }}
          />
        ))}
      </main>
    </div>
  );
}
