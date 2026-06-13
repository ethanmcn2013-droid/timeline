/**
 * Roadmap /app loading boundary — wordmark identity loader.
 *
 * Paints during the cross-origin window when a sibling product hops to
 * /app on timeline.signalstudio.ie — replaces the bare indigo dot that
 * the pre-CSS first-paint would otherwise show. The deeper
 * `(app)/loading.tsx` skeleton continues to handle in-app sub-route
 * Suspense (e.g. /app → /app/plan/[slug]) where the persistent shell
 * is already mounted and shouldn't be covered.
 *
 * Server Component, zero JS, inlined keyframes.
 *
 * Choreography: letters of "roadmap" rise with stagger, indigo dot
 * lands as the period with overshoot bounce, then the canonical Roadmap
 * sweep gesture continues — same as the live product surface.
 */
export default function RoadmapLoading() {
  const word = "roadmap";
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper, #ffffff)",
        zIndex: 9999,
      }}
    >
      <span
        style={{
          fontFamily:
            'var(--font-geist-sans), "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          fontWeight: 600,
          fontSize: 36,
          letterSpacing: "-0.04em",
          lineHeight: 0.96,
          color: "var(--ink, #14151a)",
          display: "inline-flex",
          alignItems: "baseline",
          whiteSpace: "nowrap",
        }}
      >
        {word.split("").map((c, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              animation: `signal-letter-rise 280ms cubic-bezier(0.16,1,0.3,1) ${i * 55}ms both`,
            }}
          >
            {c}
          </span>
        ))}
        <span
          style={{
            display: "inline-block",
            width: 11,
            height: 11,
            maxWidth: 11,
            maxHeight: 11,
            borderRadius: "50%",
            background: "var(--indigo, #4f46e5)",
            marginLeft: 6,
            transform: "translateY(-2px)",
            flexShrink: 0,
            animation: `signal-dot-land 360ms cubic-bezier(0.34,1.56,0.64,1) ${word.length * 55 + 80}ms both, signal-roadmap-sweep 5.4s cubic-bezier(.22,.7,.2,1) ${word.length * 55 + 600}ms infinite`,
          }}
        />
      </span>
      <style>{`
        @keyframes signal-letter-rise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes signal-dot-land {
          0%   { opacity: 0; transform: translateY(-2px) scale(0.4); }
          60%  { opacity: 1; transform: translateY(-2px) scale(1.18); }
          100% { opacity: 1; transform: translateY(-2px) scale(1); }
        }
        @keyframes signal-roadmap-sweep {
          0%   { transform: translateY(-2px) translateX(0); opacity: 1; }
          60%  { transform: translateY(-2px) translateX(4px); opacity: 1; }
          62%  { transform: translateY(-2px) translateX(4px); opacity: 0; }
          70%  { transform: translateY(-2px) translateX(0);   opacity: 0; }
          78%  { transform: translateY(-2px) translateX(0);   opacity: 1; }
          100% { transform: translateY(-2px) translateX(0);   opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes signal-letter-rise {
            from { opacity: 1; transform: none; }
            to   { opacity: 1; transform: none; }
          }
          @keyframes signal-dot-land {
            from, to { opacity: 1; transform: translateY(-2px) scale(1); }
          }
          @keyframes signal-roadmap-sweep {
            from, to { transform: translateY(-2px); opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
}
