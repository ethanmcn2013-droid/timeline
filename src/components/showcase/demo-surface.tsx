"use client";

import { AnimatePresence, motion } from "motion/react";
import type { DomainId } from "@/lib/domains";
import {
  EASE_OUT_EXPO,
  type Row,
  type ViewMode,
} from "./types";
import { ListView } from "./list-view";
import { TimelineView } from "./timeline-view";

type Props = {
  view: ViewMode;
  rows: Row[];
  domain: DomainId;
};

/**
 * The view-switching surface. Modelled on Tasks's DemoSurface pattern:
 * a single mounted set of cards whose geometry is FLIP'd by motion's
 * layout/layoutId between view modes. The wrapping "chrome" (per-view
 * grid + axis) cross-fades on the trailing tail of the geometry tween.
 *
 * Roadmap surfaces two views (no Calendar — scoped out of Phase 2a):
 *  - List: rows grouped by status with section counts
 *  - Timeline: horizontal bars across a month axis with a Today line
 */
export function DemoSurface({ view, rows, domain }: Props) {
  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.34, ease: EASE_OUT_EXPO }}
          >
            <ListView rows={rows} />
          </motion.div>
        ) : (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.34, ease: EASE_OUT_EXPO }}
          >
            <TimelineView rows={rows} domain={domain} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
