"use client";

import { useActionState, useState } from "react";
import { saveProjectSourceAction } from "@/server/actions/workspaces";

type ActionState = {
  error?: string;
  ok: boolean;
  count?: number;
  lastParsedAt?: string;
};

const initialState: ActionState = {
  error: undefined,
  ok: false,
  count: undefined,
  lastParsedAt: undefined,
};

function formatParsedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function SourceEditor({
  projectSlug,
  workspaceSlug,
  initialContent,
  initialLastParsedAt,
  initialCount,
}: {
  projectSlug: string;
  workspaceSlug: string;
  initialContent: string;
  initialLastParsedAt?: string | null;
  initialCount?: number | null;
}) {
  const [content, setContent] = useState(initialContent);

  const [state, formAction, pending] = useActionState(
    async (): Promise<ActionState> => {
      const result = await saveProjectSourceAction(
        projectSlug,
        workspaceSlug,
        content,
      );
      if ("error" in result) return { error: result.error, ok: false };
      return {
        error: undefined,
        ok: true,
        count: result.count,
        lastParsedAt: result.lastParsedAt,
      };
    },
    initialState,
  );

  // Resolve display values: prefer live state, fall back to server props
  const displayCount = state.count ?? initialCount;
  const displayParsedAt = state.lastParsedAt ?? initialLastParsedAt;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`# Mobile App v2 Roadmap\n\n## In Flight\n- [ ] Auth redesign\n\n## Next\n- [ ] Offline mode\n- **Beta launch** — 2026-06-15\n\n## Shipped\n- [x] Push notifications`}
        className="field flex-1 rounded-xl border p-4 text-sm leading-relaxed resize-none min-h-[480px]"
        style={{
          background: "var(--bg-elev)",
          color: "var(--ink)",
          fontFamily: "var(--font-mono-stack)",
          lineHeight: "1.65",
        }}
        spellCheck={false}
      />

      <div className="flex items-center justify-between gap-4">
        {/* Left: status copy */}
        <div className="flex flex-col gap-0.5">
          {state.error ? (
            <p className="text-xs" style={{ color: "var(--status-blocked)" }}>
              {state.error}
            </p>
          ) : displayCount != null ? (
            <p className="text-xs" style={{ color: "var(--status-done)" }}>
              {displayCount === 0
                ? "No items found. Check your markdown headings and bullet syntax."
                : `${displayCount} item${displayCount === 1 ? "" : "s"} parsed.`}
              {displayParsedAt && (
                <span style={{ color: "var(--ink-quiet)" }}>
                  {" "}Last saved {formatParsedAt(displayParsedAt)}.
                </span>
              )}
            </p>
          ) : (
            <p className="text-xs" style={{ color: "var(--ink-quiet)" }}>
              Paste your roadmap markdown. Bullets become items.
            </p>
          )}
        </div>

        <form action={formAction} className="flex items-center gap-3 shrink-0">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            style={{
              background: "var(--brand)",
              transition: "opacity var(--motion-fast) var(--ease-standard), transform var(--motion-fast) var(--ease-standard)",
            }}
          >
            {pending ? "Parsing…" : "Save"}
          </button>
        </form>
      </div>

      {/* Syntax legend — tiny, low-key, lives below the action row. */}
      <details
        className="group rounded-xl border px-4 py-2.5"
        style={{ borderColor: "var(--border)", background: "var(--bg-elev)" }}
      >
        <summary
          className="flex cursor-pointer list-none items-center justify-between text-xs font-medium"
          style={{ color: "var(--ink-soft)" }}
        >
          <span>Bullet syntax</span>
          <span
            className="font-mono transition-transform group-open:rotate-90"
            style={{ color: "var(--ink-quiet)" }}
            aria-hidden
          >
            ›
          </span>
        </summary>
        <dl
          className="mt-3 grid gap-x-6 gap-y-1.5 text-[11.5px] sm:grid-cols-2"
          style={{ color: "var(--ink-quiet)" }}
        >
          <SyntaxRow code="- [ ] Title">next</SyntaxRow>
          <SyntaxRow code="- [/] Title">in-flight</SyntaxRow>
          <SyntaxRow code="- [x] Title">shipped</SyntaxRow>
          <SyntaxRow code="- [!] Title">blocked</SyntaxRow>
          <SyntaxRow code="- [-] Title">refused</SyntaxRow>
          <SyntaxRow code="- **Title** — 2026-06-15">
            milestone (wrap title in **bold**)
          </SyntaxRow>
        </dl>
        <p
          className="mt-3 text-[11px] leading-[1.55]"
          style={{ color: "var(--ink-quiet)" }}
        >
          Headings: <code className="font-mono">##</code> groups items into a
          week or phase heading;{" "}
          <code className="font-mono">###</code> sets a category.
          Dates in <code className="font-mono">YYYY-MM-DD</code> form are
          picked up anywhere in the line.
        </p>
      </details>
    </div>
  );
}

function SyntaxRow({
  code,
  children,
}: {
  code: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <code
        className="font-mono text-[11px]"
        style={{ color: "var(--ink-soft)" }}
      >
        {code}
      </code>
      <span aria-hidden>→</span>
      <span>{children}</span>
    </div>
  );
}
