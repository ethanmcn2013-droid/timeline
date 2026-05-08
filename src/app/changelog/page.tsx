import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Changelog — Roadmap",
  description: "What we shipped, in the order we shipped it.",
};

// ── Changelog entries ────────────────────────────────────────────────────────

const ENTRIES = [
  {
    date: "May 8, 2026",
    title: "The day the slugs collided (and then didn't)",
    items: [
      "Two workspaces, each with a project named \"blog\" — the kind of thing that should be fine and quietly wasn't. A composite primary key on (workspace, project) means they're both fine now.",
      "The demo workspace is live at /tasks. Real items, real statuses — Roadmap managing its own roadmap. If that's not eating your own cooking, nothing is.",
      "Existing workspaces migrated forward cleanly. Nobody noticed, which is the correct outcome for a schema change.",
      "Comments now require a login to leave. Public visitors can still read everything — the room is open, the pen is behind the counter.",
    ],
  },
  {
    date: "May 8, 2026",
    title: "The quiet line in the nav that explains everything",
    items: [
      "A small \"studio.\" appears before the wordmark — a whisper, not a billboard. Click it and you land on the umbrella brand that also ships Tasks. The connection was always there; now it's visible.",
      "The footer learned the full product family. Tasks and Roadmap live side by side, linked. The \"Made by\" column earns its column now.",
      "The animated dot on the wordmark is the same primitive as Tasks, different context. Shared motion language without feeling like a copy.",
      "One env var wires the studio link; local dev falls back to production. One fewer thing to remember to set.",
    ],
  },
  {
    date: "May 8, 2026",
    title: "A 404 that knows where it lives",
    items: [
      "Type a workspace slug that doesn't exist and you used to get Next.js's default not-found page — no nav, no wordmark, no way back. You don't anymore.",
      "The not-found surface keeps the full site chrome: nav, footer, wordmark. A wrong turn shouldn't feel like you left the building.",
      "A reserved slug list stops someone from registering \"pricing\" as a workspace and quietly breaking the marketing route. Small guardrail, obvious-in-hindsight.",
      "The page links back to /demo so a confused visitor has somewhere to go. It's not a great landing, but it's a landing.",
    ],
  },
] as const;

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ChangelogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />

      <main className="flex-1 px-6 py-20 md:py-28">
        <div className="mx-auto w-full max-w-2xl">

          {/* Eyebrow */}
          <p
            className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--brand)" }}
          >
            Changelog
          </p>

          {/* Header */}
          <h1
            className="mb-4 text-[clamp(2rem,1.5rem+2vw,3rem)] font-semibold leading-[1.05]"
            style={{ letterSpacing: "-0.035em", color: "var(--ink)" }}
          >
            What we shipped.
          </h1>
          <p
            className="mb-16 text-[16px] leading-[1.55]"
            style={{ color: "var(--ink-soft)" }}
          >
            In the order we shipped it.
          </p>

          {/* Entries */}
          <div className="space-y-14">
            {ENTRIES.map((entry) => (
              <article key={`${entry.date}-${entry.title}`}>
                <div
                  className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em]"
                  style={{ color: "var(--ink-quiet)", fontVariant: "small-caps" }}
                >
                  {entry.date}
                </div>
                <h2
                  className="mb-5 text-[18px] font-semibold"
                  style={{ letterSpacing: "-0.02em", color: "var(--ink)" }}
                >
                  {entry.title}
                </h2>
                <ul className="space-y-2.5">
                  {entry.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-[14px] leading-[1.6]"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      <span
                        className="mt-[0.45em] h-[5px] w-[5px] shrink-0 rounded-full"
                        style={{ background: "var(--brand)", opacity: 0.5 }}
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <div
                  className="mt-8 h-px"
                  style={{ background: "var(--border)" }}
                  aria-hidden
                />
              </article>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-14">
            <p
              className="mb-4 text-[13px]"
              style={{ color: "var(--ink-quiet)" }}
            >
              Roadmap eats its own cooking. The demo workspace below is a real
              Roadmap workspace — managed and updated the same way yours would be.
            </p>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium transition-colors hover:text-ink"
              style={{ color: "var(--brand)" }}
            >
              See what&apos;s next →
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
