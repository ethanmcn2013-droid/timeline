"use client";

import { useState } from "react";

/**
 * Public-by-default proof. A single chip rendered like a real browser
 * address bar at the top of the page, copy icon included. The point is
 * not navigation; the point is that the URL is the product.
 *
 * Walkover row 2 (Dalí, 2026-06-07): "timeline.signalstudio.ie/your-plan
 *, no login" must be the first thing readable on the homepage above the
 * headline, before any marketing copy explains it.
 */
export function AddressBarChip() {
  const [copied, setCopied] = useState(false);

  const url = "timeline.signalstudio.ie/your-plan";

  function onCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(`https://${url}`).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => {
        /* clipboard refused, silent; the chip is proof, not a tool */
      }
    );
  }

  return (
    <div
      className="rise inline-flex max-w-full items-center gap-2 rounded-full px-2.5 py-1.5"
      style={{
        animationDelay: "0ms",
        border: "1px solid var(--border-soft)",
        background: "var(--bg-deep)",
      }}
      role="group"
      aria-label="Public timeline URL, no login required"
    >
      {/* Lock, the calm signal that this is a normal public URL */}
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        style={{ color: "var(--ink-quiet)", flexShrink: 0 }}
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>

      <span
        className="truncate font-mono text-[12px]"
        style={{
          color: "var(--ink-soft)",
          letterSpacing: "0.01em",
        }}
      >
        {url}
      </span>

      <span
        aria-hidden
        className="hidden text-[11px] sm:inline"
        style={{ color: "var(--ink-faint)" }}
      >
&middot; no login
      </span>

      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Copied" : "Copy URL"}
        className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors"
        style={{
          color: copied ? "var(--brand)" : "var(--ink-quiet)",
          background: "transparent",
        }}
      >
        {copied ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        ) : (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="9" y="9" width="12" height="12" rx="2" ry="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
        )}
      </button>
    </div>
  );
}
