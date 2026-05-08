"use client";

import Link from "next/link";
import { motion, useAnimation } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Size config: [lineWidth, dotRadius, fontSize, gap]
const SIZES = {
  sm: { lineW: 22, dotR: 2,   font: "0.875rem" },
  md: { lineW: 28, dotR: 2.5, font: "1.0625rem" },
  lg: { lineW: 34, dotR: 3,   font: "1.25rem"  },
  xl: { lineW: 42, dotR: 3.5, font: "1.5rem"   },
} as const;

// Default resting position of the dot along the hairline (70%).
const RESTING = 0.7;

interface WordmarkProps {
  className?: string;
  size?: keyof typeof SIZES;
  href?: string;
  withMark?: boolean;
  /** Disables animation — use in OG cards, SSR-only contexts. */
  static?: boolean;
}

export function Wordmark({
  className,
  size = "md",
  href = "/",
  withMark = true,
  static: isStatic = false,
}: WordmarkProps) {
  const dims = SIZES[size];
  const controls = useAnimation();
  const [reducedMotion, setReducedMotion] = useState(false);
  const hasAnimated = useRef(false);

  // Detect prefers-reduced-motion on mount
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Animate on mount (once)
  useEffect(() => {
    if (isStatic || reducedMotion || hasAnimated.current) return;
    hasAnimated.current = true;
    controls.start({
      cx: [0, dims.lineW, dims.lineW * RESTING],
      transition: { duration: 1.4, ease: "easeOut" },
    });
  }, [controls, dims.lineW, isStatic, reducedMotion]);

  const handleHover = () => {
    if (isStatic || reducedMotion) return;
    controls.start({
      cx: [dims.lineW * RESTING, 0, dims.lineW, dims.lineW * RESTING],
      transition: { duration: 1.4, ease: "easeOut" },
    });
  };

  // SVG bounding box: line runs from dotR to (lineW + dotR) so dot never clips
  const svgW = dims.lineW + dims.dotR * 2;
  const svgH = dims.dotR * 2 + 2; // +2px breathing room
  const midY = svgH / 2;

  return (
    <Link
      href={href}
      aria-label="Roadmap"
      onMouseEnter={handleHover}
      className={cn(
        "inline-flex select-none items-baseline gap-[0.45em] font-semibold",
        className,
      )}
      style={{ textDecoration: "none" }}
    >
      {withMark && (
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          aria-hidden
          // Shift down slightly so it visually sits on the text baseline
          style={{ display: "inline-block", verticalAlign: "middle", transform: "translateY(-1px)" }}
        >
          {/* Hairline — recessive track */}
          <line
            x1={dims.dotR}
            x2={dims.lineW + dims.dotR}
            y1={midY}
            y2={midY}
            stroke="var(--ink-quiet)"
            strokeWidth={1}
            strokeLinecap="round"
          />
          {/* Dot — brand accent, the live element */}
          <motion.circle
            cy={midY}
            r={dims.dotR}
            fill="var(--brand)"
            initial={{ cx: dims.dotR + dims.lineW * RESTING }}
            animate={controls}
          />
        </svg>
      )}
      <span
        style={{
          fontSize: dims.font,
          letterSpacing: "-0.01em",
          fontWeight: 600,
          color: "var(--ink)",
        }}
      >
        Roadmap
      </span>
    </Link>
  );
}
