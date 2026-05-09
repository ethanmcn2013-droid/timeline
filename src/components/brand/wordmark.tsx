import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Signal Roadmap wordmark: "roadmap" + slide-in dot.
 *
 * Same typographic family as Tasks (`tasks•`) and Analytics
 * (`analytics•`) — lowercase word + indigo dot. The dot's
 * single slide-on-mount is Roadmap's distinct gesture: it
 * moves toward a destination, then settles. Tasks pulses
 * (live), Analytics is static (ambient), Studio fades a
 * period (settling). Each product carries its own motion
 * energy inside one shared mark grammar.
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
