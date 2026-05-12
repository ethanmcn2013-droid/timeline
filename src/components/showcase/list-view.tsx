"use client";

import { LayoutGroup } from "motion/react";
import {
  type Row,
  STATUS_LABEL,
  STATUS_ORDER,
} from "./types";
import { RoadmapRow } from "./roadmap-row";

type Props = {
  rows: Row[];
  onRegister?: (id: string, el: HTMLDivElement | null) => void;
  /** Row ids that should be highlighted (a cursor is reading them). */
  highlights?: Set<string>;
};

export function ListView({
  rows,
  onRegister,
  highlights,
}: Props) {
  const groups = STATUS_ORDER.map((status) => ({
    status,
    items: rows.filter((r) => r.status === status),
  }));

  return (
    <LayoutGroup>
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.status}>
            <div
              className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase"
              style={{
                color: "var(--ink-quiet)",
                letterSpacing: "0.12em",
              }}
            >
              <span>{STATUS_LABEL[group.status]}</span>
              <span
                aria-hidden
                className="font-mono"
                style={{
                  color: "var(--ink-faint, var(--ink-quiet))",
                  opacity: 0.55,
                }}
              >
                {group.items.length}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {group.items.map((row) => (
                <RoadmapRow
                  key={row.id}
                  row={row}
                  onRegister={onRegister}
                  highlight={highlights?.has(row.id)}
                />
              ))}
              {group.items.length === 0 && (
                <div
                  className="rounded-[var(--r-2)] px-3 py-2 text-[12px] font-mono"
                  style={{
                    color: "var(--ink-faint, var(--ink-quiet))",
                    background: "var(--bg-deep)",
                    opacity: 0.5,
                    letterSpacing: "0.01em",
                  }}
                >
                  —
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </LayoutGroup>
  );
}
