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
        placeholder={`# Mobile App v2 Roadmap\n\n## In Flight\n- [ ] Auth redesign\n\n## Next\n- [ ] Offline mode\n\n## Shipped\n- [x] Push notifications`}
        className="flex-1 rounded-xl border p-4 text-sm leading-relaxed outline-none transition-all resize-none min-h-[480px]"
        style={{
          background: "var(--bg-elev)",
          borderColor: "var(--border)",
          color: "var(--ink)",
          fontFamily: "var(--font-mono-stack)",
          lineHeight: "1.65",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "var(--brand)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "var(--border)")
        }
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
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-all disabled:opacity-40"
            style={{ background: "var(--brand)" }}
          >
            {pending ? "Parsing…" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
