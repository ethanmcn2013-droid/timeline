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
    title: "Composite-PK multi-tenancy + demo workspace seeded",
    items: [
      "Workspace slugs now form a composite primary key with project slugs — no more cross-workspace collisions.",
      "Demo workspace at /tasks seeded with real roadmap items: product discovery, design system pass, public beta, changelog page.",
      "Portfolio backfill: existing single-project workspaces migrated to the new schema without data loss.",
      "Comments are now auth-gated — public visitors can read, only workspace owners can write.",
    ],
  },
  {
    date: "May 8, 2026",
    title: "Studio brand integration",
    items: [
      "studio. parent-brand whisper added to site nav — a subtle separator and link that places Roadmap in its product family.",
      "Footer cross-links to studio. and Tasks; the 'Made by' column renders the full product suite.",
      "Wordmark component extracted with animated dot — same motion primitive as Tasks, different brand context.",
      "NEXT_PUBLIC_STUDIO_URL env var wired through; falls back to production URL in local dev.",
    ],
  },
  {
    date: "May 8, 2026",
    title: "Branded 404 on unknown workspace slugs",
    items: [
      "Unknown workspace slugs now render a custom not-found page instead of Next.js default.",
      "Not-found surface uses the full site chrome: nav, footer, wordmark — no orphaned pages.",
      "Reserved slug list added (sign-in, sign-up, app, pricing, demo, about, tasks, etc.) to prevent workspace creation that would shadow marketing routes.",
      "Workspace-level 404 links back to /demo so confused visitors land somewhere useful.",
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
