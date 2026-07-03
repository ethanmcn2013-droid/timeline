/**
 * Typed date-precision primitive.
 *
 * Walkover row 7 (Dalí, 2026-06-07): plans live and die on what kind of
 * date a date is. An exact day reads differently from a window reads
 * differently from a pending confirmation. Stop collapsing them.
 *
 * Three glyphs, three meanings:
 *
 *   - `exact`  , solid dot.       The date is locked. e.g. 2026-03-18
 *   - `window` , open bracket.   A range. e.g. ~mid-March
 *   - `pending`, hollow ring.    Awaiting confirmation. e.g. TBC
 *
 * Render component is type-safe over a discriminated union so a caller
 * cannot pass `kind: "exact"` without a value, etc. The visual ramp
 * follows the four-state restraint from /the-wedding: only the chip
 * carries presence when there is something to act on.
 */

export type DatePrecision =
  | { kind: "exact"; value: string }
  | { kind: "window"; value: string }
  | { kind: "pending"; value?: string };

type Props = {
  precision: DatePrecision;
  /** Render-time tone, used for muted contexts like the schedule axis. */
  tone?: "default" | "quiet";
};

export function DatePrecisionChip({ precision, tone = "default" }: Props) {
  const colour =
    tone === "quiet" ? "var(--ink-quiet)" : "var(--ink-soft)";

  if (precision.kind === "exact") {
    return (
      <span
        className="inline-flex items-center gap-1.5 font-mono text-[11.5px]"
        style={{ color: colour, letterSpacing: "0.01em" }}
        aria-label={`Exact date ${precision.value}`}
      >
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: colour }}
        />
        {precision.value}
      </span>
    );
  }

  if (precision.kind === "window") {
    return (
      <span
        className="inline-flex items-center gap-1.5 font-mono text-[11.5px]"
        style={{ color: colour, letterSpacing: "0.01em" }}
        aria-label={`Approximate window ${precision.value}`}
      >
        {/* Bracket glyph, drawn so it does not collide with the digit
            advance and reads as 'this is a range, not a point'. */}
        <svg
          width="9"
          height="11"
          viewBox="0 0 9 11"
          fill="none"
          aria-hidden
          style={{ flexShrink: 0 }}
        >
          <path
            d="M3 1H1.5v9H3"
            stroke={colour}
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 1h1.5v9H6"
            stroke={colour}
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        ~{precision.value}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[11.5px]"
      style={{ color: "var(--ink-quiet)", letterSpacing: "0.01em" }}
      aria-label={
        precision.value
          ? `Awaiting confirmation: ${precision.value}`
          : "Awaiting confirmation"
      }
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full border"
        style={{ borderColor: "var(--ink-quiet)" }}
      />
      {precision.value ?? "awaiting confirmation"}
    </span>
  );
}
