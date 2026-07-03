/**
 * Timeline /app loading boundary, wordmark identity loader.
 *
 * Paints during the cross-origin window when a sibling product hops to
 * /app on timeline.signalstudio.ie, replaces the bare indigo dot that
 * the pre-CSS first-paint would otherwise show. The deeper
 * `(app)/loading.tsx` skeleton continues to handle in-app sub-route
 * Suspense (e.g. /app → /app/plan/[slug]) where the persistent shell
 * is already mounted and shouldn't be covered.
 *
 * Server Component + one small client child (LongWaitStatus timer).
 *
 * Loading canon (2026-07-01 review):
 * - Visible loader name is `timeline`, never `roadmap` (canon law 4).
 * - Dot is 10px hard px (DESIGN.md §13.3 boundary authority).
 * - Wait gesture is the Timeline slide: the dot slides toward its seat
 *   and settles, motion toward a destination (BRAND.md §4).
 * - After a real 5s wait, one calm line appears with role="status".
 *
 * Reduced motion: letters appear fully, dot sits settled, no gesture.
 */
import { LongWaitStatus } from "@/components/system/long-wait-status";

export default function TimelineLoading() {
  const word = "timeline";
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper, #ffffff)",
        zIndex: 9999,
      }}
    >
      <span
        aria-hidden
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
            // 10px hard px, boundary-dot authority (DESIGN.md §13.3).
            display: "inline-block",
            width: 10,
            height: 10,
            maxWidth: 10,
            maxHeight: 10,
            borderRadius: "50%",
            background: "var(--indigo, #4f46e5)",
            marginLeft: 6,
            transform: "translateY(-2px)",
            flexShrink: 0,
            animation: `signal-dot-land 360ms cubic-bezier(0.34,1.56,0.64,1) ${word.length * 55 + 80}ms both, signal-timeline-slide 3.8s cubic-bezier(.16,1,.3,1) ${word.length * 55 + 600}ms infinite`,
          }}
        />
      </span>
      <LongWaitStatus line="Opening the timeline" />
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
        /* Timeline wait gesture, slide toward the seat, settle, hold.
           Motion toward a destination (BRAND.md §4), not a blink. */
        @keyframes signal-timeline-slide {
          0%   { transform: translateY(-2px) translateX(-8px); opacity: 0.35; }
          16%  { transform: translateY(-2px) translateX(0);    opacity: 1; }
          100% { transform: translateY(-2px) translateX(0);    opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes signal-letter-rise {
            from { opacity: 1; transform: none; }
            to   { opacity: 1; transform: none; }
          }
          @keyframes signal-dot-land {
            from, to { opacity: 1; transform: translateY(-2px) scale(1); }
          }
          @keyframes signal-timeline-slide {
            from, to { transform: translateY(-2px); opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
}
