"use client";

import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Anatomy of a timeline item, narrative one-shot.
 *
 * Unlike Tasks (continuous loop, live presence), Notes (~11s loop with
 * settle), and Signal (~11s tour loop), Timeline's anatomy is a
 * fundamentally forward-moving sequence, a timeline item moves through
 * states, gathers detail, and culminates in a published link. It does
 * not loop back to blank. The choreography plays once when the section
 * enters view, then holds permanently. `useInView` with `once: true`
 * means no replay on re-entry, if interrupted mid-sequence, the card
 * holds the last visible state until the page reloads.
 *
 * Five honest slots, status, decision, reason, refusal, public link.
 * Status begins as "Drafting" and drifts to "Doing" mid-sequence, the
 * lesson is that planning happens IN PUBLIC, the state is part of the
 * story. The public-link affordance rises last because that is the
 * culminating moment Timeline's product promise is built on.
 *
 * SSR fallback / reduced-motion: every element renders at its final
 * state from the start (Doing pill, full content, refusal visible,
 * public link visible). The choreography is progressive enhancement.
 */

type Slot = "status" | "decision" | "reason" | "refusal" | "link";

const ANN: { slot: Slot; label: string; note: string }[] = [
  {
    slot: "status",
    label: "Status",
    note: "Plain state, named in public. Drafting → Doing → Done, the state is part of the story.",
  },
  {
    slot: "decision",
    label: "Decision",
    note: "Named as an outcome, not as a ticket. The work is the thing, not the tracking code for the thing.",
  },
  {
    slot: "reason",
    label: "Reason",
    note: "Why this item matters, in language the client can read, not the language of whoever built it.",
  },
  {
    slot: "refusal",
    label: "Refusal",
    note: "What you decided not to do. Stays visible so the next reader doesn't ask.",
  },
  {
    slot: "link",
    label: "Public link",
    note: "One URL the client can read without an account. Direction clarity is something you can share.",
  },
];

const EASE = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  glide: [0.32, 0.72, 0, 1] as const,
};
const SPRING_SNAP = { type: "spring" as const, stiffness: 340, damping: 28 };

type Phase =
  | "init"        // SSR / pre-intersection: card at final state visually
  | "drafting"    // Choreography start: Drafting pill, title fading in
  | "decision"    // Title fully in, status still Drafting
  | "doing"       // Status drifts to Doing
  | "reason"      // Reason body fades in
  | "underline"   // Indigo underline draws under decision
  | "refusal"     // Refusal block appears, strike-through plays
  | "link"        // Public-link element rises
  | "settled";    // Final, hold forever

function useNarrative(active: boolean, reduced: boolean) {
  // Phase drives both visibility and styling. `init` is the SSR/no-JS
  // baseline, all content visible. The choreography progresses
  // through phases and lands on `settled`.
  const [phase, setPhase] = useState<Phase>("init");

  useEffect(() => {
    if (reduced) {
      let cancelled = false;
      queueMicrotask(() => {
        if (!cancelled) setPhase("settled");
      });
      return () => {
        cancelled = true;
      };
    }
    if (!active) return;
    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((r) => setTimeout(r, ms));

    const play = async () => {
      // Snap back to drafting state to begin the journey
      setPhase("drafting");
      await wait(450);
      if (cancelled) return;
      setPhase("decision");
      await wait(650);
      if (cancelled) return;
      setPhase("doing");
      await wait(550);
      if (cancelled) return;
      setPhase("reason");
      await wait(650);
      if (cancelled) return;
      setPhase("underline");
      await wait(900);
      if (cancelled) return;
      setPhase("refusal");
      await wait(950);
      if (cancelled) return;
      setPhase("link");
      await wait(700);
      if (cancelled) return;
      setPhase("settled");
      // Hold settled forever. No reset.
    };

    play();
    return () => {
      cancelled = true;
    };
  }, [active, reduced]);

  return phase;
}

