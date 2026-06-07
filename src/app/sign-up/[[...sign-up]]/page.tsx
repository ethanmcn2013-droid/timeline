import { SignUp } from "@clerk/nextjs";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata = { title: "Reserve a workspace name — Roadmap" };

/**
 * Walkover row 8 (Dalí, 2026-06-07): read-only state honesty.
 *
 * Publishing is operator-blocked while Upstash is being provisioned.
 * Telling visitors "Free to start" and "you'll have a workspace live in
 * minutes" is a demo-vs-reality gap — a locked refusal in PRODUCT.md.
 *
 * Until Upstash is live, this page is a reading-room: visitors can
 * reserve a workspace name. Clerk still creates the account so the
 * reservation is real, but the framing matches the state.
 */
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      <div className="px-6 pt-6">
        <Wordmark size="md" />
      </div>
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
        <div
          className="mb-6 inline-flex max-w-[44ch] items-start gap-3 rounded-lg border px-4 py-3"
          style={{
            borderColor: "var(--border-soft)",
            background: "var(--bg-deep)",
          }}
          role="status"
        >
          <span
            aria-hidden
            className="mt-1 block h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-emerald-500"
          />
          <div className="text-[13px] leading-[1.55]" style={{ color: "var(--ink-soft)" }}>
            <p>
              <strong style={{ color: "var(--ink)" }}>Reading-room mode</strong>
              {" — "}
              publishing reopens soon. Reserve your workspace name now and
              we will hold it for you.
            </p>
          </div>
        </div>
        <SignUp />
        <p
          className="mt-5 text-[13px]"
          style={{ color: "var(--ink-quiet)" }}
        >
          You&apos;ll receive a note the moment publishing reopens. Your
          workspace name is yours either way.
        </p>
      </main>
    </div>
  );
}
