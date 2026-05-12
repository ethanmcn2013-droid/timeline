"use client";

import { motion, AnimatePresence } from "motion/react";
import { type Row, STATUS_TOKEN } from "./types";

type Props = {
  row: Row;
};

/**
 * A single roadmap item. Its layoutId is the row id so motion/react can
 * tween position when status changes reorder the surrounding list.
 *
 * The status dot crossfades color when the status changes; the row itself
 * slides into its new section via layout animation in the parent group.
 */
export function RoadmapRow({ row }: Props) {
  return (
    <motion.div
      layout="position"
      layoutId={row.id}
      initial={false}
      transition={{
        layout: { duration: 0.72, ease: [0.16, 1, 0.3, 1] },
      }}
      className="grid items-center gap-3 px-3 py-2.5"
      style={{
        gridTemplateColumns: "16px 1fr auto",
        borderRadius: "var(--r-2)",
        background: "var(--bg-elev)",
        border: "1px solid var(--border-soft)",
      }}
    >
      {/* Status dot */}
      <motion.span
        aria-hidden
        animate={{ background: STATUS_TOKEN[row.status] }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          alignSelf: "center",
          justifySelf: "center",
        }}
      />

      {/* Title */}
      <span
        className="truncate text-[13.5px]"
        style={{ color: "var(--ink)", fontWeight: 500 }}
      >
        {row.title}
      </span>

      {/* Date / moved-at */}
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {row.movedAt ? (
            <motion.span
              key="moved"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.28 }}
              className="text-[10.5px] font-mono"
              style={{
                color: "var(--brand)",
                letterSpacing: "0.02em",
                fontWeight: 600,
              }}
            >
              moved · {row.movedAt}
            </motion.span>
          ) : (
            <motion.span
              key="date"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[11px] font-mono"
              style={{
                color: "var(--ink-quiet)",
                letterSpacing: "0.01em",
              }}
            >
              {row.date}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
