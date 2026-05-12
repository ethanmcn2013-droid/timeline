import { Fragment } from "react";

/**
 * Read-only progress dial used on the workspace hero.
 * Stroke draws clockwise from 12 o'clock; `value` is 0..1.
 * Sizing scales the stroke to keep the ring visually balanced
 * at any diameter.
 */
export function ProgressRing({
  value,
  size = 64,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(1, value));
  const stroke = Math.max(3, Math.round(size / 16));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);
  const pct = Math.round(clamped * 100);

  return (
    <Fragment>
      <div
        className="relative inline-flex flex-shrink-0 items-center justify-center"
        style={{ width: size, height: size }}
        role="img"
        aria-label={
          label
            ? `${label}: ${pct}%`
            : `Progress: ${pct}%`
        }
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--line-soft)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--status-shipped)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: "stroke-dashoffset 600ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </svg>
        <span
          className="absolute inset-0 flex flex-col items-center justify-center text-center tabular-nums leading-none"
        >
          <span
            className="font-semibold"
            style={{
              fontSize: Math.round(size * 0.28),
              color: "var(--ink)",
            }}
          >
            {pct}%
          </span>
          {label ? (
            <span
              className="mt-0.5 font-medium uppercase tracking-[0.12em]"
              style={{
                fontSize: Math.max(8, Math.round(size * 0.11)),
                color: "var(--ink-quiet)",
              }}
            >
              {label}
            </span>
          ) : null}
        </span>
      </div>
    </Fragment>
  );
}
