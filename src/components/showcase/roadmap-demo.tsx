"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { DOMAINS, type DomainId } from "@/lib/domains";
import {
  type DemoState,
  type Row,
  type Scene,
  type Viewer,
  type ViewMode,
} from "./types";
import { ViewerDot } from "./viewer-dot";
import { UrlBar } from "./url-bar";
import { ViewToggle } from "./view-toggle";
import { DemoSurface } from "./demo-surface";

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
    view: "list",
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

  const setView = useCallback((view: ViewMode) => {
    setState((s) => ({ ...s, view }));
  }, []);

  const setViewers = useCallback((mutator: (v: Viewer[]) => Viewer[]) => {
    setState((s) => ({ ...s, viewers: mutator(s.viewers) }));
  }, []);

  const tickViewers = useCallback((delta: number) => {
    setState((s) => ({ ...s, viewCount: s.viewCount + delta }));
  }, []);

  /** Scene timeline. Restarts when domain changes. */
  useEffect(() => {
    if (reducedMotion) return;
    aliveRef.current = true;
    const myLoopKey = loopKeyRef.current;
    const transitions = DOMAINS[domain].transitions;

    const isCurrent = () =>
      aliveRef.current && myLoopKey === loopKeyRef.current;

    async function runLoop() {
      setState(buildInitialState(domain));
      await wait(600);
      if (!isCurrent()) return;

      // Viewers arrive (List view)
      setScene("viewers-arrive");
      setViewers((vs) => vs.map((v, i) => (i < 2 ? { ...v, visible: true } : v)));
      await wait(1800);
      if (!isCurrent()) return;

      setScene("first-move");
      setViewers((vs) => vs.map((v, i) => (i === 2 ? { ...v, visible: true } : v)));
      await wait(500);
      if (transitions[0]) {
        setRowStatus(transitions[0].id, transitions[0].to, transitions[0].movedAt);
      }
      await wait(1300);
      if (!isCurrent()) return;

      setScene("tick-up-1");
      tickViewers(2);
      await wait(1100);
      if (!isCurrent()) return;

      setScene("second-move");
      if (transitions[1]) {
        setRowStatus(transitions[1].id, transitions[1].to, transitions[1].movedAt);
      }
      await wait(1500);
      if (!isCurrent()) return;

      setScene("tick-up-2");
      tickViewers(3);
      await wait(1000);
      if (!isCurrent()) return;

      setScene("third-move");
      if (transitions[2]) {
        setRowStatus(transitions[2].id, transitions[2].to, transitions[2].movedAt);
      }
      await wait(1600);
      if (!isCurrent()) return;

      // Morph to Timeline view — the intelligent-motion teaching moment
      setScene("view-morph-timeline");
      setView("timeline");
      await wait(2400);
      if (!isCurrent()) return;

      setScene("timeline-hold");
      await wait(2400);
      if (!isCurrent()) return;

      // Morph back to List
      setScene("view-morph-list");
      setView("list");
      await wait(1800);
      if (!isCurrent()) return;

      setScene("viewers-leave");
      setViewers((vs) => vs.map((v) => ({ ...v, visible: false })));
      await wait(1200);
      if (!isCurrent()) return;

      setScene("reset");
      await wait(1000);
    }

    let cancelled = false;
    (async function loop() {
      while (!cancelled && isCurrent()) {
        await runLoop();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reducedMotion, domain, setScene, setView, setRowStatus, setViewers, tickViewers]);

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
          <div className="flex items-center gap-2">
            <ViewToggle view={state.view} onChange={setView} />
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
        </div>

        <DemoSurface view={state.view} rows={state.rows} domain={state.domain} />

        {/* Viewer dots in the right margin (List view only — Timeline has
            its own protagonist motion via the bars + Today line) */}
        {state.view === "list" ? (
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
        ) : null}
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
        One URL. Two views. Same data — read it the way the audience needs it.
      </div>
    </div>
  );
}
