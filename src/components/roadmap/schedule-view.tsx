import type { Task, Project } from "@/server/db/schema";
import { STATUS_DISPLAY } from "@/components/roadmap/status-pill";

// ── Schedule view ─────────────────────────────────────────────────────────────
// The fourth public workspace view (P5 of the unification). It is NOT a port of
// the cinematic showcase TimelineView: that component fabricates start/end spans
// from a demo domain pack, and real Task rows carry only a single nullable
// `targetDate`. Inventing durations here would re-open the demo-vs-reality gap
// the unification exists to close (AGENTS.md locked refusal). So this is an
// honest schedule — every item sits at its real target month, undated work is
// shown in an explicit tray rather than guessed onto the axis.
//
// Server component. No motion: this is a quiet public read surface, not the
// demo. Status colour + label reuse STATUS_DISPLAY so the schedule reads
// identically to the rest of the live viewer (vocab reconciliation is P6).

const GUTTER = 200; // px — project-name column width, matched to the month grid

type Props = {
  /** Non-refused, non-milestone tasks (page.tsx `visibleTasks`). */
  tasks: Task[];
  /** Milestones + launch beats (page.tsx `milestones`), already date-sorted. */
  milestones: Task[];
  /** Workspace projects in display order. */
  projects: Project[];
  projectMap: Map<string, Project>;
};

/** Parse a "YYYY-MM-DD" target date into an absolute month index + day.
 *  Anything that isn't a clean year-month prefix is treated as undated so it
 *  lands in the honest tray rather than being forced onto the axis. */
function parseTarget(
  date: string | null,
): { absMonth: number; day: number } | null {
  if (!date) return null;
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(date);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]); // 1–12
  if (month < 1 || month > 12) return null;
  return { absMonth: year * 12 + (month - 1), day: m[3] ? Number(m[3]) : 1 };
}

function monthLabel(absMonth: number, showYear: boolean): string {
  const year = Math.floor(absMonth / 12);
  const month = absMonth % 12;
  const short = new Date(year, month, 1).toLocaleString(undefined, {
    month: "short",
  });
  return showYear ? `${short} ${String(year).slice(2)}` : short;
}

function daysInMonth(absMonth: number): number {
  const year = Math.floor(absMonth / 12);
  const month = absMonth % 12;
  return new Date(year, month + 1, 0).getDate();
}

