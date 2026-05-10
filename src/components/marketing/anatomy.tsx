const ANNOTATIONS = [
  {
    label: "Status",
    body: "A plain state people understand before they read the detail.",
  },
  {
    label: "Decision",
    body: "The work is named as an outcome, not as a ticket.",
  },
  {
    label: "Reason",
    body: "Short context explains why the item matters.",
  },
  {
    label: "Refusal",
    body: "What will not happen stays visible too.",
  },
] as const;

export function ItemAnatomy() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto w-full max-w-[1240px]">
        <p
          className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: "var(--ink-quiet)" }}
        >
          Anatomy
        </p>
        <h2
          className="mb-10 max-w-xl text-[clamp(1.5rem,1.2rem+1.5vw,2.25rem)] font-semibold leading-[1.1]"
          style={{ letterSpacing: "-0.03em", color: "var(--ink)" }}
        >
          A roadmap item should explain itself.
        </h2>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div
            className="border p-5"
            style={{
              borderRadius: "var(--r-2)",
              borderColor: "var(--border)",
              background: "var(--bg-elev)",
              boxShadow: "var(--shadow-1)",
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: "var(--status-flight)" }}
                aria-hidden
              />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--ink-quiet)" }}
              >
                Doing
              </span>
            </div>
            <h3 className="mb-3 text-[22px] font-semibold tracking-[-0.03em] text-ink">
              Publish the May client plan
            </h3>
            <p className="max-w-[58ch] text-[14px] leading-[1.6] text-ink-soft">
              The plan needs one public place before the next client review.
              This update explains what changed, what is waiting, and what will
              not be picked up this cycle.
            </p>
            <div
              className="mt-5 border-t pt-4"
              style={{ borderColor: "var(--border-soft)" }}
            >
              <p
                className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--ink-quiet)" }}
              >
                Refusal
              </p>
              <p className="text-[13px] leading-[1.55] text-ink-soft">
                No private version for this cycle. The plan has to be readable
                by anyone with the link.
              </p>
            </div>
          </div>

          <ol className="space-y-4">
            {ANNOTATIONS.map((item, index) => (
              <li key={item.label} className="flex gap-4">
                <span
                  className="mt-0.5 text-[11px] font-semibold tracking-[0.14em]"
                  style={{ color: "var(--brand)" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-ink">{item.label}</p>
                  <p className="mt-1 text-[13px] leading-[1.55] text-ink-soft">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
