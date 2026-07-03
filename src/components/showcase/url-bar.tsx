"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";

type Props = {
  url: string;
  /** True when a cursor is "pressing" the share button, flashes brand bg. */
  sharePressed?: boolean;
};

/**
 * The shared-URL bar at the top of the demo surface.
 * Carries the position: Roadmap is the audience surface, not the workspace.
 *
 * viewCount ticker removed in phase 1 unification, it was fake engagement
 * theatre. The URL bar now shows just the workspace URL and the Share button,
 * which reflects what the product actually gives you.
 */
export const UrlBar = forwardRef<HTMLButtonElement, Props>(function UrlBar(
  { url, sharePressed },
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
      <div className="flex min-w-0 flex-1 items-center gap-2">
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
          className="truncate font-mono text-[12px]"
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
          background: sharePressed ? "var(--brand)" : "var(--bg-elev)",
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
    </div>
  );
});
