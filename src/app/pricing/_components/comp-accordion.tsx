type CompRow = {
  label: string;
  free: string;
  pro: string;
  students: string;
};

const PLANS = [
  ["free", "Free"],
  ["pro", "Pro"],
  ["students", "Students"],
] as const;

export function CompAccordion({ rows }: { rows: CompRow[] }) {
  return (
    <div className="space-y-3">
      {PLANS.map(([key, label]) => (
        <details
          key={key}
          className="rounded-xl border px-4 py-3"
          style={{ background: "var(--bg-elev)", borderColor: "var(--border)" }}
        >
          <summary
            className="cursor-pointer text-[13px] font-semibold"
            style={{ color: "var(--ink)" }}
          >
            {label}
          </summary>
          <dl className="mt-4 space-y-2">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 text-[12.5px]">
                <dt style={{ color: "var(--ink-quiet)" }}>{row.label}</dt>
                <dd className="text-right font-medium" style={{ color: "var(--ink-soft)" }}>
                  {row[key]}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      ))}
    </div>
  );
}
