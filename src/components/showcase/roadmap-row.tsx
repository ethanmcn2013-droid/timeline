"use client";

import { motion, AnimatePresence } from "motion/react";
import { type Row, STATUS_TOKEN } from "./types";

type Props = {
  row: Row;
  /** When set, the row registers its DOM element under its id. */
  onRegister?: (id: string, el: HTMLDivElement | null) => void;
  /** Set when a cursor is reading this row — adds a soft outline. */
  highlight?: boolean;
};

/**
 * Roadmap row. Its layoutId is stable across view morphs so motion FLIPs
 * each row's geometry from List → Timeline → List without unmount/remount.
 *
 * Registers its DOM node via onRegister so the CursorsLayer can read its
 * bounding box and drive cursor targeting against live coordinates.
 */
export function RoadmapRow({
  row,
  onRegister,
  highlight,
}: Props) {
  return (
    <div className="flex flex-col">
      <motion.div
        ref={(el) => onRegister?.(row.id, el)}
        layout="position"
        layoutId={row.id}
        data-row-id={row.id}
        initial={false}
        animate={{
          boxShadow: highlight
            ? "0 0 0 2px color-mix(in srgb, var(--brand) 32%, transparent)"
            : "none",
        }}
        transition={{
          layout: { duration: 0.72, ease: [0.16, 1, 0.3, 1] },
          boxShadow: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
        }}
        className="grid items-center gap-3 px-3 py-2.5"
        style={{
          gridTemplateColumns: "16px 1fr auto",
          borderRadius: "var(--r-2)",
          background: "var(--bg-elev)",
          border: "1px solid var(--border-soft)",
        }}
      >
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

        <span
          className="truncate text-[13.5px]"
          style={{ color: "var(--ink)", fontWeight: 500 }}
        >
          {row.title}
        </span>

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
    </div>
  );
}
