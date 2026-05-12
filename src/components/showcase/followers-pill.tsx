"use client";

import { AnimatePresence, motion } from "motion/react";

type Props = {
  count: number;
};

/**
 * "Followers" counter pill that sits in the demo header alongside the
 * View toggle. Ambient surface — implies the page has an audience
 * subscribed to its updates, not just one-time viewers.
 */
export function FollowersPill({ count }: Props) {
  const formatted =
    count >= 1000 ? (count / 1000).toFixed(1) + "k" : count.toString();

  return (
    <div
      className="hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-mono sm:inline-flex"
      style={{
        borderColor: "var(--border-soft)",
        background: "var(--bg-elev)",
        color: "var(--ink-soft)",
        letterSpacing: "0.02em",
      }}
    >
      <svg
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 11a9 9 0 0 1 9 9" />
        <path d="M4 4a16 16 0 0 1 16 16" />
        <circle cx="5" cy="19" r="1.4" fill="currentColor" />
      </svg>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 6, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "inline-block" }}
        >
          {formatted}
        </motion.span>
      </AnimatePresence>
      <span style={{ opacity: 0.75 }}>following</span>
    </div>
  );
}
