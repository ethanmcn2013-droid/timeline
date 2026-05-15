"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Task, Project } from "@/server/db/schema";
import type { Status } from "@/server/db/schema";
import { STATUS_DISPLAY } from "@/components/roadmap/status-pill";

// ── Roadmap → flow map ────────────────────────────────────────────────────────
// The Roadmap view was a list grouped by project. For the 80% who don't work in
// tech, a list is a spreadsheet; a *map* is a plan they can read at a glance.
// This is the "where does everything stand right now" view: four plain-English
// lanes a wedding planner or a builder understands without a vocabulary lesson —
// To do, Doing, Held up, Done. Calm register (Apple/Linear/Arc, never Jira).
//
// Client component: receives serialisable task/project arrays from the server
// page (one fetch, ISR preserved upstream) and adds a restrained entrance +
// hover lift. Status labels/colours reuse the live viewer's own scale so the
// map reads as the same product, not a bolt-on. Refused work is not a lane —
// it lives behind the existing "what didn't make it" link, same as elsewhere.

// Workflow order, left → right. Mirrors how the work actually moves.
const LANES: { status: Status; hint: string }[] = [
  { status: "next", hint: "Lined up, not started" },
  { status: "in-flight", hint: "Being worked on now" },
  { status: "blocked", hint: "Waiting on something" },
  { status: "shipped", hint: "Finished and live" },
];

type Props = {
  /** Non-refused, non-milestone tasks. */
  tasks: Task[];
  projects: Project[];
  /** taskId → milestone title it's building toward, precomputed server-side. */
  milestoneLabels: Record<string, string | null>;
};

export function RoadmapFlow({ tasks, projects, milestoneLabels }: Props) {
  const reduce = useReducedMotion();

  const projectBySlug = useMemo(() => {
    const m = new Map<string, Project>();
    for (const p of projects) m.set(p.slug, p);
    return m;
  }, [projects]);

  const byLane = useMemo(() => {
    const map = new Map<Status, Task[]>();
    for (const l of LANES) map.set(l.status, []);
    for (const t of tasks) {
      const arr = map.get(t.status);
      if (arr) arr.push(t);
    }
    return map;
  }, [tasks]);

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-12">
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
        {LANES.map((lane, laneIdx) => {
          const meta = STATUS_DISPLAY[lane.status];
          const items = byLane.get(lane.status) ?? [];
          return (
            <motion.section
              key={lane.status}
              aria-label={meta.label}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: laneIdx * 0.06 }}
              className="flex flex-col"
            >
              {/* Lane header */}
              <div
                className="mb-3 flex items-baseline justify-between border-b pb-2.5"
                style={{ borderColor: "var(--border-soft)" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: meta.fg }}
                  />
                  <span
                    className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "var(--ink)" }}
                  >
                    {meta.label}
                  </span>
                </div>
                <span
                  className="font-mono text-[12px] tabular-nums"
                  style={{ color: "var(--ink-quiet)" }}
                >
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              {items.length === 0 ? (
                <p
                  className="rounded-xl border border-dashed px-3 py-6 text-center text-[12px]"
                  style={{
                    borderColor: "var(--border-soft)",
                    color: "var(--ink-faint)",
                  }}
                >
                  {lane.status === "blocked"
                    ? "Nothing held up."
                    : lane.status === "shipped"
                      ? "Nothing finished yet."
                      : "Nothing here yet."}
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {items.map((t, i) => {
                    const proj = projectBySlug.get(t.projectSlug);
                    const accent = proj?.accent ?? "var(--brand)";
                    const ms = milestoneLabels[t.id];
                    return (
                      <motion.article
                        key={t.id}
                        initial={reduce ? false : { opacity: 0, y: 10 }}
                        animate={reduce ? undefined : { opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.42,
                          ease,
                          delay: reduce ? 0 : laneIdx * 0.06 + 0.04 * Math.min(i, 6),
                        }}
                        whileHover={reduce ? undefined : { y: -2 }}
                        className="group rounded-xl border p-3.5 transition-colors"
                        style={{
                          background: "var(--bg-elev)",
                          borderColor: "var(--border-soft)",
                        }}
                      >
                        {/* status accent edge */}
                        <div
                          aria-hidden
                          className="mb-2.5 h-[3px] w-7 rounded-full"
                          style={{ background: meta.fg, opacity: 0.85 }}
                        />
                        <h3
                          className="text-[13.5px] font-medium leading-snug"
                          style={{ color: "var(--ink)" }}
                        >
                          {t.title}
                        </h3>

                        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              aria-hidden
                              className="inline-block h-1.5 w-1.5 rounded-full"
                              style={{ background: accent }}
                            />
                            <span
                              className="text-[11.5px]"
                              style={{ color: "var(--ink-soft)" }}
                            >
                              {proj?.name ?? t.projectSlug}
                            </span>
                          </span>
                          {t.targetDate ? (
                            <span
                              className="font-mono text-[11px] tabular-nums"
                              style={{ color: "var(--ink-quiet)" }}
                            >
                              {formatTarget(t.targetDate)}
                            </span>
                          ) : null}
                        </div>

                        {ms ? (
                          <div
                            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px]"
                            style={{
                              background: "var(--brand-soft)",
                              color: "var(--brand-deep)",
                            }}
                          >
                            <svg
                              width="9"
                              height="9"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <path d="M5 3v18M5 4h13l-3 4 3 4H5" />
                            </svg>
                            toward {ms}
                          </div>
                        ) : null}
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}

function formatTarget(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
