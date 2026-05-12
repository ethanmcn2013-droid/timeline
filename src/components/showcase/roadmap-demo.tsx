"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  type DemoState,
  type Row,
  type Scene,
  STATUS_LABEL,
  STATUS_ORDER,
  type Viewer,
} from "./types";
import { ViewerDot } from "./viewer-dot";
import { UrlBar } from "./url-bar";
import { RoadmapRow } from "./roadmap-row";

const INITIAL_ROWS: Row[] = [
  { id: "venue", title: "Venue contract signed", status: "shipped", date: "Jan 12" },
  { id: "save-dates", title: "Save-the-date sent", status: "shipped", date: "Feb 04" },
  { id: "catering", title: "Catering tasting Friday", status: "doing", date: "This week" },
  { id: "honeymoon", title: "Honeymoon flights", status: "doing", date: "Mar 18" },
  { id: "florist", title: "Florist deposit", status: "held", date: "Held since Mar 02" },
  { id: "invitations", title: "Invitations", status: "next", date: "Apr" },
  { id: "timeline", title: "Day-of timeline", status: "next", date: "May" },
];

const INITIAL_VIEWERS: Viewer[] = [
  { id: "a", laneIndex: 0, visible: false },
  { id: "b", laneIndex: 1, visible: false },
  { id: "c", laneIndex: 2, visible: false },
];

const INITIAL_STATE: DemoState = {
  rows: INITIAL_ROWS,
  viewers: INITIAL_VIEWERS,
  viewCount: 12,
  scene: "boot",
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function RoadmapDemo() {
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<DemoState>(INITIAL_STATE);
  const aliveRef = useRef(true);

  /** Helper that mutates a single row and clears all other movedAt flags. */
  const setRowStatus = useCallback(
    (id: string, status: Row["status"], movedAt: string) => {
      setState((s) => ({
        ...s,
        rows: s.rows.map((r) =>
          r.id === id
            ? { ...r, status, movedAt }
            : { ...r, movedAt: undefined }
        ),
      }));
    },
    []
  );

  const setScene = useCallback((scene: Scene) => {
    setState((s) => ({ ...s, scene }));
  }, []);

  const setViewers = useCallback((mutator: (v: Viewer[]) => Viewer[]) => {
    setState((s) => ({ ...s, viewers: mutator(s.viewers) }));
  }, []);

  const tickViewers = useCallback((delta: number) => {
    setState((s) => ({ ...s, viewCount: s.viewCount + delta }));
  }, []);

  const resetRows = useCallback(() => {
    setState((s) => ({
      ...s,
      rows: INITIAL_ROWS,
      viewers: INITIAL_VIEWERS,
      viewCount: 12,
    }));
  }, []);

  /** Run the scene timeline. Bails on unmount via aliveRef. */
  useEffect(() => {
    if (reducedMotion) return;
    aliveRef.current = true;

    async function runLoop() {
      // Reset to known state at the start of each loop.
      resetRows();
      await wait(600);
      if (!aliveRef.current) return;

      // Scene 1 — viewers arrive.
      setScene("viewers-arrive");
      setViewers((vs) => vs.map((v, i) => (i < 2 ? { ...v, visible: true } : v)));
      await wait(2000);
      if (!aliveRef.current) return;

      // Scene 2 — third viewer arrives, first move fires.
      setScene("first-move");
      setViewers((vs) => vs.map((v, i) => (i === 2 ? { ...v, visible: true } : v)));
      await wait(600);
      if (!aliveRef.current) return;

      setRowStatus("catering", "shipped", "12:30pm");
      await wait(1400);
      if (!aliveRef.current) return;

      // Scene 3 — counter ticks.
      setScene("tick-up-1");
      tickViewers(2);
      await wait(1200);
      if (!aliveRef.current) return;

      // Scene 4 — second move.
      setScene("second-move");
      setRowStatus("invitations", "doing", "1:08pm");
      await wait(1600);
      if (!aliveRef.current) return;

      // Scene 5 — counter ticks again.
      setScene("tick-up-2");
      tickViewers(3);
      await wait(1200);
      if (!aliveRef.current) return;

      // Scene 6 — third move (the held-up item resolves).
      setScene("third-move");
      setRowStatus("florist", "doing", "1:42pm");
      await wait(1800);
      if (!aliveRef.current) return;

      // Scene 7 — viewers leave.
      setScene("viewers-leave");
      setViewers((vs) => vs.map((v) => ({ ...v, visible: false })));
      await wait(1400);
      if (!aliveRef.current) return;

      // Scene 8 — quiet hold, then loop.
      setScene("reset");
      await wait(1200);
      if (!aliveRef.current) return;
    }

    let cancelled = false;
    (async function loop() {
      while (!cancelled && aliveRef.current) {
        await runLoop();
      }
    })();

    return () => {
      cancelled = true;
      aliveRef.current = false;
    };
  }, [reducedMotion, resetRows, setScene, setRowStatus, setViewers, tickViewers]);

  // Group rows by status for rendering.
  const groups = STATUS_ORDER.map((status) => ({
    status,
    items: state.rows.filter((r) => r.status === status),
  }));

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        borderRadius: "var(--r-4)",
        border: "1px solid var(--border)",
        background: "var(--bg-elev)",
        boxShadow: "var(--shadow-2)",
      }}
    >
      <UrlBar
        url="roadmap.signalstudio.ie/wedding-spring-26"
        viewCount={state.viewCount}
      />

      {/* Roadmap surface */}
      <div className="relative px-4 pb-5 pt-4 sm:px-5 sm:pt-5">
        {/* Page header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p
              className="text-[11px] font-semibold uppercase"
              style={{
                color: "var(--ink-quiet)",
                letterSpacing: "0.14em",
              }}
            >
              Spring wedding
            </p>
            <h3
              className="mt-1 text-[18px] font-semibold"
              style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}
            >
              The plan, in plain English.
            </h3>
          </div>
          <span
            className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
            style={{
              borderColor: "var(--border-soft)",
              color: "var(--ink-soft)",
            }}
          >
            Public
          </span>
        </div>

        {/* Lanes */}
        <LayoutGroup>
          <div className="relative flex flex-col gap-5">
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
                    <RoadmapRow key={row.id} row={row} />
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

        {/* Viewer dots in the right margin */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-3"
          aria-hidden
        >
          {state.viewers.map((v, i) => (
            <ViewerDot
              key={v.id}
              visible={v.visible}
              top={70 + v.laneIndex * 56 + i * 14}
              right={2}
              delay={i * 0.32}
            />
          ))}
        </div>
      </div>

      {/* Caption */}
      <div
        className="border-t px-4 py-2.5 text-[11px]"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--bg-deep)",
          color: "var(--ink-quiet)",
          letterSpacing: "0.01em",
        }}
      >
        One URL. Everyone reading the same page.
      </div>
    </div>
  );
}
