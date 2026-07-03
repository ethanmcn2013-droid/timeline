import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Signal Timeline wordmark: "roadmap" + indigo period.
 *
 * Same typographic family across the suite, lowercase word +
 * indigo dot. Each product carries a distinct gesture inside
 * one shared mark grammar (gesture-vocab ratified 2026-05-16):
 *
 *   Roadmap   → sweep    (ambient, in suite nav)
 *   Tasks     → pulse    2.6s  spring-glide
 *   Analytics → tick     (ambient)
 *   Notes     → caret    (ambient)
 *   Studio    → broadcast (ambient)
 *
 * RW-5 (2026-05-18): the loading-state sweep was removed; with Layer-0
 * pre-paint in place a loading sweep on the dot is not needed.
 *
 * Walkover row 5 (2026-06-07): the sweep returns, but as the brand
 * gesture, not a loader. A faint highlight glances left-to-right
 * across the word every ~7s (`.timeline-wordmark-text`, scoped CSS,
 * reduced-motion-safe). Semantically: publish-and-pass, a glance
 * moving across the work. The dot's ambient opacity pulse continues.
 * See globals.css for the keyframe + reduced-motion guard.
 */
export function Wordmark({
  className,
  size = "md",
  href = "/",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
}) {
  const sizeClass =
    size === "xl"
      ? "text-2xl"
      : size === "lg"
        ? "text-xl"
        : size === "sm"
          ? "text-base"
          : "text-lg";
  return (
    <Link
      href={href}
      aria-label="Signal Timeline"
      className={cn(
        "brand-mark relative inline-flex select-none items-baseline font-semibold",
        sizeClass,
        className,
      )}
      style={{ letterSpacing: "-0.05em", textDecoration: "none" }}
    >
      <span
        className="timeline-wordmark-text"
        style={{ fontWeight: 600, color: "var(--ink)" }}
      >
        timeline
      </span>
      {/* `.md` is targeted by `dot-land` in globals.css on cross-product arrival.
          `.timeline-dot` adds M5 ambient opacity pulse (0.85→1.0, 3s alternate)
          guarded by prefers-reduced-motion in globals.css. Does not conflict with
          SuiteLoader (.signal-loading-dot) or skeleton (.skeleton-shimmer). */}
      <span
        className="md timeline-dot"
        aria-hidden
        style={{
          display: "inline-block",
          width: "0.30em",
          height: "0.30em",
          maxWidth: "8px",
          maxHeight: "8px",
          background: "var(--accent, #4f46e5)",
          borderRadius: "50%",
          marginLeft: "0.14em",
          transform: "translateY(-0.36em)",
          flexShrink: 0,
        }}
      />
    </Link>
  );
}
