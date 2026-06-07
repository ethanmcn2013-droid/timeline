import {
  DatePrecisionChip,
  type DatePrecision,
} from "@/components/roadmap/date-precision";

/**
 * Walkover row 3 (Dalí, 2026-06-07): a true Schedule view on /demo.
 *
 * A horizontal time-spine. Today is a vertical hairline. Items 'Now' sit
 * on or straddling the seam; 'Soon' items sit to the right at full
 * opacity; 'Later' items recede into perspective (reduced contrast,
 * smaller dot). 'Done' items sit to the left, dissolved into the bone
 * paper.
 *
 * No JS animation. Pure SSR + CSS opacity. Reduced-motion respects the
 * static state by default — there is no motion to suppress.
 */

export type SpineLane = "Done" | "Now" | "Soon" | "Later";

export type SpineItem = {
  id: string;
  title: string;
  lane: SpineLane;
  when?: DatePrecision;
};

type Props = {
  items: SpineItem[];
};

/**
 * Lane positions on the spine. The seam (Today) sits at 50%. Done is
 * left; Now straddles; Soon is right of seam; Later recedes further.
 */
const LANE_X: Record<SpineLane, number> = {
  Done: 12,
  Now: 50,
  Soon: 72,
  Later: 90,
};

const LANE_OPACITY: Record<SpineLane, number> = {
  Done: 0.38,
  Now: 1,
  Soon: 0.78,
  Later: 0.55,
};

export function ScheduleSpine({ items }: Props) {
  // Stable lane order for stacking.
  const grouped = (["Done", "Now", "Soon", "Later"] as const).map((lane) => ({
    lane,
    items: items.filter((it) => it.lane === lane),
  }));

  return (
    <section
      aria-label="Schedule"
      className="reveal relative"
      style={{
        animationDelay: "0ms",
      }}
    >
      <div
        className="mb-4 flex items-baseline gap-3"
        style={{
          borderTop: "1px solid var(--line-soft)",
          paddingTop: 20,
        }}
      >
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
          Schedule
        </h2>
        <span className="text-[11.5px] text-ink-faint">
          The whole plan, on one line. Today is the seam.
        </span>
      </div>

      {/* The spine itself: SVG-backed hairline + lane markers.
          Height accommodates four lanes of pip + title. */}
      <div
        className="relative"
        style={{
          height: 132,
          background:
            "linear-gradient(to right, var(--paper-bone) 0%, transparent 22%, transparent 78%, var(--paper-bone) 100%)",
          borderRadius: "var(--r-3, 12px)",
          padding: "16px 12px",
          overflow: "hidden",
        }}
      >
        {/* Horizontal spine */}
        <div
          aria-hidden
          className="absolute"
          style={{
            left: 12,
            right: 12,
            top: "50%",
            height: 1,
            background:
              "linear-gradient(to right, transparent, var(--line-soft) 12%, var(--line-soft) 88%, transparent)",
          }}
        />

        {/* Today hairline — the only piece of colour */}
        <div
          aria-hidden
          className="absolute"
          style={{
            left: "50%",
            top: 8,
            bottom: 8,
            width: 1,
            transform: "translateX(-0.5px)",
            background:
              "linear-gradient(to bottom, transparent 0%, var(--brand, #4f46e5) 18%, var(--brand, #4f46e5) 82%, transparent 100%)",
          }}
        />
        <span
          aria-hidden
          className="absolute font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em]"
          style={{
            left: "50%",
            top: -2,
            transform: "translateX(-50%)",
            color: "var(--brand, #4f46e5)",
          }}
        >
          Today
        </span>

        {/* Lane labels — quiet, behind the items */}
        {(["Done", "Now", "Soon", "Later"] as const).map((lane) => (
          <span
            key={`label-${lane}`}
            aria-hidden
            className="absolute font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em]"
            style={{
              left: `${LANE_X[lane]}%`,
              bottom: 4,
              transform: "translateX(-50%)",
              color: "var(--ink-faint)",
            }}
          >
            {lane}
          </span>
        ))}

        {/* Item pips. Each pip sits on the spine; title floats above. */}
        {grouped.flatMap(({ lane, items: laneItems }) => {
          const baseX = LANE_X[lane];
          // Within a lane, fan items vertically so titles do not collide.
          return laneItems.map((it, i) => {
            const fanOffset = (i - (laneItems.length - 1) / 2) * 22;
            const top = `calc(50% + ${fanOffset}px)`;
            const opacity = LANE_OPACITY[lane];

            return (
              <div
                key={it.id}
                className="absolute flex items-center gap-2"
                style={{
                  left: `${baseX}%`,
                  top,
                  transform: "translate(-50%, -50%)",
                  opacity,
                  maxWidth: 200,
                }}
              >
                <span
                  aria-hidden
                  className="block rounded-full"
                  style={{
                    width: lane === "Now" ? 8 : 6,
                    height: lane === "Now" ? 8 : 6,
                    flexShrink: 0,
                    background:
                      lane === "Now"
                        ? "var(--aud-wedding, #b8865e)"
                        : "var(--ink-soft)",
                    boxShadow:
                      lane === "Now"
                        ? "0 0 0 3px color-mix(in srgb, var(--aud-wedding, #b8865e) 18%, transparent)"
                        : "none",
                  }}
                />
                <span
                  className="truncate text-[12px] font-medium"
                  style={{
                    color: "var(--ink)",
                    letterSpacing: "-0.005em",
                  }}
                >
                  {it.title}
                </span>
              </div>
            );
          });
        })}
      </div>

      {/* Below-spine legend for date precision — repurposes the row-7
          primitive so readers learn the glyph vocabulary in context. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px]">
        <span className="text-ink-quiet">When-glyphs:</span>
        <DatePrecisionChip
          precision={{ kind: "exact", value: "exact" }}
          tone="quiet"
        />
        <DatePrecisionChip
          precision={{ kind: "window", value: "window" }}
          tone="quiet"
        />
        <DatePrecisionChip precision={{ kind: "pending" }} tone="quiet" />
      </div>
    </section>
  );
}
