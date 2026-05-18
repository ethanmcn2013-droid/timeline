import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Signal Roadmap wordmark: "roadmap" + indigo period.
 *
 * Same typographic family across the suite — lowercase word +
 * indigo dot. Each product carries a distinct gesture inside
 * one shared mark grammar (gesture-vocab ratified 2026-05-16):
 *
 *   Roadmap   → sweep    (ambient, in suite nav)
 *   Tasks     → pulse    2.6s  spring-glide
 *   Analytics → tick     (ambient)
 *   Notes     → caret    (ambient)
 *   Studio    → broadcast (ambient)
 *
 * RW-5 (2026-05-18): the `.roadmap-dot` class and `roadmap-dot-sweep`
 * keyframes have been removed. The sweep was a loading-state visual;
 * with the Layer-0 pre-paint primitive in place it is not needed.
 * The period is now a static indigo mark. The `.brand-mark .md` selector
 * used by `dot-land` in globals.css targets it on cross-product arrival.
 * See ARCH_SPEC §3 + CREATIVE_SPEC §3 for rationale.
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
      aria-label="Signal Roadmap"
      className={cn(
        "brand-mark relative inline-flex select-none items-baseline font-semibold",
        sizeClass,
        className,
      )}
      style={{ letterSpacing: "-0.05em", textDecoration: "none" }}
    >
      <span style={{ fontWeight: 600, color: "var(--ink)" }}>roadmap</span>
      {/* The `.md` class is targeted by the `dot-land` keyframe in globals.css
          when data-dot-landing="1" is set on <html> by the inline head script.
          No animation at rest — dot-land fires only on cross-product arrival. */}
      <span
        className="md"
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
