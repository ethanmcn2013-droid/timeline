"use client";

import { motion, AnimatePresence } from "motion/react";

type Props = {
  url: string;
  viewCount: number;
};

/**
 * The shared-URL bar at the top of the demo surface.
 * Carries the position: Roadmap is the audience surface, not the workspace.
 */
export function UrlBar({ url, viewCount }: Props) {
  return (
    <div
      className="flex items-center gap-3 border-b px-4 py-2.5"
      style={{
        borderColor: "var(--border-soft)",
        background: "var(--bg-deep)",
      }}
    >
      {/* Lock icon + url */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          style={{ color: "var(--ink-quiet)", flexShrink: 0 }}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span
          className="truncate text-[12px] font-mono"
          style={{ color: "var(--ink-quiet)", letterSpacing: "0.01em" }}
        >
          {url}
        </span>
      </div>

      {/* View count pill */}
      <div
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono"
        style={{
          background: "var(--brand-soft)",
          color: "var(--brand)",
          letterSpacing: "0.02em",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--brand)",
            display: "inline-block",
          }}
        />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={viewCount}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "inline-block" }}
          >
            {viewCount}
          </motion.span>
        </AnimatePresence>
        <span style={{ opacity: 0.75 }}>viewers this week</span>
      </div>
    </div>
  );
}
