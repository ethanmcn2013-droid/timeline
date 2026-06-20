"use client";

import { AnimatePresence, motion } from "motion/react";
import type { DomainId } from "@/lib/domains";
import {
  EASE_OUT_EXPO,
  type Row,
  type ViewMode,
} from "./types";
import { DemoGanttView } from "./timeline-view";
import { DemoTimelineView } from "./timeline-points";

type Props = {
  view: ViewMode;
  rows: Row[];
  domain: DomainId;
  // Retained as optional for call-site compatibility; the Gantt/Timeline views
  // don't use per-row registration or highlights (those were List-view affordances).
  onRegister?: (id: string, el: HTMLDivElement | null) => void;
  highlights?: Set<string>;
};

/**
 * The view-switching surface: cross-fades between the Gantt (duration bars) and
 * the Timeline (line of points) on the demo's morph beat.
 */
export function DemoSurface({ view, rows, domain }: Props) {
  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        {view === "gantt" ? (
          <motion.div
            key="gantt"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.34, ease: EASE_OUT_EXPO }}
          >
            <DemoGanttView rows={rows} domain={domain} />
          </motion.div>
        ) : (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.34, ease: EASE_OUT_EXPO }}
          >
            <DemoTimelineView rows={rows} domain={domain} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
