/**
 * BigStat — the values-then-labels stat treatment that anchors
 * Roadmap hero rows. Big tabular number above (or beside) a small
 * uppercase label.
 *
 * Used on the workspace and project-detail surfaces. Tones map to
 * the semantic palette: shipped (green), flight (amber), waiting
 * (sky), refused (quiet). No tone = ink default.
 */
export function BigStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "shipped" | "flight" | "waiting" | "refused";
}) {
  const colorMap = {
    shipped: "var(--status-shipped)",
    flight: "var(--status-flight)",
    waiting: "var(--status-waiting)",
    refused: "var(--ink-quiet)",
  };
  const color = tone ? colorMap[tone] : "var(--ink)";
  return (
    <div className="flex items-baseline gap-2">
      <span
        className="text-[28px] font-semibold tabular-nums leading-none tracking-[-0.02em]"
        style={{ color }}
      >
        {value}
      </span>
      <span
        className="text-[11px] font-medium uppercase tracking-[0.12em]"
        style={{ color: "var(--ink-quiet)" }}
      >
        {label}
      </span>
    </div>
  );
}
