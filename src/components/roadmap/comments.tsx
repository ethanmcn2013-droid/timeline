"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import type { Comment } from "@/server/db/schema";
import { addCommentAction } from "@/server/actions/workspaces";

type AddState = { error?: string; ok: boolean };
const initialState: AddState = { error: undefined, ok: false };

/**
 * Comment thread — reads are public, writes are auth-gated.
 * When isAuthenticated=false the input is replaced with a sign-in nudge.
 */
export function Comments({
  comments,
  taskId,
  workspaceSlug,
  isAuthenticated,
}: {
  comments: Comment[];
  taskId: string;
  workspaceSlug: string;
  isAuthenticated: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: AddState, formData: FormData): Promise<AddState> => {
      const body = (formData.get("body") as string | null) ?? "";
      const result = await addCommentAction(taskId, workspaceSlug, body);
      if ("error" in result) return { error: result.error, ok: false };
      return { error: undefined, ok: true };
    },
    initialState,
  );

  const formRef = useRef<HTMLFormElement>(null);

  // Clear textarea on successful submission
  if (state.ok && formRef.current) {
    const ta = formRef.current.querySelector("textarea");
    if (ta) ta.value = "";
  }

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-quiet">
          Notes
        </h2>
        <span className="text-[12px] tabular-nums text-ink-quiet">
          {comments.length} {comments.length === 1 ? "note" : "notes"}
        </span>
      </div>

      {/* Existing comments — public read */}
      {comments.length === 0 ? (
        <p className="text-[13px] leading-[1.6] text-ink-quiet">
          No notes yet.
        </p>
      ) : (
        <ol className="space-y-4">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-line-soft bg-bg-elevated p-4"
            >
              <header className="mb-2 flex items-baseline justify-between gap-3">
                <span className="text-[12.5px] font-semibold tracking-[-0.005em] text-ink">
                  {c.author}
                </span>
                <span className="text-[10.5px] tabular-nums text-ink-quiet">
                  {new Date(c.createdAt)
                    .toISOString()
                    .slice(0, 16)
                    .replace("T", " ")}
                </span>
              </header>
              <p className="whitespace-pre-wrap text-[13.5px] leading-[1.6] text-ink-soft">
                {c.body}
              </p>
            </li>
          ))}
        </ol>
      )}

      {/* Write surface */}
      <div className="mt-8">
        {isAuthenticated ? (
          <form ref={formRef} action={formAction} className="flex flex-col gap-3">
            <textarea
              name="body"
              rows={3}
              required
              placeholder="Leave a note…"
              className="w-full rounded-xl border border-line-soft bg-bg-elevated px-4 py-3 text-[13.5px] leading-[1.6] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink-quiet"
              style={{ resize: "vertical" }}
            />
            {state.error && (
              <p className="text-[12px]" style={{ color: "var(--roadmap-red-fg)" }}>
                {state.error}
              </p>
            )}
            {state.ok && (
              <p className="text-[12px]" style={{ color: "var(--status-done)" }}>
                Note posted.
              </p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-white transition-all disabled:opacity-40"
                style={{ background: "var(--brand)" }}
              >
                {pending ? "Posting…" : "Post note"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-[13px] text-ink-quiet">
            <Link
              href="/sign-in"
              className="font-medium underline underline-offset-2 transition-colors hover:text-ink"
            >
              Sign in to leave a comment.
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
