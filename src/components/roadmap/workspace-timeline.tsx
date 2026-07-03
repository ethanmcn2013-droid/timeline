import type { Task, Project } from "@/server/db/schema";

// ── Timeline view ─────────────────────────────────────────────────────────────
// The product rename (roadmap→timeline) earns a view that is literally a
// timeline: one straight line, milestones plotted as points along it in date
// order. For the 80% who don't live in tools, this is the most legible plan
// there is, "here are the moments that matter, and here's where we are on the
// way to them." No lanes, no grid, no vocabulary lesson.
//
// Server component, CSS-only (no motion / no client JS). The page server-renders
// every view once and toggles visibility on the client, so keeping this a plain
// server component preserves ISR and the no-JS baseline. Milestones are the
// only thing plotted, items live in the Gantt view; refused work lives behind
// the "what didn't make it" link, same as everywhere else.

type MilestoneNode = {
  id: string;
  title: string;
  projectSlug: string;
  targetDate: string | null;
  status: Task["status"];
  inScope: number;
  shipped: number;
};

type Props = {
  milestones: MilestoneNode[];
  projects: Project[];
};

/** ISO "YYYY-MM-DD" → UTC day timestamp, or null when undated/unparseable. */
function dayValue(date: string | null): number | null {
  if (!date) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (!m) return null;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function formatLong(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function tMinus(iso: string): { label: string; over: boolean } {
  const target = dayValue(iso)!;
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((target - today) / 86_400_000);
  if (days === 0) return { label: "today", over: false };
  if (days > 0) return { label: `${days} day${days === 1 ? "" : "s"} to go`, over: false };
  return { label: `${-days} day${days === -1 ? "" : "s"} ago`, over: true };
}

export function WorkspaceTimeline({ milestones, projects }: Props) {
  const accentBySlug = new Map<string, string>();
  for (const p of projects) accentBySlug.set(p.slug, p.accent ?? "var(--brand)");

  const dated = milestones
    .map((m) => ({ m, t: dayValue(m.targetDate) }))
    .filter((x): x is { m: MilestoneNode; t: number } => x.t !== null)
    .sort((a, b) => a.t - b.t);
  const undated = milestones.filter((m) => dayValue(m.targetDate) === null);

  if (dated.length === 0) {
    return (
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-md space-y-2">
          <p className="text-[15px] text-ink-soft">
            No dated milestones yet.
          </p>
          <p className="text-[13px] text-ink-quiet">
            Give a milestone a date and it lands on the timeline. This page
            updates as the plan moves, check back, or bookmark it.
          </p>
        </div>
      </section>
    );
  }

  const minT = dated[0].t;
  const maxT = dated[dated.length - 1].t;
  const range = Math.max(1, maxT - minT);

  // Map a day value into the readable band [PAD, 100 - PAD] so the first and
  // last points (and their labels) never sit hard against the edges. A single
  // dated milestone sits dead-centre.
  const PAD = 8;
  const fracOf = (t: number) =>
    dated.length === 1 ? 50 : PAD + ((t - minT) / range) * (100 - 2 * PAD);

  const now = new Date();
  const todayT = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const todayInRange = todayT >= minT && todayT <= maxT;
  const todayFrac = !todayInRange
    ? todayT < minT
      ? PAD
      : 100 - PAD
    : fracOf(todayT);

  // Horizontal room: enough per point that labels don't collide; scrolls on
  // small screens rather than crushing the line.
  const minWidth = Math.max(720, dated.length * 200);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-12">
      {/* Caption */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="text-[13px] text-ink-soft">
          The moments this plan is building toward, in order.
        </p>
        <span className="font-mono text-[11px] tabular-nums text-ink-faint">
          {formatLong(dated[0].m.targetDate!)} – {formatLong(dated[dated.length - 1].m.targetDate!)}
        </span>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="relative" style={{ minWidth, height: 320 }}>
          {/* The line, base rail + progress fill up to today */}
          <div
            aria-hidden
            className="absolute left-0 right-0"
            style={{ top: "50%", height: 2, background: "var(--border-soft)" }}
          />
          <div
            aria-hidden
            className="absolute left-0"
            style={{
              top: "50%",
              height: 2,
              width: `${todayFrac}%`,
              background: "var(--brand)",
              opacity: 0.85,
            }}
          />

          {/* Today marker */}
          {todayInRange ? (
            <div
              aria-hidden
              className="absolute"
              style={{
                left: `${todayFrac}%`,
                top: 0,
                bottom: 0,
                width: 1,
                transform: "translateX(-0.5px)",
                background:
                  "linear-gradient(to bottom, transparent, var(--brand-glow, var(--border-soft)) 12%, var(--brand-glow, var(--border-soft)) 88%, transparent)",
              }}
            >
              <span
                className="absolute -translate-x-1/2 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white"
                style={{ top: 0, left: "50%", background: "var(--brand)", whiteSpace: "nowrap" }}
              >
                Today
              </span>
            </div>
          ) : null}

          {/* Milestone points */}
          {dated.map(({ m, t }, i) => {
            const left = fracOf(t);
            const above = i % 2 === 0;
            const accent = accentBySlug.get(m.projectSlug) ?? "var(--brand)";
            const progress =
              m.inScope > 0 ? m.shipped / m.inScope : m.status === "shipped" ? 1 : 0;
            const complete = progress >= 0.999 || m.status === "shipped";
            const tm = tMinus(m.targetDate!);
            return (
              <div
                key={m.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${left}%`,
                  transform: "translateX(-50%)",
                  top: above ? 20 : "50%",
                  height: above ? "calc(50% - 20px)" : "calc(50% - 20px)",
                  justifyContent: above ? "flex-start" : "flex-end",
                  width: 168,
                }}
              >
                {/* Label card (above-line nodes) */}
                {above ? (
                  <TimelineLabel m={m} accent={accent} complete={complete} tm={tm} />
                ) : null}

                {/* Connector from card to the line */}
                <span
                  aria-hidden
                  className="w-px flex-1"
                  style={{ background: "var(--border-soft)", minHeight: 14 }}
                />

                {/* Node sits exactly on the line (the parent's flex edge) */}
                <span
                  className="relative z-10 inline-flex items-center justify-center rounded-full border-2"
                  style={{
                    width: 18,
                    height: 18,
                    marginTop: above ? 0 : -9,
                    marginBottom: above ? -9 : 0,
                    background: complete ? "var(--status-shipped)" : "var(--bg)",
                    borderColor: complete ? "var(--status-shipped)" : accent,
                  }}
                >
                  {complete ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                  )}
                </span>

                {/* Connector + label below the line */}
                {!above ? (
                  <>
                    <span
                      aria-hidden
                      className="w-px"
                      style={{ background: "var(--border-soft)", height: 14 }}
                    />
                    <TimelineLabel m={m} accent={accent} complete={complete} tm={tm} />
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Undated milestones, honest tray, never guessed onto the line */}
      {undated.length > 0 ? (
        <div className="mt-8">
          <h3 className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
            No date yet · {undated.length}
          </h3>
          <div className="flex flex-wrap gap-2">
            {undated.map((m) => {
              const accent = accentBySlug.get(m.projectSlug) ?? "var(--brand)";
              return (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px]"
                  style={{ borderColor: "var(--border-soft)", color: "var(--ink-soft)" }}
                >
                  <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                  {m.title}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TimelineLabel({
  m,
  accent,
  complete,
  tm,
}: {
  m: MilestoneNode;
  accent: string;
  complete: boolean;
  tm: { label: string; over: boolean };
}) {
  return (
    <div className="w-full text-center">
      <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-quiet">
        {formatLong(m.targetDate!)}
      </div>
      <div
        className="text-[13.5px] font-semibold leading-snug text-ink"
        style={{ letterSpacing: "-0.01em" }}
      >
        {m.title}
      </div>
      <div className="mt-1 text-[11px]" style={{ color: complete ? "var(--status-shipped)" : accent }}>
        {complete
          ? "Done"
          : m.inScope > 0
            ? `${m.shipped} of ${m.inScope} done · ${tm.label}`
            : tm.label}
      </div>
    </div>
  );
}
