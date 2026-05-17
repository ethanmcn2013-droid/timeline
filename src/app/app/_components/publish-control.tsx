"use client";

/**
 * Publish / Unpublish control (Layer 1 — seamless-ecosystem-2026-05-18).
 *
 * Shows the workspace publish state and lets the owner toggle it.
 * Copy follows signal-brand-voice: plain English, no PM jargon,
 * no "deploy" or "visibility" framing. The product says "publish."
 *
 * Published → the public URL is live and no-auth forwardable.
 * Draft     → only the owner sees the roadmap; visitors get "Not published yet."
 */

import { useState, useTransition } from "react";
import { publishWorkspaceAction, unpublishWorkspaceAction } from "@/server/actions/workspaces";

export function PublishControl({
  workspaceSlug,
  initialPublished,
}: {
  workspaceSlug: string;
  initialPublished: boolean;
}) {
  const [published, setPublished] = useState(initialPublished);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    startTransition(async () => {
      const action = published ? unpublishWorkspaceAction : publishWorkspaceAction;
      const result = await action(workspaceSlug);
      if ("error" in result) {
        setError(result.error);
      } else {
        setPublished((prev) => !prev);
      }
    });
  }

  return (
    <div
      className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3"
      style={{
        background: published ? "color-mix(in srgb, var(--status-done) 6%, var(--bg))" : "var(--bg-deep)",
        borderColor: published ? "color-mix(in srgb, var(--status-done) 25%, var(--border))" : "var(--border)",
      }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
            style={{
              background: published ? "var(--status-done)" : "var(--ink-faint)",
            }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: "var(--ink)" }}
          >
            {published ? "Published" : "Draft"}
          </p>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "var(--ink-quiet)" }}>
          {published
            ? "Your roadmap is live. Anyone with the link can read it — no account needed."
            : "Your roadmap is private. Publish it to share the link with anyone."}
        </p>
        {error ? (
          <p className="mt-1 text-xs" style={{ color: "var(--status-blocked)" }}>
            {error}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
        style={{
          background: published ? "var(--bg-elev)" : "var(--ink)",
          color: published ? "var(--ink-soft)" : "var(--bg)",
          border: published ? "1px solid var(--border)" : "1px solid transparent",
          opacity: isPending ? 0.6 : 1,
          cursor: isPending ? "default" : "pointer",
        }}
      >
        {isPending
          ? (published ? "Unpublishing…" : "Publishing…")
          : (published ? "Unpublish" : "Publish")}
      </button>
    </div>
  );
}
