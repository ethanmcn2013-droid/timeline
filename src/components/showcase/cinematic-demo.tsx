const ROWS = [
  {
    label: "Shipped",
    title: "Client review link",
    dot: "var(--status-shipped)",
  },
  {
    label: "Doing",
    title: "Public launch plan",
    dot: "var(--status-flight)",
  },
  {
    label: "Held up",
    title: "Venue copy approval",
    dot: "var(--status-blocked)",
  },
  {
    label: "Next",
    title: "May update note",
    dot: "var(--status-next)",
  },
] as const;

export function CinematicDemo() {
  return (
    <div
      className="w-full border p-4 sm:p-5"
      style={{
        borderRadius: "var(--r-2)",
        borderColor: "var(--border)",
        background:
          "linear-gradient(180deg, var(--bg-elev) 0%, color-mix(in srgb, var(--bg-deep) 72%, var(--bg-elev)) 100%)",
        boxShadow: "var(--shadow-2)",
      }}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--ink-quiet)" }}
          >
            Public roadmap
          </p>
          <p className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-ink">
            Spring launch
          </p>
        </div>
        <span
          className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
          style={{ borderColor: "var(--border)", color: "var(--ink-soft)" }}
        >
          Live
        </span>
      </div>

      <div className="space-y-2">
        {ROWS.map((row) => (
          <div
            key={row.title}
            className="grid grid-cols-[88px_1fr] items-center gap-3 border px-3 py-2.5"
            style={{
              borderRadius: "var(--r-2)",
              borderColor: "var(--border-soft)",
              background: "var(--bg-elev)",
            }}
          >
            <span
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "var(--ink-quiet)" }}
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: row.dot }}
              />
              {row.label}
            </span>
            <span className="truncate text-[13px] font-medium text-ink">
              {row.title}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[12px] leading-[1.5] text-ink-quiet">
        One public page. The plan, the change, and the reason in the same place.
      </p>
    </div>
  );
}
