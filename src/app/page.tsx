import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Hero } from "@/components/marketing/hero";
import { ItemAnatomy } from "@/components/marketing/anatomy";

// ── Feature grid data ───────────────────────────────────────────────────────

const FEATURES = [
  {
    title: "Plain-English roadmap",
    body: "Write the plan once and publish a readable page. No board screenshot required.",
  },
  {
    title: "Public link, no account",
    body: "One URL your customers can bookmark. No login, no paywall. Just the roadmap.",
  },
  {
    title: "Built to be read",
    body: "Status labels people understand. Shipped, doing, held up, refused. Nothing extra.",
  },
] as const;

// ── How it works ─────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    index: "01",
    title: "Write the plan",
    body: "Start with plain text. Signal Roadmap turns it into a structured, readable page.",
  },
  {
    index: "02",
    title: "Get a public URL in seconds",
    body: "Your roadmap lives at a shareable link the moment you publish. No embed code, no iframe.",
  },
  {
    index: "03",
    title: "Share it with anyone",
    body: "Send the URL to customers, clients, or investors. No account required to view.",
  },
] as const;

// ── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">
        <Hero />

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-[1240px] px-6 pt-24" aria-hidden>
          <div style={{ height: "1px", background: "var(--border)" }} />
        </div>

        {/* ── Feature grid ─────────────────────────────────────────── */}
        <section id="features" className="px-6 py-20">
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

        {/* ── Anatomy ──────────────────────────────────────────────── */}
        <ItemAnatomy />

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-[1240px] px-6" aria-hidden>
          <div style={{ height: "1px", background: "var(--border)" }} />
        </div>

        {/* ── Proof section ────────────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="mx-auto w-full max-w-[1240px]">
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

            <Link
              href="/demo"
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

            <div className="mt-4 flex max-w-2xl items-center justify-between">
              <p className="text-[12px]" style={{ color: "var(--ink-quiet)" }}>
                No login. No paywall. Just a URL.
              </p>
              <Link
                href="/demo"
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
        <section id="how-it-works" className="px-6 py-20">
          <div className="mx-auto w-full max-w-[1240px]">
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
      </main>
      <SiteFooter />
    </div>
  );
}
