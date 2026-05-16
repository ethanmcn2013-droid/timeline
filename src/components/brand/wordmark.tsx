import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Signal Roadmap wordmark: "roadmap" + animated dot.
 *
 * Same typographic family across the suite — lowercase word +
 * indigo dot. Each product carries a distinct gesture inside
 * one shared mark grammar:
 *
 *   Roadmap  → sweep    5.4s  cubic-bezier(.22,.7,.2,1)
 *              dot tracks left→right along a timeline, loops
 *   Tasks    → pulse    2.6s  spring-glide
 *   Analytics → tick    (ambient)
 *   Notes    → caret    (ambient)
 *   Studio   → broadcast (ambient)
 *
 * Class: `.roadmap-dot`  Keyframes: `roadmap-dot-sweep`
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
        "relative inline-flex select-none items-baseline font-semibold",
        sizeClass,
        className,
      )}
      style={{ letterSpacing: "-0.05em", textDecoration: "none" }}
    >
      <span style={{ fontWeight: 600, color: "var(--ink)" }}>roadmap</span>
      <span className="roadmap-dot" aria-hidden />
    </Link>
  );
}
