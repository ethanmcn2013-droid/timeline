import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Hero } from "@/components/marketing/hero";
import { ItemAnatomy } from "@/components/marketing/anatomy";

// One narrative, nothing redundant. The hero shows the real product; the rest
// answers the three things a first-time visitor actually asks — what is an
// item, how do I make one, and can I see it. No duplicate feature triads, no
// hairline dividers between every block. "Everything important. Nothing
// distracting." (BRAND.md §2).

const STEPS = [
  {
    index: "01",
    title: "Write it in plain English",
    body: "Type the plan the way you'd explain it out loud. No statuses to configure, no board to build first.",
  },
  {
    index: "02",
    title: "Publish to one link",
    body: "It becomes a page the moment you publish. No embed code, no export, no screenshot of a board.",
  },
  {
    index: "03",
    title: "Anyone can read it",
    body: "Send the link to a client, a couple, a crew. They open it and understand it. No account, no app.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">
        <Hero />

        {/* What an item is — the product's smallest unit, explained */}
        <ItemAnatomy />

        {/* How it works — one triad, the only one */}
        <section id="how-it-works" className="px-6 pt-24 pb-8 md:pt-32">
          <div className="mx-auto w-full max-w-[1240px]">
            <p
              className="mb-12 font-mono text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: "var(--ink-quiet)" }}
            >
              How it works
            </p>
            <div className="grid gap-x-10 gap-y-12 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.index} className="flex flex-col gap-3">
                  <span
                    className="font-mono text-[12px] font-semibold tracking-[0.14em]"
                    style={{ color: "var(--brand)" }}
                  >
                    {step.index}
                  </span>
                  <h3
                    className="text-[16px] font-semibold"
                    style={{ color: "var(--ink)", letterSpacing: "-0.015em" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-[14px] leading-[1.6]"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Confident close — one ask, no noise */}
        <section className="px-6 pt-28 pb-32 md:pt-36 md:pb-40">
          <div className="mx-auto w-full max-w-[1240px]">
            <h2
              className="max-w-[18ch] font-display"
              style={{
                fontSize: "var(--fs-section)",
                fontWeight: 600,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: "var(--ink)",
              }}
            >
              Your plan, somewhere people will actually look.
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium text-white transition-transform hover:-translate-y-px"
                style={{ background: "var(--ink)" }}
              >
                Publish your plan
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/demo"
                className="text-[14px] font-medium transition-colors hover:text-ink"
                style={{ color: "var(--brand)" }}
              >
                See the live demo &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