function ItemChip({
  task,
  projectMap,
}: {
  task: Task;
  projectMap: Map<string, Project>;
}) {
  const meta = STATUS_DISPLAY[task.status];
  const accent = projectMap.get(task.projectSlug)?.accent ?? "var(--brand)";
  return (
    <div
      className="flex items-start gap-1.5 rounded-md border px-2 py-1.5"
      style={{
        background: meta.bg,
        borderColor: meta.border,
      }}
      title={`${task.title} — ${meta.label}`}
    >
      <span
        aria-hidden
        className="mt-[3px] inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{ background: task.isLaunch ? accent : meta.fg }}
      />
      <span
        className="text-[11.5px] leading-snug"
        style={{
          color: "var(--ink)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {task.title}
      </span>
    </div>
  );
}

export function ScheduleView({
  tasks,
  milestones,
  projects,
  projectMap,
}: Props) {
  const now = new Date();
  const todayAbs = now.getFullYear() * 12 + now.getMonth();

  // Split every task into "placed on the axis" vs "no date yet". Milestones
  // are dated separately so they can drive their own lane + guide.
  const dated: { task: Task; absMonth: number }[] = [];
  const undated: Task[] = [];
  for (const t of tasks) {
    const p = parseTarget(t.targetDate);
    if (p) dated.push({ task: t, absMonth: p.absMonth });
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

  // Nothing sits on a timeline — but there may still be undated work to show.
  if (dated.length === 0 && datedMilestones.length === 0) {
    if (undated.length === 0) {
      return (
        <section className="px-6 py-24 text-center">
          <div className="mx-auto max-w-md">
            <p className="text-[15px] text-ink-soft">
              No dated items yet. Add a target date to an item and it lands on
              the schedule.
            </p>
          </div>
        </section>
      );
    }
    return (
      <div className="mx-auto w-full max-w-[1240px] px-6 py-10">
        <p className="mb-6 text-[13px] text-ink-soft">
          Nothing has a target date yet — so there is no schedule to draw.
          These items are still in the plan, just not scheduled.
        </p>
        <UndatedTray
          undated={undated}
          projects={projects}
          projectMap={projectMap}
        />
      </div>
    );
  }

  let windowStart = Math.min(...anchored);
  let windowEnd = Math.max(...anchored);
  // Give the axis room to breathe — never fewer than 3 columns.
  while (windowEnd - windowStart + 1 < 3) windowEnd++;
  const span = windowEnd - windowStart + 1;

  // Today marker: month offset + fractional position within the month.
  const todayFrac =
    todayAbs >= windowStart && todayAbs <= windowEnd
      ? (todayAbs - windowStart + (now.getDate() - 1) / daysInMonth(todayAbs)) /
        span
      : null;

  // Project rows: only projects that actually have a dated item, in the
  // workspace's display order. Each project's items bucketed by month column.
  const datedByProject = new Map<string, Map<number, Task[]>>();
  for (const { task, absMonth } of dated) {
    const col = absMonth - windowStart;
    let byCol = datedByProject.get(task.projectSlug);
    if (!byCol) {
      byCol = new Map();
      datedByProject.set(task.projectSlug, byCol);
    }
    const arr = byCol.get(col) ?? [];
    arr.push(task);
    byCol.set(col, arr);
  }
  const rowProjects = projects.filter((p) => datedByProject.has(p.slug));

  const gridCols = `${GUTTER}px repeat(${span}, minmax(148px, 1fr))`;
  const fromLabel = monthLabel(windowStart, true);
  const toLabel = monthLabel(windowEnd, true);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-10">
      {/* Caption row — legend left, window range right */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {(["shipped", "in-flight", "next", "waiting"] as const).map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 text-[11px] text-ink-quiet"
            >
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: STATUS_DISPLAY[s].fg }}
              />
              {STATUS_DISPLAY[s].label}
            </span>
          ))}
        </div>
        <span className="text-[11px] tabular-nums text-ink-faint">
          {fromLabel} – {toLabel}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: GUTTER + span * 148 }}>
          {/* Month axis header */}
          <div
            className="grid items-end pb-1.5"
            style={{
              gridTemplateColumns: gridCols,
              borderBottom: "1px solid var(--border-soft)",
            }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
              Project
            </span>
            {Array.from({ length: span }, (_, i) => {
              const abs = windowStart + i;
              const showYear = i === 0 || abs % 12 === 0;
              return (
                <span
                  key={i}
                  className="text-center font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-quiet"
                  style={{
                    borderLeft:
                      i === 0 ? undefined : "1px solid var(--border-soft)",
                  }}
                >
                  {monthLabel(abs, showYear)}
                </span>
              );
            })}
          </div>

          {/* Body — milestone lane + project rows, with a Today overlay */}
          <div className="relative">
            {/* Today line — drawn over the whole body */}
            {todayFrac !== null ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 bottom-0 z-10"
                style={{
                  left: `calc(${GUTTER}px + (100% - ${GUTTER}px) * ${todayFrac})`,
                  width: 1,
                  background:
                    "linear-gradient(to bottom, transparent, var(--brand) 5%, var(--brand) 95%, transparent)",
                  boxShadow: "0 0 6px var(--brand-glow)",
                }}
              >
                <span
                  className="absolute -translate-x-1/2 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white"
                  style={{
                    top: -9,
                    left: "50%",
                    background: "var(--brand)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Today
                </span>
              </div>
            ) : null}

            {/* Milestone lane */}
            {datedMilestones.length > 0 ? (
              <div
                className="grid items-center"
                style={{
                  gridTemplateColumns: gridCols,
                  minHeight: 44,
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span className="pr-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-quiet">
                  Milestones
                </span>
                <div
                  className="relative col-span-full"
                  style={{
                    gridColumn: `2 / span ${span}`,
                    height: "100%",
                  }}
                >
                  {datedMilestones.map(({ task, absMonth, day }) => {
                    const frac =
                      (absMonth -
                        windowStart +
                        (day - 1) / daysInMonth(absMonth)) /
                      span;
                    return (
                      <div
                        key={task.id}
                        className="absolute top-1/2 flex -translate-y-1/2 items-center gap-1.5"
                        style={{
                          left: `${Math.min(frac, 0.999) * 100}%`,
                        }}
                      >
                        <span
                          aria-hidden
                          className="block h-2.5 w-2.5 flex-shrink-0 rotate-45 border"
                          style={{
                            background: "var(--brand)",
                            borderColor: "var(--brand)",
                          }}
                        />
                        <span
                          className="truncate text-[11px] font-medium"
                          style={{ color: "var(--ink)", maxWidth: 180 }}
                          title={task.title}
                        >
                          {task.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Project rows */}
            <div className="flex flex-col">
              {rowProjects.map((proj) => {
                const byCol = datedByProject.get(proj.slug)!;
                return (
                  <div
                    key={proj.slug}
                    className="grid items-stretch"
                    style={{
                      gridTemplateColumns: gridCols,
                      borderBottom: "1px solid var(--border-soft)",
                    }}
                  >
                    <div className="flex items-center gap-2 py-3 pr-3">
                      <span
                        aria-hidden
                        className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                        style={{
                          background: proj.accent ?? "var(--brand)",
                        }}
                      />
                      <span
                        className="truncate text-[12.5px] font-medium"
                        style={{ color: "var(--ink)" }}
                        title={proj.name}
                      >
                        {proj.name}
                      </span>
                    </div>
                    {Array.from({ length: span }, (_, col) => {
                      const items = byCol.get(col);
                      return (
                        <div
                          key={col}
                          className="flex flex-col justify-center gap-1 px-1 py-2"
                          style={{
                            borderLeft:
                              col === 0
                                ? undefined
                                : "1px solid var(--border-soft)",
                          }}
                        >
                          {items?.map((t) => (
                            <ItemChip
                              key={t.id}
                              task={t}
                              projectMap={projectMap}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {undated.length > 0 ? (
        <div className="mt-10">
          <UndatedTray
            undated={undated}
            projects={projects}
            projectMap={projectMap}
          />
        </div>
      ) : null}
    </div>
  );
}

// ── Undated tray ──────────────────────────────────────────────────────────────
// Honest home for items with no target date. They are real, planned work — they
// just aren't scheduled, so they are listed rather than guessed onto the axis.

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
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: proj.accent ?? "var(--brand)" }}
              />
              <span className="text-[11px] font-medium text-ink-soft">
                {proj.name}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {byProject.get(proj.slug)!.map((t) => (
                <ItemChip key={t.id} task={t} projectMap={projectMap} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
