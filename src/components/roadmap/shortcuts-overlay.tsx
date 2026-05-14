"use client";

import { useEffect, useState } from "react";

type Shortcut = { keys: string[]; label: string };

const SHORTCUTS: { group: string; items: Shortcut[] }[] = [
  {
    group: "Navigate",
    items: [
      { keys: ["?"], label: "Show keyboard shortcuts" },
      { keys: ["Esc"], label: "Close any overlay" },
    ],
  },
];

/**
 * Press `?` to open, Escape to close. Brand-distinctive affordance.
 */
export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName.toLowerCase();
      const inField =
        tag === "input" || tag === "textarea" || t?.isContentEditable;
      if (e.key === "?" && !inField) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/30 px-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-line-soft bg-bg-elevated p-6 shadow-[0_30px_80px_-30px_rgba(20,21,26,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[11px] tabular-nums text-ink-quiet transition-colors hover:text-ink"
          >
            Esc
          </button>
        </div>
        <div className="space-y-5">
          {SHORTCUTS.map((g) => (
            <section key={g.group}>
              <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
                {g.group}
              </div>
              <ul className="space-y-1.5">
                {g.items.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 text-[12.5px]"
                  >
                    <span className="text-ink-soft">{s.label}</span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k, j) => (
                        <kbd
                          key={j}
                          className="inline-flex min-w-[22px] justify-center rounded border border-line bg-bg-sunken px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-ink-soft"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-6 border-t border-line-soft pt-4 text-[11px] leading-[1.5] text-ink-quiet">
          Press ? anytime to see this list.
        </p>
      </div>
    </div>
  );
}
