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
import type { CommentThread } from "./comment-thread";

type Props = {
  view: ViewMode;
  rows: Row[];
  domain: DomainId;
  onRegister?: (id: string, el: HTMLDivElement | null) => void;
  highlights?: Set<string>;
  threadRowId?: string | null;
  threadComments?: React.ComponentProps<typeof CommentThread>["comments"];
};

/**
 * The view-switching surface. Cards (rows) have stable layoutIds so motion
 * FLIPs them between List and Timeline geometry. Chrome cross-fades on the
 * trailing tail of the geometry tween.
 */
export function DemoSurface({
  view,
  rows,
  domain,
  onRegister,
  highlights,
  threadRowId,
  threadComments,
}: Props) {
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
            <ListView
              rows={rows}
              onRegister={onRegister}
              highlights={highlights}
              threadRowId={threadRowId}
              threadComments={threadComments}
            />
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
