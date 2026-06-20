import type { Task, Project } from "@/server/db/schema";
import { STATUS_DISPLAY } from "@/components/roadmap/status-pill";

// ── Gantt view ────────────────────────────────────────────────────────────────
// One bar per item across a month axis, grouped into project sections — the
// classic "where everything sits in time" read. Honest-data contract (the same
// locked refusal ScheduleView documents): real Task rows carry a single
// nullable `targetDate`, never a start/end span, so we do NOT invent per-item
// durations. The bar occupies the item's *target month* — a true statement at
// the data's month granularity ("scheduled for this month") — positioned to the
// exact target day. Undated work goes to an honest tray, never guessed onto the
// axis.
//
// Server component, no motion: a quiet public read surface. Status colour/label
// reuse STATUS_DISPLAY so the Gantt reads as the same product as every other
// view. The demo's Gantt (showcase) uses real start/end spans from its domain
// pack — that's honest there; this one can't, and doesn't pretend to.

const GUTTER = 220; // px — item-title column width

type Props = {
  /** Non-refused, non-milestone tasks (page.tsx `visibleTasks`). */
  tasks: Task[];
  /** Milestones + launch beats (page.tsx `milestones`), already date-sorted. */
  milestones: Task[];
  /** Workspace projects in display order. */
  projects: Project[];
  projectMap: Map<string, Project>;
};

function parseTarget(date: string | null): { absMonth: number; day: number } | null {
  if (!date) return null;
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(date);
  if (!m) return null;
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { absMonth: Number(m[1]) * 12 + (month - 1), day: m[3] ? Number(m[3]) : 1 };
}

function monthLabel(absMonth: number, showYear: boolean): string {
  const year = Math.floor(absMonth / 12);
  const month = absMonth % 12;
  const short = new Date(year, month, 1).toLocaleString(undefined, { month: "short" });
  return showYear ? `${short} ${String(year).slice(2)}` : short;
}

function daysInMonth(absMonth: number): number {
  const year = Math.floor(absMonth / 12);
  const month = absMonth % 12;
  return new Date(year, month + 1, 0).getDate();
}

