"use client";

import { AnimatePresence, motion } from "motion/react";

export type ToastVariant = "copied" | "subscribed";

type Props = {
  variant: ToastVariant | null;
};

const COPY: Record<ToastVariant, { icon: React.ReactNode; text: string }> = {
  copied: {
    icon: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    text: "Link copied",
  },
  subscribed: {
    icon: (
      <svg
        width="11"
        height="11"
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
    ),
    text: "+1 subscriber via RSS",
  },
};

/**
 * Bottom-right notification toast. Used for the share-copy moment and
 * for the ambient "+1 subscriber" RSS arrival. Single component, variant
 * picks the icon and text. Auto-dismiss is owned by the parent scene loop.
 */
export function DemoToast({ variant }: Props) {
  const active = variant ? COPY[variant] : null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute right-3 bottom-3 z-40 sm:right-5 sm:bottom-5"
    >
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key={variant}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-medium"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg-elev)",
              color: "var(--ink)",
              boxShadow: "var(--shadow-2)",
              fontWeight: 500,
              letterSpacing: "-0.005em",
            }}
          >
            <span style={{ color: "var(--brand)" }}>{active.icon}</span>
            {active.text}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
