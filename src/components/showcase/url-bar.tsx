"use client";

import { motion, AnimatePresence } from "motion/react";
import { forwardRef } from "react";

type Props = {
  url: string;
  viewCount: number;
  /** True when a cursor is "pressing" the share button — flashes brand bg. */
  sharePressed?: boolean;
};

/**
 * The shared-URL bar at the top of the demo surface.
 * Carries the position: Roadmap is the audience surface, not the workspace.
 *
 * Includes a Share button that the scene loop "presses" via the
 * `sharePressed` flag before the toast fires, making the share gesture
 * legible to the viewer.
 */
export const UrlBar = forwardRef<HTMLButtonElement, Props>(function UrlBar(
  { url, viewCount, sharePressed },
  shareRef
) {
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

      {/* Share button */}
      <motion.button
        ref={shareRef}
        type="button"
        animate={{
          background: sharePressed
            ? "var(--brand)"
            : "var(--bg-elev)",
          color: sharePressed ? "#ffffff" : "var(--ink-soft)",
          scale: sharePressed ? 0.96 : 1,
        }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
        style={{
          borderColor: "var(--border)",
          letterSpacing: "-0.005em",
          cursor: "default",
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Share
      </motion.button>

      {/* Viewers pill */}
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
        <span style={{ opacity: 0.75 }}>viewers</span>
      </div>
    </div>
  );
});
