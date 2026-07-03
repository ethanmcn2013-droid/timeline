"use client";

import { motion } from "motion/react";
import { MONTH_LABELS, type DomainId, DOMAINS } from "@/lib/domains";
import {
  EASE_OUT_EXPO,
  MORPH_DURATION_S,
  type Row,
  type RowStatus,
} from "./types";

type Props = {
  rows: Row[];
  domain: DomainId;
};

const LABEL_COL = 180;

/**
 * Gantt view (showcase) — redesigned 2026-07-03 (review 21).
 *
 * Calm, on-brand: one hairline spine, one indigo now-marker, quiet month ticks.
 * Status is read by WEIGHT, not by hue — the two things live *now* (doing, held)
 * carry the single indigo accent; everything shipped or still ahead recedes into
 * quiet ink. The whole board reads at a glance: what's moving is what's lit.
 *
 * Bars span each row's real startMonth→endMonth from the demo domain pack, and
 * cross-fade / FLIP (layoutId) when the demo morphs between Gantt ↔ Timeline.
 */

// "now" = the items in flight; they earn the one accent. Past and future stay quiet.
function isNow(status: RowStatus) {
  return status === "doing" || status === "held";
}

function barStyle(status: RowStatus): React.CSSProperties {
  if (status === "doing") {
    // in flight — the accent, filled
    return {
      background: "color-mix(in srgb, var(--brand) 13%, transparent)",
      border: "1px solid color-mix(in srgb, var(--brand) 42%, transparent)",
    };
  }
  if (status === "held") {
    // in the now-window but stuck — accent outline, hollow
    return {
      background: "transparent",
      border: "1px dashed color-mix(in srgb, var(--brand) 46%, transparent)",
    };
  }
  if (status === "shipped") {
    // done, behind us — a quiet filled hairline
    return {
      background: "color-mix(in srgb, var(--ink) 5%, transparent)",
      border: "1px solid var(--border-soft)",
    };
  }
  // next — still ahead, quiet outline
  return {
    background: "transparent",
    border: "1px solid var(--border-soft)",
  };
}

export function DemoGanttView({ rows, domain }: Props) {
  const pack = DOMAINS[domain];
  const windowStart = pack.timelineStart;
  const windowEnd = pack.timelineEnd;
  const span = Math.max(1, windowEnd - windowStart + 1);
  const todayLeftPct = ((pack.todayMonth - windowStart + 0.5) / span) * 100;

  return (
    <div className="relative w-full">
      {/* Header — quiet month axis over a single hairline spine */}
      <div
        className="mb-3 grid items-end"
        style={{
          gridTemplateColumns: `${LABEL_COL}px repeat(${span}, 1fr)`,
          borderBottom: "1px solid var(--border-soft)",
          paddingBottom: 7,
        }}
      >
        <span
          className="font-mono text-[10.5px] font-semibold uppercase"
          style={{ color: "var(--ink-faint)", letterSpacing: "0.12em" }}
        >
          Item
        </span>
        {Array.from({ length: span }, (_, i) => {
          const monthIndex = (windowStart + i) % 12;
          const isTodayMonth = windowStart + i === pack.todayMonth;
          return (
            <span
              key={i}
              className="font-mono text-[10.5px] font-semibold uppercase"
              style={{
                color: isTodayMonth ? "var(--brand)" : "var(--ink-faint)",
                letterSpacing: "0.1em",
                textAlign: "center",
              }}
            >
              {MONTH_LABELS[monthIndex]}
            </span>
          );
        })}
      </div>

      {/* Today — one clean indigo now-marker, no glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute z-10"
        style={{
          top: 26,
          bottom: 4,
          left: `calc(${LABEL_COL}px + (100% - ${LABEL_COL}px) * ${todayLeftPct / 100})`,
          width: 1,
          background: "var(--brand)",
          transformOrigin: "top center",
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.34, delay: 0.5, ease: EASE_OUT_EXPO }}
      >
        <motion.div
          className="absolute -translate-x-1/2 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white"
          style={{ top: -9, left: "50%", background: "var(--brand)", whiteSpace: "nowrap" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.78, type: "spring", stiffness: 380, damping: 24 }}
        >
          Today
        </motion.div>
      </motion.div>

      {/* Rows */}
      <div className="relative flex flex-col gap-1.5">
        {rows.map((row) => {
          const start = Math.max(row.startMonth, windowStart);
          const end = Math.min(row.endMonth, windowEnd);
          const offsetMonths = Math.max(0, start - windowStart);
          const widthMonths = Math.max(0.62, end - start + 1);
          const leftPct = (offsetMonths / span) * 100;
          const widthPct = (widthMonths / span) * 100;
          const now = isNow(row.status);
          const accent = now ? "var(--brand)" : "var(--ink-faint)";
          const barCss: React.CSSProperties = {
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            height: 16,
            gap: 6,
            ...barStyle(row.status),
          };

          return (
            <motion.div
              key={row.id}
              layout="position"
              layoutId={row.id}
              transition={{ layout: { duration: MORPH_DURATION_S, ease: EASE_OUT_EXPO } }}
              className="grid items-center"
              style={{ gridTemplateColumns: `${LABEL_COL}px 1fr`, minHeight: 38 }}
            >
              {/* Label gutter */}
              <div className="flex items-center gap-2 pr-3">
                <span
                  aria-hidden
                  style={{ width: 6, height: 6, borderRadius: "50%", background: accent, flexShrink: 0 }}
                />
                <span
                  className="truncate text-[12.5px]"
                  style={{
                    color: now ? "var(--ink)" : "var(--ink-soft)",
                    fontWeight: now ? 550 : 450,
                  }}
                >
                  {row.title}
                </span>
              </div>

              {/* Bar track — quiet month ticks, calm bar */}
              <div
                className="relative h-full"
                style={{
                  background:
                    "linear-gradient(to right, color-mix(in srgb, var(--border-soft) 60%, transparent) 1px, transparent 1px)",
                  backgroundSize: `${100 / span}% 100%`,
                }}
              >
                <div
                  className="absolute top-1/2 flex -translate-y-1/2 items-center rounded-md px-2"
                  style={barCss}
                >
                  <span
                    aria-hidden
                    style={{ width: 4, height: 4, borderRadius: "50%", background: accent, flexShrink: 0 }}
                  />
                  <span
                    className="truncate font-mono text-[10px]"
                    style={{
                      color: now ? "var(--ink-soft)" : "var(--ink-quiet)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {row.date}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
