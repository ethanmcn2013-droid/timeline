import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import Link from "next/link";

const STUDIO_URL =
  process.env.NEXT_PUBLIC_STUDIO_URL ?? "https://studio-sigma-pied-75.vercel.app";
const TASKS_URL = "https://tasks-nu-hazel.vercel.app";

export const metadata: Metadata = {
  title: "About — Roadmap",
  description:
    "Made by the same studio behind Tasks. Built for the people who actually use what you're shipping.",
};

const ANTI_FEATURES = [
  {
    label: "Not a project management tool",
    note: "No tickets, no sprints, no velocity. Roadmap is for communicating direction, not managing work.",
  },
  {
    label: "Not a slide deck",
    note: "It's a live URL, not a PDF your customers can't find six months later.",
  },
  {
    label: "Not for your engineering team",
    note: "Your engineers already know what's happening. This is for everyone else — customers, stakeholders, the people who just want to know when the thing they asked for is coming.",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />

      <main className="flex-1 px-6 py-20 md:py-28">
        <div className="mx-auto w-full max-w-2xl">

          {/* Eyebrow */}
          <p
            className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--brand)" }}
          >
            About
          </p>

          {/* What we believe */}
          <h1
            className="mb-8 text-[clamp(2rem,1.5rem+2vw,3rem)] font-semibold leading-[1.05]"
            style={{ letterSpacing: "-0.035em", color: "var(--ink)" }}
          >
            A roadmap is a promise,<br />not a backlog export.
          </h1>

          <div
            className="mb-16 max-w-xl space-y-4 text-[16px] leading-[1.65]"
            style={{ color: "var(--ink-soft)" }}
          >
            <p>
              Roadmap is one of two products from{" "}
              <a
                href={`${STUDIO_URL}/about`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2 transition-colors hover:text-ink"
              >
                studio.
              </a>{" "}
              The other is{" "}
              <a
                href={TASKS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors hover:text-ink"
              >
                Tasks
              </a>
              , a project-management workspace for non-tech teams.
            </p>
            <p>
              Built for the 80% who don&apos;t ship from a sprint board — the customers, the
              stakeholders, the people who just want to know what&apos;s coming without needing
              a glossary.
            </p>
            <p>
              We believe your roadmap should be something you&apos;re proud to share publicly.
              Not a screenshot of a board. Not a waterfall chart. A living document, in plain
              English, that your users can actually read and hold you to.
            </p>
          </div>

          {/* What this isn't */}
          <div
            className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
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

          {/* CTA */}
          <div className="mt-16 flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-white shadow-sm transition-transform hover:-translate-y-px hover:shadow-md"
            >
              Create your roadmap →
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center rounded-full border px-5 py-2.5 text-[14px] font-medium transition-colors hover:border-ink-soft hover:text-ink"
              style={{ borderColor: "var(--border)", color: "var(--ink-soft)" }}
            >
              See it live
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
