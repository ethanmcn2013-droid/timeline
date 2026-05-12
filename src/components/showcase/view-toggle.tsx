"use client";

import { motion, LayoutGroup } from "motion/react";
import type { ViewMode } from "./types";

type Props = {
  view: ViewMode;
  onChange?: (next: ViewMode) => void;
};

const ITEMS: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  {
    id: "list",
    label: "List",
    icon: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="3" y="6" width="12" height="3" rx="1" />
        <rect x="6" y="11" width="14" height="3" rx="1" />
        <rect x="2" y="16" width="9" height="3" rx="1" />
      </svg>
    ),
  },
];

/**
 * Pill-toggle for switching the demo's view mode. Animates the active
 * pill with motion's layoutId so the marker slides between states.
 * Sits in the top-right of the demo surface header.
 */
export function ViewToggle({ view, onChange }: Props) {
  return (
    <LayoutGroup id="view-toggle">
      <div
        role="tablist"
        aria-label="View mode"
        className="relative inline-flex items-center gap-0.5 rounded-full border p-0.5"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--bg-elev)",
        }}
      >
        {ITEMS.map((item) => {
          const isActive = item.id === view;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange?.(item.id)}
              className="relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
              style={{
                color: isActive ? "var(--ink)" : "var(--ink-quiet)",
              }}
            >
              {isActive ? (
                <motion.span
                  layoutId="view-toggle-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "var(--bg-deep)",
                    boxShadow: "inset 0 0 0 1px var(--border-soft)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              ) : null}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {item.icon}
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