function formatDay(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function GanttView({ tasks, milestones, projects, projectMap }: Props) {
  const now = new Date();
  const todayAbs = now.getFullYear() * 12 + now.getMonth();

  const dated: { task: Task; absMonth: number; day: number }[] = [];
  const undated: Task[] = [];
  for (const t of tasks) {
    const p = parseTarget(t.targetDate);
    if (p) dated.push({ task: t, absMonth: p.absMonth, day: p.day });
    else undated.push(t);
  }
  const datedMilestones: { task: Task; absMonth: number; day: number }[] = [];
  for (const m of milestones) {
    const p = parseTarget(m.targetDate);
    if (p) datedMilestones.push({ task: m, absMonth: p.absMonth, day: p.day });
  }

  const anchored = [
    ...dated.map((d) => d.absMonth),
    ...datedMilestones.map((d) => d.absMonth),
    todayAbs,
  ];

  if (dated.length === 0 && datedMilestones.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1240px] px-6 py-10">
        {undated.length === 0 ? (
          <p className="text-[15px] text-ink-soft">
            No dated items yet. Add a target date to an item and it lands on the
            Gantt.
          </p>
        ) : (
          <>
            <p className="mb-6 text-[13px] text-ink-soft">
              Nothing has a target date yet — so there is nothing to plot. These
              items are still in the plan, just not scheduled.
            </p>
            <UndatedTray undated={undated} projects={projects} projectMap={projectMap} />
          </>
        )}
      </div>
    );
  }

  let windowStart = Math.min(...anchored);
  let windowEnd = Math.max(...anchored);
  while (windowEnd - windowStart + 1 < 3) windowEnd++;
  const span = windowEnd - windowStart + 1;

  const todayFrac =
    todayAbs >= windowStart && todayAbs <= windowEnd
      ? (todayAbs - windowStart + (now.getDate() - 1) / daysInMonth(todayAbs)) / span
      : null;

  // Fraction across the axis for a given month+day (0..1).
  const fracOf = (absMonth: number, day: number) =>
    (absMonth - windowStart + (day - 1) / daysInMonth(absMonth)) / span;

  const datedByProject = new Map<string, { task: Task; absMonth: number; day: number }[]>();
  for (const d of dated) {
    const arr = datedByProject.get(d.task.projectSlug) ?? [];
    arr.push(d);
    datedByProject.set(d.task.projectSlug, arr);
  }
  for (const arr of datedByProject.values()) {
    arr.sort((a, b) => a.absMonth - b.absMonth || a.day - b.day || a.task.sortOrder - b.task.sortOrder);
  }
  const rowProjects = projects.filter((p) => datedByProject.has(p.slug));

  const gridCols = `${GUTTER}px repeat(${span}, minmax(96px, 1fr))`;
  const monthWidthFrac = 1 / span; // a single month's share of the track

  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-10">
      {/* Caption row — legend + window range */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {(["shipped", "in-flight", "next", "waiting"] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 text-[11px] text-ink-quiet">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: STATUS_DISPLAY[s].fg }} />
              {STATUS_DISPLAY[s].label}
            </span>
          ))}
        </div>
        <span className="text-[11px] tabular-nums text-ink-faint">
          {monthLabel(windowStart, true)} – {monthLabel(windowEnd, true)}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: GUTTER + span * 96 }}>
          {/* Month axis header */}
          <div
            className="grid items-end pb-1.5"
            style={{ gridTemplateColumns: gridCols, borderBottom: "1px solid var(--border-soft)" }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
              Item
            </span>
            {Array.from({ length: span }, (_, i) => {
              const abs = windowStart + i;
              const showYear = i === 0 || abs % 12 === 0;
              return (
                <span
                  key={i}
                  className="text-center font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-quiet"
                  style={{ borderLeft: i === 0 ? undefined : "1px solid var(--border-soft)" }}
                >
                  {monthLabel(abs, showYear)}
                </span>
              );
            })}
          </div>

          <div className="relative">
            {/* Today line over the whole body */}
            {todayFrac !== null ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 bottom-0 z-10"
                style={{
                  left: `calc(${GUTTER}px + (100% - ${GUTTER}px) * ${todayFrac})`,
                  width: 1,
                  background: "linear-gradient(to bottom, transparent, var(--brand) 4%, var(--brand) 96%, transparent)",
                  boxShadow: "0 0 6px var(--brand-glow)",
                }}
              >
                <span
                  className="absolute -translate-x-1/2 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white"
                  style={{ top: -9, left: "50%", background: "var(--brand)", whiteSpace: "nowrap" }}
                >
                  Today
                </span>
              </div>
            ) : null}

            {/* Milestone lane */}
            {datedMilestones.length > 0 ? (
              <div
                className="grid items-center"
                style={{ gridTemplateColumns: gridCols, minHeight: 44, borderBottom: "1px solid var(--border-soft)" }}
              >
                <span className="pr-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-quiet">
                  Milestones
                </span>
                <div className="relative" style={{ gridColumn: `2 / span ${span}`, height: "100%" }}>
                  {datedMilestones.map(({ task, absMonth, day }) => (
                    <div
                      key={task.id}
                      className="absolute top-1/2 flex -translate-y-1/2 items-center gap-1.5"
                      style={{ left: `${Math.min(fracOf(absMonth, day), 0.999) * 100}%` }}
                    >
                      <span aria-hidden className="block h-2.5 w-2.5 flex-shrink-0 rotate-45 border" style={{ background: "var(--brand)", borderColor: "var(--brand)" }} />
                      <span className="truncate text-[11px] font-medium" style={{ color: "var(--ink)", maxWidth: 180 }} title={task.title}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Project sections — one bar per item row */}
            {rowProjects.map((proj) => {
              const items = datedByProject.get(proj.slug)!;
              return (
                <div key={proj.slug} className="border-b" style={{ borderColor: "var(--border-soft)" }}>
                  {/* Project header row */}
                  {projects.length > 1 ? (
                    <div className="flex items-center gap-2 pt-4 pb-1.5">
                      <span aria-hidden className="inline-block h-2 w-2 flex-shrink-0 rounded-full" style={{ background: proj.accent ?? "var(--brand)" }} />
                      <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink)" }}>
                        {proj.name}
                      </span>
                    </div>
                  ) : null}

                  {items.map(({ task, absMonth, day }) => {
                    const meta = STATUS_DISPLAY[task.status];
                    const left = fracOf(absMonth, day) * 100;
                    // Bar spans the target month; clamped so it never runs past
                    // the axis edge.
                    const width = Math.min(monthWidthFrac * 100, 100 - left);
                    return (
                      <div
                        key={task.id}
                        className="grid items-center"
                        style={{ gridTemplateColumns: `${GUTTER}px 1fr`, minHeight: 40 }}
                      >
                        {/* Title gutter */}
                        <div className="flex items-center gap-2 py-2 pr-3">
                          {projects.length === 1 ? (
                            <span aria-hidden className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: task.isLaunch ? (proj.accent ?? "var(--brand)") : meta.fg }} />
                          ) : null}
                          <span className="truncate text-[12.5px]" style={{ color: "var(--ink)" }} title={task.title}>
                            {task.title}
                          </span>
                        </div>
                        {/* Bar track */}
                        <div
                          className="relative h-full"
                          style={{
                            background: "linear-gradient(to right, var(--border-soft) 1px, transparent 1px)",
                            backgroundSize: `${100 / span}% 100%`,
                          }}
                        >
                          <div
                            className="absolute top-1/2 flex -translate-y-1/2 items-center gap-1.5 overflow-hidden rounded-md border px-2"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              minWidth: 64,
                              height: 22,
                              background: meta.bg,
                              borderColor: meta.border,
                            }}
                            title={`${task.title} — ${meta.label}${task.targetDate ? ` · ${formatDay(task.targetDate)}` : ""}`}
                          >
                            <span aria-hidden className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: meta.fg }} />
                            <span className="truncate font-mono text-[10.5px] tabular-nums" style={{ color: "var(--ink-soft)" }}>
                              {task.targetDate ? formatDay(task.targetDate) : meta.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {undated.length > 0 ? (
        <div className="mt-10">
          <UndatedTray undated={undated} projects={projects} projectMap={projectMap} />
        </div>
      ) : null}
    </div>
  );
}

function UndatedTray({
  undated,
  projects,
  projectMap,
}: {
  undated: Task[];
  projects: Project[];
  projectMap: Map<string, Project>;
}) {
  const byProject = new Map<string, Task[]>();
  for (const t of undated) {
    const arr = byProject.get(t.projectSlug) ?? [];
    arr.push(t);
    byProject.set(t.projectSlug, arr);
  }
  const ordered = projects.filter((p) => byProject.has(p.slug));

  return (
    <section>
      <h3 className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
        No date yet · {undated.length}
      </h3>
      <div className="space-y-4">
        {ordered.map((proj) => (
          <div key={proj.slug}>
            <div className="mb-1.5 flex items-center gap-2">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: proj.accent ?? "var(--brand)" }} />
              <span className="text-[11px] font-medium text-ink-soft">{proj.name}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {byProject.get(proj.slug)!.map((t) => {
                const meta = STATUS_DISPLAY[t.status];
                const accent = projectMap.get(t.projectSlug)?.accent ?? "var(--brand)";
                return (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11.5px]"
                    style={{ background: meta.bg, borderColor: meta.border, color: "var(--ink)" }}
                    title={`${t.title} — ${meta.label}`}
                  >
                    <span aria-hidden className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: t.isLaunch ? accent : meta.fg }} />
                    {t.title}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
