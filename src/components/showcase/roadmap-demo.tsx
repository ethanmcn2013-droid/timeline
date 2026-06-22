"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { DOMAINS, type DomainId } from "@/lib/domains";
import {
  type DemoState,
  type Row,
  type Scene,
  type ViewMode,
} from "./types";
import { UrlBar } from "./url-bar";
import { ViewToggle } from "./view-toggle";
import { DemoSurface } from "./demo-surface";
import { DemoToast } from "./toast";

// Fake engagement theatre (ghost cursors, viewCount ticker, followers pill)
// removed in phase 1 unification. The demo loop only does what the product
// actually does: status transitions on real items, view switching between
// List and Timeline. No presence theatre, no fake social proof.

function buildInitialState(domain: DomainId): DemoState {
  const seed = DOMAINS[domain];
  return {
    rows: seed.rows.map((r) => ({ ...r })),
    // Cursor fields retained in DemoState type for backwards-compat,
    // but no cursors are rendered. All cursor arrays are empty.
    cursors: [],
    viewCount: 0,
    scene: "boot",
    view: "gantt",
    domain,
    toast: null,
    followers: 0,
    sharePressed: false,
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
    loopKeyRef.current += 1;
  }, [domain]);

  const setRowStatus = useCallback(
    (id: string, status: Row["status"], movedAt: string) => {
      setState((s) => ({
        ...s,
        rows: s.rows.map((r) =>
          r.id === id ? { ...r, status, movedAt } : { ...r, movedAt: undefined }
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

  const setToast = useCallback((toast: DemoState["toast"]) => {
    setState((s) => ({ ...s, toast }));
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    aliveRef.current = true;
    const myLoopKey = loopKeyRef.current;
    const transitions = DOMAINS[domain].transitions;

    const isCurrent = () =>
      aliveRef.current && myLoopKey === loopKeyRef.current;

    async function runLoop() {
      setState(buildInitialState(domain));
      await wait(900);
      if (!isCurrent()) return;

      // First status transition — show real product behaviour.
      setScene("first-move");
      if (transitions[0]) {
        setRowStatus(transitions[0].id, transitions[0].to, transitions[0].movedAt);
      }
      await wait(1400);
      if (!isCurrent()) return;

      // Second transition.
      setScene("second-move");
      if (transitions[1]) {
        setRowStatus(transitions[1].id, transitions[1].to, transitions[1].movedAt);
      }
      await wait(1400);
      if (!isCurrent()) return;

      // Third transition.
      setScene("third-move");
      if (transitions[2]) {
        setRowStatus(transitions[2].id, transitions[2].to, transitions[2].movedAt);
      }
      await wait(1600);
      if (!isCurrent()) return;

      // Share beat — still honest: shows the share gesture exists.
      setScene("share-copy");
      setState((s) => ({ ...s, sharePressed: true }));
      await wait(240);
      setToast("copied");
      await wait(1200);
      if (!isCurrent()) return;
      setState((s) => ({ ...s, sharePressed: false }));
      setToast(null);
      await wait(300);

      // View morph — demonstrates the two views (Gantt ↔ Timeline).
      // The Timeline view is the payoff of the loop, so it dwells: long
      // enough to actually read the plain-English plan before it flips back
      // (review issue 04 — the previous 2.4s was too quick to land).
      setScene("view-morph-timeline");
      setView("timeline");
      await wait(5200);
      if (!isCurrent()) return;

      setScene("view-morph-gantt");
      setView("gantt");
      await wait(2200);
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
  }, [
    reducedMotion,
    domain,
    setScene,
    setView,
    setRowStatus,
    setToast,
  ]);

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
        url={pack.workspaceUrl}
        sharePressed={state.sharePressed}
      />

      <div className="relative px-5 pb-6 pt-5 sm:px-7 sm:pt-6">
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

        <DemoSurface
          view={state.view}
          rows={state.rows}
          domain={state.domain}
          highlights={new Set()}
        />

        <DemoToast variant={state.toast} />
      </div>

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
