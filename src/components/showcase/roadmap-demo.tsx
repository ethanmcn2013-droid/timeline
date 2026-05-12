"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { DOMAINS, type DomainId } from "@/lib/domains";
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

const INITIAL_VIEWERS: Viewer[] = [
  { id: "a", laneIndex: 0, visible: false },
  { id: "b", laneIndex: 1, visible: false },
  { id: "c", laneIndex: 2, visible: false },
];

function buildInitialState(domain: DomainId): DemoState {
  return {
    rows: DOMAINS[domain].rows.map((r) => ({ ...r })),
    viewers: INITIAL_VIEWERS.map((v) => ({ ...v })),
    viewCount: 12,
    scene: "boot",
    domain,
  };
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Props = {
  domain?: DomainId;
};

export function RoadmapDemo({ domain = "wedding" }: Props = {}) {
  const reducedMotion = useReducedMotion();
  const pack = DOMAINS[domain];
  const [state, setState] = useState<DemoState>(() => buildInitialState(domain));
  const aliveRef = useRef(true);
  const loopKeyRef = useRef(0);

  /** When domain changes, reset state to that pack's seed. */
  useEffect(() => {
    setState(buildInitialState(domain));
    loopKeyRef.current += 1;
  }, [domain]);

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

  /** Run the scene timeline. Restarts cleanly when domain changes. */
  useEffect(() => {
    if (reducedMotion) return;
    aliveRef.current = true;
    const myLoopKey = loopKeyRef.current;
    const transitions = DOMAINS[domain].transitions;

    async function runLoop() {
      setState(buildInitialState(domain));
      await wait(600);
      if (!aliveRef.current || myLoopKey !== loopKeyRef.current) return;

      setScene("viewers-arrive");
      setViewers((vs) => vs.map((v, i) => (i < 2 ? { ...v, visible: true } : v)));
      await wait(2000);
      if (!aliveRef.current || myLoopKey !== loopKeyRef.current) return;

      setScene("first-move");
      setViewers((vs) => vs.map((v, i) => (i === 2 ? { ...v, visible: true } : v)));
      await wait(600);
      if (!aliveRef.current || myLoopKey !== loopKeyRef.current) return;

      if (transitions[0]) {
        setRowStatus(transitions[0].id, transitions[0].to, transitions[0].movedAt);
      }
      await wait(1400);
      if (!aliveRef.current || myLoopKey !== loopKeyRef.current) return;

      setScene("tick-up-1");
      tickViewers(2);
      await wait(1200);
      if (!aliveRef.current || myLoopKey !== loopKeyRef.current) return;

      setScene("second-move");
      if (transitions[1]) {
        setRowStatus(transitions[1].id, transitions[1].to, transitions[1].movedAt);
      }
      await wait(1600);
      if (!aliveRef.current || myLoopKey !== loopKeyRef.current) return;

      setScene("tick-up-2");
      tickViewers(3);
      await wait(1200);
      if (!aliveRef.current || myLoopKey !== loopKeyRef.current) return;

      setScene("third-move");
      if (transitions[2]) {
        setRowStatus(transitions[2].id, transitions[2].to, transitions[2].movedAt);
      }
      await wait(1800);
      if (!aliveRef.current || myLoopKey !== loopKeyRef.current) return;

      setScene("viewers-leave");
      setViewers((vs) => vs.map((v) => ({ ...v, visible: false })));
      await wait(1400);
      if (!aliveRef.current || myLoopKey !== loopKeyRef.current) return;

      setScene("reset");
      await wait(1200);
      if (!aliveRef.current || myLoopKey !== loopKeyRef.current) return;
    }

    let cancelled = false;
    (async function loop() {
      while (!cancelled && aliveRef.current && myLoopKey === loopKeyRef.current) {
        await runLoop();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reducedMotion, domain, setScene, setRowStatus, setViewers, tickViewers]);

  // Group rows by status for rendering.
  const groups = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        status,
        items: state.rows.filter((r) => r.status === status),
      })),
    [state.rows]
  );

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
      <UrlBar url={pack.workspaceUrl} viewCount={state.viewCount} />

      <div className="relative px-5 pb-6 pt-5 sm:px-7 sm:pt-6">
        {/* Page header */}
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p
              className="text-[11px] font-semibold uppercase"
              style={{
                color: "var(--ink-quiet)",
                letterSpacing: "0.14em",
              }}
            >
              {pack.workspaceEyebrow}
            </p>
            <h3
              className="mt-1 text-[20px] font-semibold sm:text-[22px]"
              style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}
            >
              {pack.workspaceTitle}
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
          <div className="relative flex flex-col gap-6">
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
              top={80 + v.laneIndex * 64 + i * 18}
              right={2}
              delay={i * 0.32}
            />
          ))}
        </div>
      </div>

      {/* Caption */}
      <div
        className="border-t px-5 py-3 text-[11px] sm:px-7"
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
