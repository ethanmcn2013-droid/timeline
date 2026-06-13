import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { RoadmapDemo } from "@/components/showcase/roadmap-demo";
import Link from "next/link";
import { STUDIO_URL, TASKS_URL } from "@/lib/product-urls";

export const metadata: Metadata = {
  title: "About — Signal Timeline",
  description:
    "Direction clarity from Signal Studio. Built for people who need the plan without a glossary.",
  openGraph: {
    title: "About — Signal Timeline",
    description:
      "Direction clarity from Signal Studio. Built for people who need the plan without a glossary.",
    type: "website",
  },
};

const ANTI_FEATURES = [
  {
    index: "01",
    label: "Not a project management tool",
    note: "Signal Timeline is for communicating direction, not managing the work.",
  },
  {
    index: "02",
    label: "Not a slide deck",
    note: "It's a live URL, not a PDF your customers can't find six months later.",
  },
  {
    index: "03",
    label: "Not for the people doing the work",
    note: "They already know what's happening. This is for everyone else: customers, clients, and people waiting on the plan.",
  },
] as const;

const WHO_ITS_FOR = [
  { index: "01", line: "Service operators sharing what is happening with clients." },
  { index: "02", line: "Solo professionals who need public accountability." },
  { index: "03", line: "People coordinating a plan with clients, suppliers, or anyone waiting on the work." },
] as const;

export default function AboutPage() {
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
            About
          </p>

          {/* What we believe */}
          <h1
            className="mb-8 text-[clamp(2rem,1.5rem+2vw,3rem)] font-semibold leading-[1.05]"
            style={{ letterSpacing: "-0.035em", color: "var(--ink)" }}
          >
            A timeline is a promise,<br />not a backlog export.
          </h1>

          <div
            className="mb-16 max-w-xl space-y-4 text-[16px] leading-[1.65]"
            style={{ color: "var(--ink-soft)" }}
          >
            <p>
              Signal Timeline is one of four products from{" "}
              <a
                href={STUDIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2 transition-colors hover:text-ink"
              >
                Signal Studio
              </a>
              .{" "}
              It sits beside{" "}
              <a
                href={TASKS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors hover:text-ink"
              >
                Signal Tasks
              </a>
              , the execution-clarity workspace.
            </p>
            <p>
              Built for the 80% who do not want software vocabulary between
              them and the plan: customers, clients, tutors, coordinators,
              students, and operators.
            </p>
            <p>
              We believe your timeline should be something you&apos;re proud to share publicly.
              Not a screenshot of a board. Not a waterfall chart. A living document, in plain
              English, that your users can actually read and hold you to.
            </p>
          </div>

          {/* Live preview — Da Vinci walkover row 13. The about page
              tells the reader the product is a living document; here it
              is, running, the same loop the homepage hero shows. No
              screenshot, no PDF — the product proves itself in place. */}
          <div className="mb-16 -mx-2 sm:-mx-4 md:-mx-6">
            <p
              className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.16em] sm:px-4 md:px-6"
              style={{ color: "var(--ink-quiet)" }}
            >
              The plan, live
            </p>
            <RoadmapDemo domain="wedding" />
          </div>

          {/* What this isn't */}
          <div
            className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--ink-quiet)" }}
          >
            What this isn&apos;t
          </div>
          <ul className="mt-5 space-y-6">
            {ANTI_FEATURES.map((af) => (
              <li
                key={af.label}
                className="border-t pt-5"
                style={{ borderColor: "var(--border)" }}
              >
                <p
                  className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: "var(--brand)" }}
                >
                  {af.index}
                </p>
                <p
                  className="mb-1.5 text-[15px] font-semibold"
                  style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}
                >
                  {af.label}
                </p>
                <p
                  className="text-[13.5px] leading-[1.55]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {af.note}
                </p>
              </li>
            ))}
          </ul>

          {/* Who it's for */}
          <div
            className="mb-2 mt-16 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--ink-quiet)" }}
          >
            Who it&apos;s for
          </div>
          <ul className="mt-5 space-y-4">
            {WHO_ITS_FOR.map((item) => (
              <li
                key={item.index}
                className="flex items-start gap-4 border-t pt-4"
                style={{ borderColor: "var(--border)" }}
              >
                <span
                  className="mt-px text-[10px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: "var(--brand)", minWidth: "1.5rem" }}
                >
                  {item.index}
                </span>
                <p
                  className="text-[14px] leading-[1.55]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {item.line}
                </p>
              </li>
            ))}
          </ul>

          {/* Founding note */}
          <p
            className="mt-12 mb-2 text-[13px] italic"
            style={{ color: "var(--ink-soft)" }}
          >
            Made by one designer. Built carefully, in the open.
          </p>

          {/* CTA */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-white shadow-sm transition-transform hover:-translate-y-px hover:shadow-md"
            >
              Create your timeline →
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center rounded-full border px-5 py-2.5 text-[14px] font-medium transition-colors hover:border-ink-soft hover:text-ink"
              style={{ borderColor: "var(--border)", color: "var(--ink-soft)" }}
            >
              See it live
            </Link>
          </div>
          <p className="mt-5 text-[13px]" style={{ color: "var(--ink-quiet)" }}>
            Free to start.{" "}
            <a
              href="https://signalstudio.ie/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-ink"
            >
              See all plans ↗
            </a>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
