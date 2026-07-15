"use client";

import { useEffect, useId, useRef, useState } from "react";

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

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.getAttribute("aria-hidden") !== "true",
  );
}

/**
 * Press `?` to open, Escape to close. Brand-distinctive affordance.
 */
export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

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
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });

    const onDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = focusableElements(dialog);
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", onDialogKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onDialogKeyDown);
      document.body.style.overflow = previousOverflow;
      const returnTarget = returnFocusRef.current;
      returnFocusRef.current = null;
      if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/30 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          event.preventDefault();
          setOpen(false);
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-line-soft bg-bg-elevated p-6 shadow-[0_30px_80px_-30px_rgba(20,21,26,0.35)]"
      >
        <div className="mb-5 flex items-baseline justify-between">
          <h2
            id={titleId}
            className="text-[15px] font-semibold tracking-[-0.01em] text-ink"
          >
            Keyboard shortcuts
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close keyboard shortcuts"
            className="rounded text-[11px] tabular-nums text-ink-quiet transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
                {g.items.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-center justify-between gap-3 text-[12.5px]"
                  >
                    <span className="text-ink-soft">{s.label}</span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k) => (
                        <kbd
                          key={k}
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
        <p
          id={descriptionId}
          className="mt-6 border-t border-line-soft pt-4 text-[11px] leading-[1.5] text-ink-quiet"
        >
          Press ? anytime to see this list.
        </p>
      </div>
    </div>
  );
}