// Visibility per slot given the current phase. Each slot becomes
// visible at or after a particular phase and stays visible thereafter.
function isShown(slot: Slot, phase: Phase): boolean {
  if (phase === "init" || phase === "settled") return true;
  switch (slot) {
    case "status":
      return true; // Status pill always shows (transitions in-place)
    case "decision":
      return [
        "decision",
        "doing",
        "reason",
        "underline",
        "refusal",
        "link",
      ].includes(phase);
    case "reason":
      return ["reason", "underline", "refusal", "link"].includes(phase);
    case "refusal":
      return ["refusal", "link"].includes(phase);
    case "link":
      // NOTE: phase === "settled" is already handled by the short-circuit
      // at the top of this function. Don't remove that guard without
      // also adding "settled" here, otherwise the link silently
      // disappears once the narrative lands.
      return phase === "link";
  }
}

function spotlightAnim(slot: Slot, active: Slot | null) {
  const on = active === slot;
  const off = !!active && active !== slot;
  return {
    boxShadow: on
      ? "0 0 0 2px rgba(79,70,229,0.18), 0 6px 14px -6px rgba(79,70,229,0.30)"
      : "0 0 0 0px rgba(79,70,229,0), 0 0px 0px 0px rgba(79,70,229,0)",
    opacity: off ? 0.5 : 1,
    y: on ? -0.5 : 0,
  };
}

export function ItemAnatomy() {
  const [active, setActive] = useState<Slot | null>(null);

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="anatomy"
        className="scroll-mt-24 px-6 py-20"
        aria-label="Anatomy of a timeline item"
      >
        <div className="mx-auto w-full max-w-[1240px]">
          <p
            className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--ink-quiet)" }}
          >
            Anatomy of a timeline item
          </p>
          <h2
            className="mb-4 max-w-xl text-[clamp(1.5rem,1.2rem+1.5vw,2.25rem)] font-semibold leading-[1.1]"
            style={{ letterSpacing: "-0.03em", color: "var(--ink)" }}
          >
            A timeline item should explain itself.
          </h2>
          <p
            className="mb-10 max-w-[58ch] text-[13.5px] leading-[1.55]"
            style={{ color: "var(--ink-soft)" }}
          >
            Watch a single item come together, state, decision, reason,
            refusal, public link. Or pick a number to see them up close.
          </p>

          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-start lg:gap-16">
            <DemoItem active={active} setActive={setActive} />
            <Annotations active={active} setActive={setActive} />
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

