"use client";

import { motion } from "motion/react";
import { type DomainId, DOMAINS } from "@/lib/domains";
import { EASE_OUT_EXPO, type Row, STATUS_TOKEN } from "./types";

type Props = {
  rows: Row[];
  domain: DomainId;
};

/**
 * Timeline view (showcase) — a single straight line with each beat plotted as
 * a point in date order, mirroring the live product's Timeline view
 * (roadmap/workspace-timeline.tsx). The companion to the Gantt: same data, read
 * as "the moments, in order" instead of "bars across months". Points sit at
 * each row's endMonth (the moment it lands); a "Today" tick marks the present.
 */
export function DemoTimelineView({ rows, domain }: Props) {
  const pack = DOMAINS[domain];

  const ordered = [...rows].sort((a, b) => a.endMonth - b.endMonth);

  // Even-spaced slots in date order. The live product reads "the moments, in
  // order", so points get one slot each rather than a raw month fraction —
  // otherwise several beats landing in the same month stack on the same x and
  // their labels garble (review fix 2026-07-03). One slot per beat also means
  // adjacent labels alternate above/below and never collide.
  const PAD = 9;
  const BAND = 100 - 2 * PAD;
  const n = Math.max(1, ordered.length);
  const slotFrac = (i: number) => PAD + ((i + 0.5) / n) * BAND;
  // Today sits just past the last beat already behind us.
  const passedCount = ordered.filter((r) => r.endMonth < pack.todayMonth).length;
  const todayFrac = PAD + (passedCount / n) * BAND;

  return (
    <div className="relative w-full overflow-x-auto pb-2">
      <div className="relative" style={{ minWidth: Math.max(560, ordered.length * 132), height: 232 }}>
        {/* Base line + progress fill to today */}
        <div aria-hidden className="absolute left-0 right-0" style={{ top: "50%", height: 2, background: "var(--border-soft)" }} />
        <motion.div
          aria-hidden
          className="absolute left-0"
          style={{ top: "50%", height: 2, background: "var(--brand)", transformOrigin: "left center", opacity: 0.85, width: `${todayFrac}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.15 }}
        />

        {/* Today tick */}
        <div aria-hidden className="absolute" style={{ left: `${todayFrac}%`, top: 18, bottom: 18, width: 1, transform: "translateX(-0.5px)", background: "linear-gradient(to bottom, transparent, var(--brand) 14%, var(--brand) 86%, transparent)" }}>
          <span className="absolute -translate-x-1/2 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white" style={{ top: -8, left: "50%", background: "var(--brand)", whiteSpace: "nowrap" }}>
            Today
          </span>
        </div>

        {/* Points */}
        {ordered.map((row, i) => {
          const left = slotFrac(i);
          const above = i % 2 === 0;
          const color = STATUS_TOKEN[row.status];
          const done = row.status === "shipped";
          return (
            <motion.div
              key={row.id}
              className="absolute flex flex-col items-center"
              style={{
                left: `${left}%`,
                transform: "translateX(-50%)",
                top: above ? 16 : "50%",
                height: "calc(50% - 16px)",
                justifyContent: above ? "flex-start" : "flex-end",
                width: 124,
              }}
              initial={{ opacity: 0, y: above ? -8 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: 0.2 + i * 0.06 }}
            >
              {above ? <PointLabel row={row} /> : null}
              <span aria-hidden className="w-px flex-1" style={{ background: "var(--border-soft)", minHeight: 12 }} />
              <span
                className="relative z-10 inline-flex items-center justify-center rounded-full border-2"
                style={{
                  width: 15,
                  height: 15,
                  marginTop: above ? 0 : -7.5,
                  marginBottom: above ? -7.5 : 0,
                  background: done ? color : "var(--bg-elev)",
                  borderColor: color,
                }}
              >
                {done ? (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                )}
              </span>
              {!above ? (
                <>
                  <span aria-hidden className="w-px" style={{ background: "var(--border-soft)", height: 12 }} />
                  <PointLabel row={row} />
                </>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function PointLabel({ row }: { row: Row }) {
  return (
    <div className="w-full text-center">
      <div className="mb-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--ink-quiet)" }}>
        {row.date}
      </div>
      <div className="text-[12px] font-semibold leading-snug" style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}>
        {row.title}
      </div>
    </div>
  );
}
