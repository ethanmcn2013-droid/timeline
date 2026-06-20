"use client";

import { motion } from "motion/react";
import { MONTH_LABELS, type DomainId, DOMAINS } from "@/lib/domains";
import {
  EASE_OUT_EXPO,
  MORPH_DURATION_S,
  type Row,
  STATUS_TOKEN,
} from "./types";

type Props = {
  rows: Row[];
  domain: DomainId;
};

/**
 * Gantt view (showcase) — horizontal duration bars across a month axis. Each
 * row's bar spans its real startMonth→endMonth from the demo domain pack
 * (honest here: the demo data carries spans, unlike the live product, which
 * only has single target dates — see roadmap/gantt-view.tsx). A vertical
 * "Today" line marks the current month. Bars cross-fade when the demo morphs
 * between Gantt ↔ Timeline. (2026-06-20: the demo's two views became Gantt +
 * Timeline; this is the Gantt.)
 */
export function DemoGanttView({ rows, domain }: Props) {
  const pack = DOMAINS[domain];
  const windowStart = pack.timelineStart;
  const windowEnd = pack.timelineEnd;
  const span = Math.max(1, windowEnd - windowStart + 1);
  const todayLeftPct = ((pack.todayMonth - windowStart + 0.5) / span) * 100;

  // Each row gets a fixed row height so layout-id morph from list → timeline
  // is geometric (FLIP). Bars are absolutely positioned within each row.
  return (
    <div className="relative w-full">
      {/* Header — month axis */}
      <div
        className="mb-3 grid items-end"
        style={{
          gridTemplateColumns: `180px repeat(${span}, 1fr)`,
          borderBottom: "1px solid var(--border-soft)",
          paddingBottom: 6,
        }}
      >
        <span
          className="font-mono text-[10.5px] font-semibold uppercase"
          style={{
            color: "var(--ink-quiet)",
            letterSpacing: "0.12em",
          }}
        >
          Item
        </span>
        {Array.from({ length: span }, (_, i) => {
          const monthIndex = (windowStart + i) % 12;
          return (
            <span
              key={i}
              className="font-mono text-[10.5px] font-semibold uppercase"
              style={{
                color: "var(--ink-quiet)",
                letterSpacing: "0.1em",
                paddingLeft: i === 0 ? 4 : 0,
                borderLeft: i === 0 ? undefined : "1px solid var(--border-soft)",
                textAlign: "center",
              }}
            >
              {MONTH_LABELS[monthIndex]}
            </span>
          );
        })}
      </div>

      {/* Today line — drawn over the whole grid */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute z-10"
        style={{
          top: 28,
          bottom: 0,
          left: `calc(180px + (100% - 180px) * ${todayLeftPct / 100})`,
          width: 1,
          transformOrigin: "top center",
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{
          duration: 0.32,
          delay: 0.6,
          ease: EASE_OUT_EXPO,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(to bottom, transparent, var(--brand) 6%, var(--brand) 94%, transparent)`,
            boxShadow: "0 0 6px var(--brand-glow)",
          }}
        />
        <motion.div
          className="absolute -translate-x-1/2 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white"
          style={{
            top: -10,
            left: "50%",
            background: "var(--brand)",
            whiteSpace: "nowrap",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.85,
            type: "spring",
            stiffness: 380,
            damping: 22,
          }}
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
          const widthMonths = Math.max(0.6, end - start + 1);
          const leftPct = (offsetMonths / span) * 100;
          const widthPct = (widthMonths / span) * 100;

          return (
            <motion.div
              key={row.id}
              layout="position"
              layoutId={row.id}
              transition={{
                layout: { duration: MORPH_DURATION_S, ease: EASE_OUT_EXPO },
              }}
              className="grid items-center"
              style={{
                gridTemplateColumns: `180px 1fr`,
                minHeight: 38,
              }}
            >
              {/* Label gutter */}
              <div className="flex items-center gap-2 pr-3">
                <span
                  aria-hidden
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: STATUS_TOKEN[row.status],
                    flexShrink: 0,
                  }}
                />
                <span
                  className="truncate text-[12.5px]"
                  style={{
                    color: "var(--ink)",
                    fontWeight: 500,
                  }}
                >
                  {row.title}
                </span>
              </div>

              {/* Bar track */}
              <div
                className="relative h-full"
                style={{
                  background:
                    "linear-gradient(to right, var(--border-soft) 1px, transparent 1px)",
                  backgroundSize: `${100 / span}% 100%`,
                }}
              >
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 rounded-md"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    height: 18,
                    background: `color-mix(in srgb, ${STATUS_TOKEN[row.status]} 18%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${STATUS_TOKEN[row.status]} 60%, transparent)`,
                  }}
                  animate={{
                    background: `color-mix(in srgb, ${STATUS_TOKEN[row.status]} 18%, transparent)`,
                    borderColor: `color-mix(in srgb, ${STATUS_TOKEN[row.status]} 60%, transparent)`,
                  }}
                  transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
                >
                  <div
                    className="flex h-full items-center px-2"
                    style={{
                      gap: 6,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: STATUS_TOKEN[row.status],
                        flexShrink: 0,
                      }}
                    />
                    <span
                      className="truncate text-[10.5px] font-mono"
                      style={{
                        color: "var(--ink-soft)",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {row.date}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