function DemoItem({
  active,
  setActive,
}: {
  active: Slot | null;
  setActive: (s: Slot | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // once: true, the narrative plays the first time the section enters
  // view and never replays. If the visitor scrolls past, they see the
  // final settled state. No reset to empty.
  const inView = useInView(wrapRef, { amount: 0.4, once: true });
  const reduced = useReducedMotion() ?? false;
  const phase = useNarrative(inView, reduced);

  const hoverProps = (s: Slot) => ({
    onMouseEnter: () => setActive(s),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(s),
    onBlur: () => setActive(null),
    tabIndex: 0,
    role: "group" as const,
    "aria-label": `Highlight ${s}`,
  });

  const showDecision = isShown("decision", phase);
  const showReason = isShown("reason", phase);
  const showRefusal = isShown("refusal", phase);
  const showLink = isShown("link", phase);
  const showUnderline =
    phase === "underline" ||
    phase === "refusal" ||
    phase === "link" ||
    phase === "settled" ||
    phase === "init";
  const isDoing =
    phase === "doing" ||
    phase === "reason" ||
    phase === "underline" ||
    phase === "refusal" ||
    phase === "link" ||
    phase === "settled" ||
    phase === "init";

  return (
    <div
      ref={wrapRef}
      className="p-5"
      style={{
        borderRadius: "var(--r-2)",
        border: "1px solid var(--border)",
        background: "var(--bg-elev)",
        boxShadow: "var(--shadow-1)",
      }}
      onMouseLeave={() => setActive(null)}
    >
      {/* Slot 1, Status pill (Drafting → Doing) */}
      <motion.div
        {...hoverProps("status")}
        animate={spotlightAnim("status", active)}
        transition={SPRING_SNAP}
        className="mb-4 inline-flex items-center gap-2 rounded-md"
        style={{ padding: "2px 6px", margin: "-2px -6px 14px" }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background: isDoing
              ? "var(--status-flight)"
              : "var(--ink-faint, #838b7b)",
            // 180ms delay on the dot shift so the text swap reads
            // first, then the dot follows, three-beat transition,
            // not a simultaneous flicker.
            transition: "background 320ms 180ms ease",
          }}
          aria-hidden
        />
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "var(--ink-quiet)", position: "relative" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDoing ? "doing" : "drafting"}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.28, ease: EASE.glide }}
              style={{ display: "inline-block" }}
            >
              {isDoing ? "Doing" : "Drafting"}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.div>

      {/* Slot 2, Decision (title) with optional underline draw */}
      <motion.div
        {...hoverProps("decision")}
        animate={spotlightAnim("decision", active)}
        transition={SPRING_SNAP}
        className="rounded-md"
        style={{ padding: "2px 6px", margin: "-2px -6px 14px" }}
      >
        <motion.h3
          initial={false}
          animate={{ opacity: showDecision ? 1 : 0, y: showDecision ? 0 : 4 }}
          transition={{ duration: 0.45, ease: EASE.glide }}
          className="relative inline-block text-[22px] font-semibold tracking-[-0.03em] text-ink"
        >
          Publish the May client plan
          {/* Underline draws when phase reaches `underline` and persists */}
          <motion.span
            aria-hidden
            initial={false}
            animate={{
              scaleX: showUnderline ? 1 : 0,
              opacity: showUnderline ? 1 : 0,
            }}
            transition={{
              scaleX: { duration: 0.85, ease: EASE.outExpo },
              opacity: { duration: 0.4, ease: EASE.inOut },
            }}
            style={{
              display: "block",
              height: 2,
              borderRadius: 1,
              background: "var(--brand, #4f46e5)",
              transformOrigin: "left center",
              marginTop: 4,
            }}
          />
        </motion.h3>
      </motion.div>

      {/* Slot 3, Reason */}
      <motion.div
        {...hoverProps("reason")}
        animate={spotlightAnim("reason", active)}
        transition={SPRING_SNAP}
        className="rounded-md"
        style={{ padding: "2px 6px", margin: "-2px -6px" }}
      >
        <motion.p
          initial={false}
          animate={{
            opacity: showReason ? 1 : 0,
            y: showReason ? 0 : 4,
          }}
          transition={{ duration: 0.45, ease: EASE.glide }}
          className="max-w-[58ch] text-[14px] leading-[1.6] text-ink-soft"
        >
          The plan needs one public place before the next client review.
          This update explains what changed, what is waiting, and what
          will not be picked up this cycle.
        </motion.p>
      </motion.div>

      {/* Slot 4, Refusal (with strike-through animation on a held promise) */}
      <motion.div
        initial={false}
        animate={{
          opacity: showRefusal ? 1 : 0,
          y: showRefusal ? 0 : 6,
        }}
        transition={{
          duration: 0.45,
          ease: EASE.glide,
          delay: showRefusal && phase === "refusal" ? 0.1 : 0,
        }}
        className="mt-5 pt-4"
        style={{ borderTop: "1px solid var(--border-soft)" }}
      >
        <motion.div
          {...hoverProps("refusal")}
          animate={spotlightAnim("refusal", active)}
          transition={SPRING_SNAP}
          className="rounded-md"
          style={{ padding: "2px 6px", margin: "-2px -6px" }}
        >
          <p
            className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: "var(--ink-quiet)" }}
          >
            Refusal
          </p>
          <RefusalText showStrike={showRefusal}>
            No private version for this cycle.
          </RefusalText>
          <p
            className="mt-1 text-[13px] leading-[1.55]"
            style={{ color: "var(--ink-soft)" }}
          >
            The plan has to be readable by anyone with the link.
          </p>
        </motion.div>
      </motion.div>

      {/* Slot 5, Public link (rises last, culmination) */}
      <motion.div
        initial={false}
        animate={{
          opacity: showLink ? 1 : 0,
          y: showLink ? 0 : 8,
        }}
        transition={{ duration: 0.55, ease: EASE.glide }}
        className="mt-4"
      >
        <motion.div
          {...hoverProps("link")}
          animate={spotlightAnim("link", active)}
          transition={SPRING_SNAP}
          className="inline-flex items-center gap-2 rounded-md"
          style={{
            padding: "10px 14px",
            margin: "-10px -14px",
            border: "1px solid var(--border-soft)",
            background: "var(--bg-deep, #fafaf9)",
          }}
        >
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "var(--brand, #4f46e5)",
            }}
          />
          <span
            className="font-mono text-[12px]"
            style={{
              color: "var(--ink-soft)",
              letterSpacing: "-0.005em",
            }}
          >
            timeline.signalstudio.ie/<span style={{ color: "var(--brand, #4f46e5)", fontWeight: 600 }}>may-client-plan</span>
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

