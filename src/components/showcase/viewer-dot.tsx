"use client";

import { motion } from "motion/react";

type Props = {
  visible: boolean;
  /** Vertical offset in pixels from the top of the surface */
  top: number;
  /** Horizontal offset from the right edge of the surface */
  right?: number;
  /** Stagger delay for entrance, in seconds */
  delay?: number;
};

/**
 * Indigo dot in the right margin signaling a public viewer is reading.
 * The protagonist of the Roadmap demo — its presence drives the
 * creator-side status changes that follow.
 */
export function ViewerDot({ visible, top, right = 12, delay = 0 }: Props) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.4, x: 6 }}
      animate={
        visible
          ? { opacity: 1, scale: 1, x: 0 }
          : { opacity: 0, scale: 0.4, x: 6 }
      }
      transition={{
        duration: 0.42,
        ease: [0.16, 1, 0.3, 1],
        delay: visible ? delay : 0,
      }}
      style={{
        position: "absolute",
        top,
        right,
        width: 10,
        height: 10,
        zIndex: 5,
      }}
    >
      <motion.span
        animate={
          visible
            ? { scale: [1, 1.25, 1], opacity: [0.95, 1, 0.95] }
            : { scale: 1, opacity: 0 }
        }
        transition={{
          duration: 2.6,
          ease: [0.16, 1, 0.3, 1],
          repeat: Infinity,
          delay,
        }}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: "var(--brand)",
          boxShadow:
            "0 0 0 3px color-mix(in srgb, var(--brand) 14%, transparent)",
        }}
      />
    </motion.div>
  );
}
