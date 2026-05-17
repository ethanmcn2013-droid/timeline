"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Root error boundary. Catches uncaught errors in any route that lacks
 * a closer boundary — including the public `[workspaceSlug]` viewer,
 * which does live DB work on every request. Without this, a Turso blip
 * renders an unstyled white-screen crash on a shared, forwardable link.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("roadmap: uncaught error", error);
  }, [error]);

  return (
    <div
      className="flex min-h-[70vh] items-center justify-center px-6"
      style={{ background: "var(--bg-deep)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-7 text-center"
        style={{
          background: "var(--bg-elev)",
          borderColor: "var(--border)",
        }}
      >
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--brand)", letterSpacing: "0.12em" }}
        >
          Something went wrong
        </p>
        <h1
          className="mb-2 text-xl font-semibold"
          style={{ letterSpacing: "-0.02em", color: "var(--ink)" }}
        >
          This page didn&apos;t load.
        </h1>
        <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          The plan is safe — this was a loading hiccup, not lost work. Try
          again in a moment.
        </p>
        {error.digest ? (
          <p
            className="mb-4 font-mono text-[11px] tabular-nums"
            style={{ color: "var(--ink-quiet)" }}
          >
            ref · {error.digest}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all"
            style={{ background: "var(--brand)" }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--ink-soft)" }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
