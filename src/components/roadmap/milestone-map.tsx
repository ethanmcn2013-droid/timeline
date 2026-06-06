"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Task, Project } from "@/server/db/schema";

// ── Milestones → progress map ─────────────────────────────────────────────────
// Milestones were a stack of cards with lists under them. For the 80%, the
// emotional truth of a plan is "how close are we to the moment that matters" —
// the wedding day, the handover, the thesis defence. So this is a path: a spine
// of stations in date order, each filling as the work feeding it ships. The
// spine itself completes top-down — a visible sense of getting there. A station
// at 100% gets a quiet "settled" treatment. That payoff is the delight; it is
// earned by real progress, never decorative.
//
// Client component for the draw-on rings + sequenced settle. Reduced-motion
// renders the same final state with no animation. All data is precomputed
// server-side (scope counts, feeding items) and passed as plain arrays.

type MilestoneNode = {
  id: string;
  title: string;
  projectSlug: string;
  targetDate: string | null;
  status: Task["status"];
  inScope: number;
  shipped: number;
  /** Status of each feeding item, for the pip row. */
  feeding: Task["status"][];
};

type Props = {
  milestones: MilestoneNode[];
  projects: Project[];
};

const STATUS_DOT: Record<Task["status"], string> = {
  shipped: "var(--status-shipped)",
  "in-flight": "var(--status-flight)",
  waiting: "var(--status-waiting)",
  next: "var(--status-next)",
  refused: "var(--status-refused)",
};

export function MilestoneMap({ milestones, projects }: Props) {
  const reduce = useReducedMotion();

  const accentBySlug = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of projects) m.set(p.slug, p.accent ?? "var(--brand)");
    return m;
  }, [projects]);

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="mx-auto w-full max-w-[920px] px-6 py-12">
      <ol className="relative" style={{ listStyle: "none" }}>
        {milestones.map((m, i) => {
          const progress =
            m.inScope > 0 ? m.shipped / m.inScope : m.status === "shipped" ? 1 : 0;
          const complete = progress >= 0.999;
          const accent = accentBySlug.get(m.projectSlug) ?? "var(--brand)";
          const isLast = i === milestones.length - 1;
          const tminus = m.targetDate ? daysUntil(m.targetDate) : null;

          return (
            <motion.li
              key={m.id}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: reduce ? 0 : i * 0.08 }}
              className="relative flex gap-5 pb-9"
            >
              {/* Spine + station node */}
              <div className="relative flex w-7 flex-shrink-0 flex-col items-center">
                <Node complete={complete} accent={accent} reduce={!!reduce} />
                {!isLast ? (
                  <span
                    aria-hidden
                    className="mt-1 w-px flex-1"
                    style={{
                      background: complete
                        ? "var(--status-shipped)"
                        : "var(--border-soft)",
                      minHeight: 56,
                    }}
                  />
                ) : null}
              </div>

              {/* Station card */}
              <div
                className="flex-1 rounded-2xl border p-5 transition-colors"
                style={{
                  background: complete
                    ? "color-mix(in srgb, var(--status-shipped) 7%, var(--bg-elev))"
                    : "var(--bg-elev)",
                  borderColor: complete
                    ? "color-mix(in srgb, var(--status-shipped) 34%, transparent)"
                    : "var(--border-soft)",
                }}
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <div
                      className="mb-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.13em]"
                      style={{ color: "var(--ink-quiet)" }}
                    >
                      {m.targetDate
                        ? formatLong(m.targetDate)
                        : "No date set"}
                      {tminus !== null ? (
                        <span style={{ color: accent }}>
                          {"  ·  "}
                          {tminus > 0
                            ? `${tminus} day${tminus === 1 ? "" : "s"} to go`
                            : tminus === 0
                              ? "today"
                              : complete
                                ? "done"
                                : `${-tminus} day${tminus === -1 ? "" : "s"} ago`}
                        </span>
                      ) : null}
                    </div>
                    <h3
                      className="text-[17px] font-semibold leading-snug"
                      style={{
                        color: "var(--ink)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {m.title}
                    </h3>
                  </div>
                  <Ring
                    progress={progress}
                    complete={complete}
                    accent={accent}
                    reduce={!!reduce}
                  />
                </div>

                {/* Feeding items — a calm pip row, not a list */}
                {m.feeding.length > 0 ? (
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {m.feeding.map((s, idx) => (
                      <span
                        key={idx}
                        aria-hidden
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{
                          background: STATUS_DOT[s],
                          opacity: s === "shipped" ? 1 : 0.5,
                        }}
                      />
                    ))}
                    <span
                      className="ml-1.5 text-[12px]"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      {complete
                        ? "Everything for this is done."
                        : `${m.shipped} of ${m.inScope} done`}
                    </span>
                  </div>
                ) : (
                  <p
                    className="mt-4 text-[12px]"
                    style={{ color: "var(--ink-faint)" }}
                  >
                    Nothing scheduled toward this yet.
                  </p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

function Node({
  complete,
  accent,
  reduce,
}: {
  complete: boolean;
  accent: string;
  reduce: boolean;
}) {
  return (
    <motion.span
      initial={reduce ? false : { scale: 0.4, opacity: 0 }}
      animate={reduce ? undefined : { scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 24, delay: 0.1 }}
      className="relative z-10 mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border-2"
      style={{
        background: complete ? "var(--status-shipped)" : "var(--bg)",
        borderColor: complete ? "var(--status-shipped)" : accent,
      }}
    >
      {complete ? (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <span
          aria-hidden
          className="h-2 w-2 rounded-full"
          style={{ background: accent }}
        />
      )}
    </motion.span>
  );
}

function Ring({
  progress,
  complete,
  accent,
  reduce,
}: {
  progress: number;
  complete: boolean;
  accent: string;
  reduce: boolean;
}) {
  const size = 52;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  const ringColor = complete ? "var(--status-shipped)" : accent;

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${pct}% complete`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border-soft)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={reduce ? false : { strokeDashoffset: c }}
          animate={{
            strokeDashoffset: c * (1 - Math.max(0, Math.min(1, progress))),
          }}
          transition={{
            duration: reduce ? 0 : 1.1,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.2,
          }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-mono text-[11.5px] font-semibold tabular-nums"
        style={{ color: complete ? "var(--status-shipped)" : "var(--ink)" }}
      >
        {pct}
        <span className="ml-px text-[8px]" style={{ opacity: 0.7 }}>
          %
        </span>
      </span>
    </div>
  );
}

function daysUntil(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return 0;
  const target = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const now = new Date();
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return Math.round((target - today) / 86_400_000);
}

function formatLong(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
