"use client";

import { AnimatePresence, motion } from "motion/react";

type CommentEntry = {
  id: string;
  author: string;
  /** Hex color for the author chip. */
  authorColor: string;
  body: string;
  /** When true, body types out character-by-character. */
  typing?: boolean;
  /** Current revealed character count, used for the type-on animation. */
  reveal?: number;
};

type Props = {
  visible: boolean;
  comments: CommentEntry[];
};

/**
 * Inline comment thread that appears beneath a row when a cursor lingers.
 * Existing comments fade in; the owner reply types out character-by-character.
 *
 * Lives as a sibling beneath the row so layout shifts feel grounded rather
 * than floating-overlay. Auto-collapses when `visible` flips off.
 */
export function CommentThread({ visible, comments }: Props) {
  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          key="thread"
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 4 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{
            opacity: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
            height: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
            marginTop: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
          }}
          style={{ overflow: "hidden" }}
        >
          <div
            style={{
              borderRadius: "var(--r-2)",
              border: "1px solid var(--border-soft)",
              background: "var(--bg-deep)",
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {comments.map((c, i) => {
              const text =
                c.typing && typeof c.reveal === "number"
                  ? c.body.slice(0, c.reveal)
                  : c.body;
              return (
                <motion.div
                  key={c.id}
                  initial={i === 0 ? false : { opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                    delay: i === 0 ? 0 : 0.1,
                  }}
                  className="flex items-start gap-2"
                >
                  <span
                    aria-hidden
                    style={{
                      flexShrink: 0,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: c.authorColor,
                      color: "white",
                      fontSize: 8.5,
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    {c.author.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div
                      className="flex items-baseline gap-2"
                      style={{ marginBottom: 1 }}
                    >
                      <span
                        className="font-mono"
                        style={{
                          fontSize: 10.5,
                          color: "var(--ink-soft)",
                          fontWeight: 600,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {c.author}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 12.5,
                        color: "var(--ink)",
                        lineHeight: 1.45,
                        margin: 0,
                      }}
                    >
                      {text}
                      {c.typing && typeof c.reveal === "number" && c.reveal < c.body.length ? (
                        <motion.span
                          aria-hidden
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          style={{
                            display: "inline-block",
                            width: 1.5,
                            height: 11,
                            background: "var(--brand)",
                            verticalAlign: "text-bottom",
                            marginLeft: 1,
                            transform: "translateY(1px)",
                          }}
                        />
                      ) : null}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
