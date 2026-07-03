import type { Status } from "@/server/db/schema";

const STATUS_META: Record<
  Status,
  { label: string; bg: string; fg: string; border: string }
> = {
  shipped: {
    label: "Done",
    bg: "var(--status-shipped-bg)",
    fg: "var(--status-shipped)",
    border: "color-mix(in srgb, var(--status-shipped) 28%, transparent)",
  },
  "in-flight": {
    label: "Doing",
    bg: "var(--status-flight-bg)",
    fg: "var(--status-flight)",
    border: "color-mix(in srgb, var(--status-flight) 30%, transparent)",
  },
  next: {
    label: "To do",
    bg: "var(--status-next-bg)",
    fg: "var(--status-next)",
    border: "color-mix(in srgb, var(--status-next) 24%, transparent)",
  },
  waiting: {
    label: "Waiting",
    bg: "var(--status-waiting-bg)",
    fg: "var(--status-waiting)",
    border: "color-mix(in srgb, var(--status-waiting) 28%, transparent)",
  },
  refused: {
    label: "Dropped",
    bg: "var(--status-refused-bg)",
    fg: "var(--status-refused)",
    border: "color-mix(in srgb, var(--status-refused) 18%, transparent)",
  },
};

/**
 * Read-only status pill. Public surface, no click interaction, no server action.
 */
export function StatusPill({
  status,
  size = "md",
}: {
  status: Status;
  size?: "sm" | "md";
}) {
  const meta = STATUS_META[status];
  const cls =
    size === "sm"
      ? "text-[10px] px-2 py-0.5"
      : "text-[10.5px] px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-[0.08em] ${cls}`}
      style={{
        background: meta.bg,
        color: meta.fg,
        borderColor: meta.border,
      }}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: meta.fg }}
      />
      {meta.label}
    </span>
  );
}

export const STATUS_DISPLAY = STATUS_META;
