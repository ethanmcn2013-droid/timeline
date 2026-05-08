import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

// ── Feature grid data ───────────────────────────────────────────────────────

const FEATURES = [
  {
    title: "Plain-English roadmap",
    body: "Paste markdown, get a public roadmap. No tickets, no sprints, no Jira re-export required.",
  },
  {
    title: "Public link, zero friction",
    body: "One URL your customers can bookmark. No login, no paywall — just your roadmap, live.",
  },
  {
    title: "Built for stakeholders, not engineers",
    body: "Status labels your whole team understands. Shipped, doing, blocked. Nothing else.",
  },
] as const;

// ── How it works ─────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    index: "01",
    title: "Paste your markdown",
    body: "Write your roadmap in plain text. We parse it into a structured, readable page.",
  },
  {
    index: "02",
    title: "Get a public URL in seconds",
    body: "Your roadmap lives at a shareable link the moment you publish. No embed code, no iframe.",
  },
  {
    index: "03",
    title: "Share it with anyone",
    body: "Send the URL to customers, stakeholders, or investors. No account required to view.",
  },
] as const;

// ── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-start justify-center px-6 py-28 md:py-36">
        <div className="mx-auto w-full max-w-3xl">

          {/* Eyebrow */}
          <div className="rise mb-6 flex items-center gap-2" style={{ animationDelay: "0ms" }}>
            <span className="live-dot" aria-hidden />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: "var(--brand)" }}
            >
              Now in early access
            </span>
          </div>

          {/* H1 */}
          <h1
            className="rise h-display mb-6 font-display"
            style={{ animationDelay: "80ms" }}
          >
            Show your work,<br />
            not your <span className="marker">Jira</span>.
          </h1>

          {/* Subhead */}
          <p
            className="rise mb-10 max-w-md text-[18px] leading-[1.55]"
            style={{ color: "var(--ink-soft)", animationDelay: "160ms" }}
          >
            A public roadmap your customers can actually read — written in plain English, parsed from markdown, live in seconds.
          </p>

          {/* CTAs */}
          <div className="rise flex flex-wrap items-center gap-3" style={{ animationDelay: "240ms" }}>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-white shadow-sm transition-transform hover:-translate-y-px hover:shadow-md"
            >
              See it live
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center rounded-full border px-5 py-2.5 text-[14px] font-medium transition-colors hover:border-ink-soft hover:text-ink"
              style={{
                borderColor: "var(--border)",
                color: "var(--ink-soft)",
              }}
            >
              Create yours →
            </Link>
          </div>
        </div>
      </main>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div
        className="mx-auto w-full max-w-[1240px] px-6"
        aria-hidden
      >
        <div style={{ height: "1px", background: "var(--border)" }} />
      </div>

      {/* ── Feature grid ─────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto w-full max-w-[1240px]">
          <div className="grid gap-8 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col gap-2">
                <h3
                  className="text-[15px] font-semibold"
                  style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-[13.5px] leading-[1.55]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1240px] px-6" aria-hidden>
        <div style={{ height: "1px", background: "var(--border)" }} />
      </div>

      {/* ── Proof section ────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto w-full max-w-[1240px]">
          {/* Eyebrow */}
          <p
            className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--brand)" }}
          >
            Live demo
          </p>
          <h2
            className="mb-10 max-w-xl text-[clamp(1.5rem,1.2rem+1.5vw,2.25rem)] font-semibold leading-[1.1]"
            style={{ letterSpacing: "-0.03em", color: "var(--ink)" }}
          >
            This is what your customers would see.
          </h2>

          {/* Demo card — real screenshot of the live workspace */}
          <Link
            href="/tasks"
            className="group block max-w-2xl overflow-hidden rounded-2xl border transition-shadow hover:shadow-[var(--shadow-2)]"
            style={{
              background: "var(--bg-elev)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-1)",
            }}
          >
            <Image
              src="/proof-workspace.png"
              alt="Public roadmap workspace — live demo"
              width={1440}
              height={665}
              priority
              className="h-auto w-full"
            />
          </Link>

          {/* Caption + CTA below the screenshot */}
          <div className="mt-4 flex max-w-2xl items-center justify-between">
            <p
              className="text-[12px]"
              style={{ color: "var(--ink-quiet)" }}
            >
              No login. No paywall. Just a URL.
            </p>
            <Link
              href="/tasks"
              className="text-[13px] font-medium transition-colors hover:text-ink"
              style={{ color: "var(--brand)" }}
            >
              See it live →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1240px] px-6" aria-hidden>
        <div style={{ height: "1px", background: "var(--border)" }} />
      </div>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto w-full max-w-[1240px]">
          {/* Eyebrow */}
          <p
            className="mb-10 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--ink-quiet)" }}
          >
            How it works
          </p>

          <div className="grid gap-10 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.index} className="flex flex-col gap-3">
                <span
                  className="text-[11px] font-semibold tracking-[0.14em]"
                  style={{ color: "var(--brand)" }}
                >
                  {step.index}
                </span>
                <h3
                  className="text-[15px] font-semibold"
                  style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-[13.5px] leading-[1.55]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
