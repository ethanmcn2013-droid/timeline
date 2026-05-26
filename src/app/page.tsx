import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { RoadmapHeroLoader } from "@/components/marketing/roadmap-hero-loader";
import { Hero } from "@/components/marketing/hero";
import { ItemAnatomy } from "@/components/marketing/anatomy";

/**
 * Roadmap marketing homepage — structure:
 *   1. RoadmapHeroLoader — roll + Limerick map heartbeat animation
 *   2. Hero              — product intro text + animated live demo
 *   3. ItemAnatomy       — roadmap item anatomy breakdown
 *   4. CTA               — confident close
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">
        <RoadmapHeroLoader />
        <Hero />

        {/* What an item is — the product's smallest unit, explained */}
        <ItemAnatomy />

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
              Publish the version everyone can read.
            </h2>
            <p
              className="mt-5 max-w-[56ch] text-[15px] leading-[1.6]"
              style={{ color: "var(--ink-soft)" }}
            >
              Give the work one public shape: what changed, why it matters,
              and where the plan is going next.
            </p>
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
