"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useClerk } from "@clerk/nextjs";

function humaniseError(message: string | undefined, status: number): string {
  if (status === 401) return "You're signed out. Sign in again, then retry.";
  if (status === 500)
    return "Something went wrong on our end. Try again in a moment. If it keeps failing, email hello@signalstudio.ie.";
  return message ?? `Delete failed (${status}).`;
}

/**
 * App Store 5.1.1(v) compliant account deletion.
 *
 * Inline reveal pattern: clicking "Delete account" reveals the
 * email-confirmation field in place. On reveal we auto-focus the
 * input and scroll it into view — without that, a phone-screen user
 * who taps the button can have the new content appear below the fold
 * silently, and keyboard / assistive-tech users would have to tab
 * forward to reach it.
 *
 * Server purges Turso data first, then calls Clerk admin delete.
 * The match-confirmation signal on the input border (rose when the
 * typed string matches the user's email) gives a visible state change
 * before the action button itself activates.
 */
export function DangerZone({ email }: { email: string }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const matches = typed.trim().toLowerCase() === email.toLowerCase();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confirming) return;
    inputRef.current?.focus();
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [confirming]);

  async function runDelete() {
    if (!matches || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(humaniseError(body.message, res.status));
      }
      await signOut({ redirectUrl: "/" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPending(false);
    }
  }

  return (
    <section className="mt-10 rounded-lg border border-rose-100 bg-rose-50/40 p-5">
      <h2 className="text-[14px] font-semibold tracking-tight text-rose-900">
        Delete account
      </h2>
      <p className="mt-1.5 max-w-[560px] text-[12.5px] leading-[1.6] text-rose-800/80">
        Closes your Signal account across every product — Tasks, Notes,
        Roadmap, Analytics. Workspaces you own are deleted with you, including
        anyone you've invited. There's no undo.
      </p>

      {!confirming ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-[12.5px] font-medium text-rose-700 transition-colors hover:bg-rose-50"
          >
            Delete account
          </button>
        </div>
      ) : (
        <div
          ref={panelRef}
          className="mt-4 rounded-md border border-rose-200 bg-white/70 p-4"
        >
          <label
            htmlFor="confirm-email"
            className="text-[11px] uppercase tracking-[0.12em] text-rose-800"
          >
            Type your email to confirm
          </label>
          <input
            ref={inputRef}
            id="confirm-email"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={email}
            autoComplete="off"
            disabled={pending}
            className={
              "mt-1 w-full rounded-md border bg-white px-3 py-2 text-[13.5px] outline-none transition-colors disabled:opacity-60 " +
              (matches
                ? "border-rose-400 focus:border-rose-500"
                : "border-rose-200 focus:border-rose-400")
            }
          />
          {error ? (
            <p className="mt-3 text-[12px] text-rose-700">{error}</p>
          ) : null}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (pending) return;
                setConfirming(false);
                setTyped("");
                setError(null);
              }}
              disabled={pending}
              className="rounded-md px-3 py-1.5 text-[12.5px] text-rose-700/70 transition-colors hover:text-rose-800 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={runDelete}
              disabled={!matches || pending}
              className={
                "rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors " +
                (matches && !pending
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "cursor-not-allowed bg-rose-200 text-rose-50/70")
              }
            >
              {pending ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
