/**
 * Root-level loading boundary (App Router).
 *
 * Renders the Roadmap sweep gesture on paper white during any
 * top-level route transition. The dot is px-clamped so it cannot
 * balloon before the font stack resolves.
 *
 * Gesture: sweep — dot tracks left→right, 5.4s cubic-bezier(.22,.7,.2,1).
 * Class: .roadmap-dot  Keyframes: roadmap-dot-sweep  (globals.css)
 */
export default function RootLoading() {
  return (
    <div
      aria-label="Loading"
      role="status"
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg, #ffffff)",
      }}
    >
      {/* Wordmark-sized sweep indicator: px-clamped so em never inherits
          an unhydrated font size and the dot stays ≤8px tall. */}
      <span
        aria-hidden
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          fontSize: "18px",        /* fixed — matches Wordmark size="md" */
          fontWeight: 600,
          letterSpacing: "-0.05em",
          color: "var(--ink, #111111)",
          userSelect: "none",
        }}
      >
        roadmap
        <span
          className="roadmap-dot"
          style={{
            /* Hard px ceiling — overrides the 0.30em value so it can never
               scale above 8px regardless of inherited font size. */
            width: "clamp(4px, 0.30em, 8px)",
            height: "clamp(4px, 0.30em, 8px)",
          }}
        />
      </span>
    </div>
  );
}
