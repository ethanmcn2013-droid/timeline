import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Pricing — Roadmap",
  description: "Free during early access. Pricing arrives at launch.",
};

// ── FAQ data ─────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: "When does pricing land?",
    a: "When we launch publicly. Early adopters lock in the founder rate — whatever that ends up being, it won't apply to you.",
  },
  {
    q: "Will public roadmaps ever cost money?",
    a: "No. Public read-only access stays free, always. The URL you share with customers will never require them to sign in or pay.",
  },
  {
    q: "Can I use this with a team?",
    a: "Yes — workspace seats are unlimited during early access. Invite as many collaborators as you need.",
  },
] as const;

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />

      <main className="flex-1 px-6 pt-20 pb-32 md:pt-28">
        <div className="mx-auto w-full max-w-md">

          {/* Eyebrow */}
          <p
            className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--brand)" }}
          >
            Pricing
          </p>

          <h1
            className="mb-5 text-[clamp(1.75rem,1.4rem+1.5vw,2.5rem)] font-semibold leading-[1.1]"
            style={{ letterSpacing: "-0.035em", color: "var(--ink)" }}
          >
            Free during early access.
          </h1>

          {/* Card */}
          <div
            className="mb-4 rounded-2xl border p-8"
            style={{
              background: "var(--bg-elev)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-2)",
            }}
          >
            <div className="mb-1 flex items-end gap-2">
              <span
                className="text-[42px] font-semibold leading-none tabular-nums"
                style={{ color: "var(--ink)", letterSpacing: "-0.04em" }}
              >
                $0
              </span>
              <span
                className="mb-1.5 text-[14px]"
                style={{ color: "var(--ink-quiet)" }}
              >
                / month
              </span>
            </div>
            <p
              className="mb-6 text-[13.5px] leading-[1.5]"
              style={{ color: "var(--ink-soft)" }}
            >
              Full access while we&apos;re in early access. No credit card required.
              Pricing arrives at launch — early adopters get a founder rate.
            </p>

            <ul className="mb-8 space-y-2.5">
              {[
                "Unlimited public roadmaps",
                "Markdown source editor",
                "Public shareable URL",
                "Workspace with multiple projects",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13.5px]" style={{ color: "var(--ink-soft)" }}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-px shrink-0"
                    style={{ color: "var(--status-shipped)" }}
                    aria-hidden
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/sign-up"
              className="block w-full rounded-full bg-ink py-2.5 text-center text-[14px] font-medium text-white shadow-sm transition-transform hover:-translate-y-px hover:shadow-md"
            >
              Create yours, free →
            </Link>
          </div>

          {/* Pricing lock note */}
          <p
            className="mb-2 text-[12px]"
            style={{ color: "var(--ink-quiet)" }}
          >
            Pricing locks in at launch. Early access users keep this rate.
          </p>

          {/* Comparison line */}
          <p
            className="mb-10 text-[13px] italic leading-[1.5]"
            style={{ color: "var(--ink-soft)" }}
          >
            Jira charges $8.15/user/month to show stakeholders a ticket board. This is free and readable.
          </p>

          {/* FAQ */}
          <div
            className="mb-6 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--ink-quiet)" }}
          >
            Questions
          </div>
          <dl className="space-y-6">
            {FAQ.map((item) => (
              <div key={item.q} className="border-t pt-5" style={{ borderColor: "var(--border)" }}>
                <dt
                  className="mb-1.5 text-[14px] font-semibold"
                  style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}
                >
                  {item.q}
                </dt>
                <dd
                  className="text-[13.5px] leading-[1.55]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>

          {/* Contact */}
          <p
            className="mt-10 text-[12px]"
            style={{ color: "var(--ink-quiet)" }}
          >
            Other questions?{" "}
            <a
              href="mailto:ethanmcn2013@gmail.com"
              className="underline underline-offset-2 transition-colors hover:text-ink"
            >
              Reach out.
            </a>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