function RefusalText({
  children,
  showStrike,
}: {
  children: React.ReactNode;
  showStrike: boolean;
}) {
  return (
    <span
      className="relative inline-block text-[13px] font-medium leading-[1.55]"
      style={{ color: "var(--ink-soft)" }}
    >
      {children}
      {/* Animated strike-through line */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ scaleX: showStrike ? 1 : 0 }}
        transition={{
          duration: 0.5,
          ease: EASE.outExpo,
          delay: showStrike ? 0.45 : 0,
        }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "55%",
          height: 1.5,
          background: "var(--ink-faint, #838b7b)",
          transformOrigin: "left center",
          borderRadius: 1,
        }}
      />
    </span>
  );
}

function Annotations({
  active,
  setActive,
}: {
  active: Slot | null;
  setActive: (s: Slot | null) => void;
}) {
  // The numerals set in one by one on first scroll-in (same grammar as
  // the Tasks anatomy), then the list is still.
  const listRef = useRef<HTMLOListElement>(null);
  const listInView = useInView(listRef, { amount: 0.3, once: true });
  return (
    <ol ref={listRef} className="space-y-1">
      {ANN.map((a, i) => {
        const isOn = active === a.slot;
        const isOff = !!active && active !== a.slot;
        return (
          <motion.li
            key={a.slot}
            initial={{ opacity: 0, y: 6 }}
            animate={listInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.32, delay: i * 0.06, ease: EASE.inOut }}
          >
            <motion.button
              type="button"
              onMouseEnter={() => setActive(a.slot)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(a.slot)}
              onBlur={() => setActive(null)}
              animate={{
                background: isOn
                  ? "rgba(79,70,229,0.05)"
                  : "rgba(79,70,229,0)",
                opacity: isOff ? 0.55 : 1,
              }}
              transition={{ duration: 0.22, ease: EASE.inOut }}
              className="group grid w-full grid-cols-[auto_1fr] items-start gap-3 rounded-lg px-3 py-2.5 text-left outline-none"
              style={{ cursor: "default" }}
            >
              <motion.span
                className="mt-0.5 inline-flex h-[20px] w-[20px] items-center justify-center rounded-full border font-mono text-[9.5px] font-semibold tabular-nums"
                animate={{
                  color: isOn ? "var(--brand, #4f46e5)" : "var(--ink-quiet)",
                  borderColor: isOn
                    ? "var(--brand, #4f46e5)"
                    : "var(--line, rgba(17,17,17,0.1))",
                  scale: isOn ? 1.06 : 1,
                }}
                transition={SPRING_SNAP}
              >
                {String(i + 1).padStart(2, "0")}
              </motion.span>
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {a.label}
                </p>
                <p
                  className="mt-1 text-[13px] leading-[1.55]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {a.note}
                </p>
              </div>
            </motion.button>
          </motion.li>
        );
      })}
    </ol>
  );
}
