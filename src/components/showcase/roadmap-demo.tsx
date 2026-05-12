"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { DOMAINS, type DomainId } from "@/lib/domains";
import {
  CURSOR_SEED,
  type Cursor,
  type DemoState,
  type Row,
  type Scene,
  type ViewMode,
} from "./types";
import { Cursor as CursorView } from "./cursor";
import { UrlBar } from "./url-bar";
import { ViewToggle } from "./view-toggle";
import { FollowersPill } from "./followers-pill";
import { DemoSurface } from "./demo-surface";
import { DemoToast } from "./toast";

function buildInitialState(domain: DomainId): DemoState {
  return {
    rows: DOMAINS[domain].rows.map((r) => ({ ...r })),
    cursors: CURSOR_SEED.map((c) => ({ ...c })),
    viewCount: 12,
    scene: "boot",
    view: "list",
    domain,
    threadRowId: null,
    threadTypingReveal: 0,
    toast: null,
  };
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Props = {
  domain?: DomainId;
};

const THREAD_COMMENTS_INITIAL = [
  {
    id: "comment-1",
    author: "Sarah",
    authorColor: "#7c5cff",
    body: "Will this be confirmed by Friday?",
  },
];

const THREAD_REPLY = "Yes — confirming with the supplier this morning.";

export function RoadmapDemo({ domain = "wedding" }: Props = {}) {
  const reducedMotion = useReducedMotion();
  const pack = DOMAINS[domain];
  const [state, setState] = useState<DemoState>(() => buildInitialState(domain));
  const [followers, setFollowers] = useState(1247);
  const [sharePressed, setSharePressed] = useState(false);
  const aliveRef = useRef(true);
  const loopKeyRef = useRef(0);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const rowRefsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setState(buildInitialState(domain));
    setFollowers(1247);
    setSharePressed(false);
    loopKeyRef.current += 1;
  }, [domain]);

  const onRegisterRow = useCallback(
    (id: string, el: HTMLDivElement | null) => {
      if (el) {
        rowRefsRef.current.set(id, el);
      } else {
        rowRefsRef.current.delete(id);
      }
    },
    []
  );

  const getRowCenter = useCallback((rowId: string): { x: number; y: number } | null => {
    const surface = surfaceRef.current;
    const rowEl = rowRefsRef.current.get(rowId);
    if (!surface || !rowEl) return null;
    const surfaceRect = surface.getBoundingClientRect();
    const rowRect = rowEl.getBoundingClientRect();
    return {
      x: rowRect.left - surfaceRect.left + rowRect.width * 0.4,
      y: rowRect.top - surfaceRect.top + rowRect.height * 0.5,
    };
  }, []);

  const getShareCenter = useCallback((): { x: number; y: number } | null => {
    const surface = surfaceRef.current;
    const btn = shareButtonRef.current;
    if (!surface || !btn) return null;
    const surfaceRect = surface.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    return {
      x: btnRect.left - surfaceRect.left + btnRect.width * 0.5,
      y: btnRect.top - surfaceRect.top + btnRect.height * 0.5,
    };
  }, []);

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

  const updateCursor = useCallback(
    (id: Cursor["id"], patch: Partial<Cursor>) => {
      setState((s) => ({
        ...s,
        cursors: s.cursors.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }));
    },
    []
  );

  const setCursorTarget = useCallback(
    (id: Cursor["id"], rowId: string | null, reading = false) => {
      if (!rowId) {
        updateCursor(id, { targetRowId: null, reading: false });
        return;
      }
      const center = getRowCenter(rowId);
      if (!center) {
        updateCursor(id, { targetRowId: rowId, reading });
        return;
      }
      const jitterY = id === "alpha" ? -6 : id === "beta" ? 6 : 0;
      updateCursor(id, {
        targetRowId: rowId,
        x: center.x,
        y: center.y + jitterY,
        reading,
      });
    },
    [getRowCenter, updateCursor]
  );

  const setCursorToShareButton = useCallback(
    (id: Cursor["id"]) => {
      const center = getShareCenter();
      if (!center) return;
      updateCursor(id, {
        targetRowId: null,
        x: center.x,
        y: center.y,
        reading: false,
      });
    },
    [getShareCenter, updateCursor]
  );

  const tickViewers = useCallback((delta: number) => {
    setState((s) => ({ ...s, viewCount: s.viewCount + delta }));
  }, []);

  const tickFollowers = useCallback((delta: number) => {
    setFollowers((n) => n + delta);
  }, []);

  const setThread = useCallback((rowId: string | null, reveal = 0) => {
    setState((s) => ({
      ...s,
      threadRowId: rowId,
      threadTypingReveal: reveal,
    }));
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

    async function typeReply() {
      for (let i = 1; i <= THREAD_REPLY.length; i++) {
        if (!isCurrent()) return;
        setState((s) => ({ ...s, threadTypingReveal: i }));
        await wait(28 + Math.random() * 24);
      }
    }

    async function runLoop() {
      setState(buildInitialState(domain));
      setSharePressed(false);
      await wait(700);
      if (!isCurrent()) return;

      setScene("cursors-arrive");
      updateCursor("alpha", { visible: true });
      await wait(220);
      setCursorTarget("alpha", transitions[0]?.id ?? null, false);
      await wait(380);
      updateCursor("beta", { visible: true });
      await wait(180);
      setCursorTarget("beta", transitions[1]?.id ?? null, false);
      await wait(420);
      updateCursor("gamma", { visible: true });
      setCursorTarget("gamma", "venue", false);
      await wait(1100);
      if (!isCurrent()) return;

      updateCursor("alpha", { reading: true });
      updateCursor("beta", { reading: true });
      updateCursor("gamma", { reading: true });
      await wait(1400);
      if (!isCurrent()) return;
      updateCursor("alpha", { reading: false });
      updateCursor("beta", { reading: false });
      updateCursor("gamma", { reading: false });

      setScene("first-move");
      if (transitions[0]) {
        setRowStatus(transitions[0].id, transitions[0].to, transitions[0].movedAt);
      }
      await wait(900);
      if (!isCurrent()) return;
      if (transitions[0]) setCursorTarget("alpha", transitions[0].id, true);
      await wait(800);
      if (!isCurrent()) return;
      updateCursor("alpha", { reading: false });

      setScene("tick-up-1");
      tickViewers(2);
      await wait(900);
      if (!isCurrent()) return;

      // Share-copy beat: gamma cursor visits the Share button → press
      // animation → toast appears. Now the share gesture is intelligent —
      // a reader presses share, then copies.
      setScene("share-copy");
      setCursorToShareButton("gamma");
      await wait(700);
      if (!isCurrent()) return;
      setSharePressed(true);
      await wait(220);
      setToast("copied");
      await wait(1300);
      if (!isCurrent()) return;
      setSharePressed(false);
      setToast(null);
      await wait(300);

      setScene("second-move");
      if (transitions[1]) {
        setRowStatus(transitions[1].id, transitions[1].to, transitions[1].movedAt);
        setCursorTarget("beta", transitions[1].id, true);
      }
      await wait(1500);
      if (!isCurrent()) return;
      updateCursor("beta", { reading: false });

      setScene("tick-up-2");
      tickViewers(3);
      await wait(900);
      if (!isCurrent()) return;

      setScene("third-move");
      if (transitions[2]) {
        setRowStatus(transitions[2].id, transitions[2].to, transitions[2].movedAt);
        setCursorTarget("gamma", transitions[2].id, true);
      }
      await wait(1400);
      if (!isCurrent()) return;
      updateCursor("gamma", { reading: false });

      setScene("cursor-lingers");
      const threadRow = transitions[1]?.id ?? "florist";
      setCursorTarget("beta", threadRow, true);
      await wait(1100);
      if (!isCurrent()) return;

      setScene("comment-thread");
      setThread(threadRow, 0);
      await wait(800);
      if (!isCurrent()) return;

      setScene("thread-typing");
      await typeReply();
      if (!isCurrent()) return;
      await wait(1200);

      setScene("thread-close");
      setThread(null);
      updateCursor("beta", { reading: false });
      await wait(600);
      if (!isCurrent()) return;

      setScene("view-morph-timeline");
      setView("timeline");
      updateCursor("alpha", { visible: false });
      updateCursor("beta", { visible: false });
      updateCursor("gamma", { visible: false });
      await wait(2200);
      if (!isCurrent()) return;

      setScene("rss-arrival");
      setToast("subscribed");
      tickFollowers(1);
      await wait(1600);
      if (!isCurrent()) return;
      setToast(null);
      await wait(400);

      setScene("timeline-hold");
      await wait(1400);
      if (!isCurrent()) return;

      setScene("view-morph-list");
      setView("list");
      await wait(800);
      if (!isCurrent()) return;
      updateCursor("alpha", { visible: true });
      updateCursor("beta", { visible: true });
      updateCursor("gamma", { visible: true });
      setCursorTarget("alpha", transitions[0]?.id ?? null, false);
      setCursorTarget("beta", "venue", false);
      setCursorTarget("gamma", transitions[2]?.id ?? null, false);
      await wait(1400);
      if (!isCurrent()) return;

      setScene("cursors-leave");
      updateCursor("alpha", { visible: false });
      updateCursor("beta", { visible: false });
      updateCursor("gamma", { visible: false });
      await wait(900);
      if (!isCurrent()) return;

      setScene("reset");
      await wait(700);
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
    updateCursor,
    setCursorTarget,
    setCursorToShareButton,
    tickViewers,
    tickFollowers,
    setThread,
    setToast,
  ]);

  const highlights = useMemo(() => {
    const set = new Set<string>();
    for (const c of state.cursors) {
      if (c.reading && c.targetRowId) set.add(c.targetRowId);
    }
    return set;
  }, [state.cursors]);

  const threadComments = useMemo(() => {
    if (!state.threadRowId) return undefined;
    const base = [...THREAD_COMMENTS_INITIAL];
    if (state.threadTypingReveal > 0 || state.scene === "thread-typing") {
      base.push({
        id: "comment-reply",
        author: "You",
        authorColor: "#4f46e5",
        body: THREAD_REPLY,
        typing: true,
        reveal: state.threadTypingReveal,
      } as never);
    }
    return base;
  }, [state.threadRowId, state.threadTypingReveal, state.scene]);

  return (
    <div
      ref={surfaceRef}
      className="relative w-full overflow-hidden"
      style={{
        borderRadius: "var(--r-4)",
        border: "1px solid var(--border)",
        background: "var(--bg-elev)",
        boxShadow: "var(--shadow-2)",
      }}
    >
      <UrlBar
        ref={shareButtonRef}
        url={pack.workspaceUrl}
        viewCount={state.viewCount}
        sharePressed={sharePressed}
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
            <FollowersPill count={followers} />
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
          onRegister={onRegisterRow}
          highlights={highlights}
          threadRowId={state.threadRowId}
          threadComments={threadComments as never}
        />

        {state.view === "list" ? (
          <div className="pointer-events-none absolute inset-0">
            {state.cursors.map((c) => (
              <CursorView
                key={c.id}
                x={c.x}
                y={c.y}
                visible={c.visible}
                color={c.color}
                label={c.label}
                reading={c.reading}
              />
            ))}
          </div>
        ) : null}

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
