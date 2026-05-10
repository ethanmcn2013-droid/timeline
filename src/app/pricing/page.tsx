import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { CompAccordion } from "./_components/comp-accordion";
import { UpgradeLink } from "./_components/upgrade-link";
import { getCurrentUser } from "@/server/auth";
import { CONTACT_MAILTO } from "@/lib/product-urls";

export const metadata: Metadata = {
  title: "Pricing — Roadmap",
  description:
    "Pay for projects, not seats. Free until you outgrow it. Then $9. No team tier — that's the point.",
};

// ── Types ─────────────────────────────────────────────────────────────────────

type Tier = {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  cta: string;
  /** href used when the visitor is signed-out (or always, for Free/Students). */
  href: string;
  /**
   * href used when the visitor is already signed in.
   * When set and visitor is signed-in, this overrides `href`.
   * Keep this unset until billing routes exist in the repo.
   */
  signedInHref?: string;
  accent?: "default" | "chosen" | "students";
};

// ── Data ──────────────────────────────────────────────────────────────────────

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever, no card",
    blurb: "One workspace, one project. Public by default. A real roadmap, not a placeholder.",
    features: [
      "1 workspace, 1 project",
      "Public master roadmap URL",
      "Refusals page — decisions are only legible if you can see the no's",
      "Markdown editor",
      "Public shareable link, no sign-in required",
    ],
    cta: "Start free",
    href: "/sign-up",
  },
  {
    name: "Pro",
    price: "$9",
    cadence: "/ month",
    blurb: "Unlimited projects. The tools that make a roadmap a product.",
    features: [
      "Unlimited projects per workspace",
      "Custom workspace URL",
      "Refusals page across every project",
      "Weekly digest emails, planned",
      "Share images, planned",
    ],
    cta: "Start Pro",
    href: "/sign-up?plan=pro",
    accent: "chosen",
  },
  {
    name: "Students",
    price: "Free",
    cadence: "with .edu or proof",
    blurb: "Pro features, no cost. Ship your thesis, not your wallet.",
    features: [
      "Everything in Pro",
      "Verified .edu address or proof of enrollment",
      "No time limit while enrolled",
    ],
    cta: "Apply with .edu",
    href: `${CONTACT_MAILTO}?subject=Student%20access%20%E2%80%94%20Signal%20Roadmap`,
    accent: "students",
  },
];

// ── Comparison table ──────────────────────────────────────────────────────────

type CompRow = {
  label: string;
  free: string;
  pro: string;
  students: string;
};

const COMP_ROWS: CompRow[] = [
  { label: "Workspaces",         free: "1",           pro: "1",         students: "1" },
  { label: "Projects",           free: "1",           pro: "Unlimited", students: "Unlimited" },
  { label: "Public roadmap",     free: "Yes",         pro: "Yes",       students: "Yes" },
  { label: "Refusals page",      free: "Yes",         pro: "Yes",       students: "Yes" },
  { label: "Custom URL",         free: "—",           pro: "Yes",       students: "Yes" },
  { label: "Weekly digest",      free: "—",           pro: "Planned",   students: "Planned" },
  { label: "Share images",       free: "—",           pro: "Planned",   students: "Planned" },
];

// ── FAQ data ──────────────────────────────────────────────────────────────────

const FAQ: { q: string; a: string }[] = [
  {
    q: "Will public roadmaps ever cost money?",
    a: "No. Public read-only access stays free, always. The URL you share with customers will never require them to sign in or pay. That's a design constraint, not a policy.",
  },
  {
    q: "Why public-by-default?",
    a: "Because a roadmap that lives behind a login is a slide deck that escaped. The whole point is that customers, investors, and the people who asked for the thing can see it without an account. Private workspaces aren't on the roadmap.",
  },
  {
    q: "What if I don't ship anything for a month?",
    a: "Nothing happens. Roadmap doesn't expire, nag, or degrade because you went quiet. Some months the answer is 'nothing shipped' — that's a legitimate roadmap update.",
  },
  {
    q: "Can I migrate from Productboard or Notion?",
    a: "Roadmap reads plain markdown with a lightweight tag for dates. If you can paste, you can migrate. There's no import wizard — that's not laziness, it's a 10-minute ceiling on setup cost.",
  },
  {
    q: "What counts as a student?",
    a: "An active .edu email address, or any proof of enrollment. We verify manually and turn it around in one business day. Email us at hello@signalstudio.ie.",
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "Nothing is deleted. During private preview, plan limits are guidance while the billing path is being finished.",
  },
  {
    q: "Is billing live yet?",
    a: "Not yet. Signal Roadmap is in private preview. The paid plan is the intended shape, but billing should not be treated as live until the repo contains the checkout route and the preview proves it.",
  },
];

// ── Check icon ────────────────────────────────────────────────────────────────

function Check({ color = "var(--status-shipped)" }: { color?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Tier card ─────────────────────────────────────────────────────────────────

function TierCard({ tier: t, isSignedIn }: { tier: Tier; isSignedIn: boolean }) {
  const isChosen = t.accent === "chosen";
  const isStudents = t.accent === "students";
  // Resolve the CTA href: billing links stay unset until the route exists.
  const ctaHref = isSignedIn && t.signedInHref ? t.signedInHref : t.href;

  return (
    <div
      className="relative flex flex-col rounded-2xl p-6"
      style={{
        background: isChosen ? "var(--bg-elev)" : isStudents ? "var(--bg-elev)" : "var(--bg-elev)",
        border: isChosen
          ? "1.5px solid var(--brand)"
          : "1px solid var(--border)",
        boxShadow: isChosen ? "var(--shadow-indigo)" : "var(--shadow-1)",
      }}
    >
      {isChosen && (
        <div
          className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
          style={{ background: "var(--brand)" }}
        >
          Recommended
        </div>
      )}
      {isStudents && (
        <div
          className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            background: "var(--aud-student)",
            color: "#1a1200",
          }}
        >
          Students
        </div>
      )}

      <div
        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: isChosen ? "var(--brand)" : "var(--ink-soft)" }}
      >
        {t.name}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span
          className="text-[32px] font-semibold leading-none"
          style={{
            color: "var(--ink)",
            letterSpacing: "-0.04em",
          }}
        >
          {t.price}
        </span>
        <span
          className="text-[12px] leading-tight"
          style={{ color: "var(--ink-quiet)" }}
        >
          {t.cadence}
        </span>
      </div>

      <p
        className="mt-2 text-[13px] leading-[1.5]"
        style={{ color: "var(--ink-soft)" }}
      >
        {t.blurb}
      </p>

      <ul className="mt-5 flex-1 space-y-2 text-[13px]" style={{ color: "var(--ink-soft)" }}>
        {t.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check color={isStudents ? "var(--aud-student)" : isChosen ? "var(--brand)" : "var(--status-shipped)"} />
            <span className="leading-[1.45]">{f}</span>
          </li>
        ))}
      </ul>

      <UpgradeLink
        href={ctaHref}
        isPaid={!!(t.signedInHref)}
        className="mt-6 block w-full rounded-full py-2.5 text-center text-[13.5px] font-medium transition-all hover:-translate-y-px"
        style={
          isChosen
            ? {
                background: "var(--brand)",
                color: "#fff",
                boxShadow: "var(--shadow-indigo)",
              }
            : isStudents
            ? {
                background: "var(--aud-student)",
                color: "#1a1200",
              }
            : {
                background: "var(--bg-deep)",
                color: "var(--ink)",
              }
        }
      >
        {t.cta}
      </UpgradeLink>
    </div>
  );
}

// ── Comparison table (desktop) ─────────────────────────────────────────────────

function CompTable() {
  return (
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr>
          <th
            className="pb-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--ink-quiet)", width: "40%" }}
          >
            Feature
          </th>
          {["Free", "Pro", "Students"].map((col) => (
            <th
              key={col}
              className="pb-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{
                color: col === "Pro" ? "var(--brand)" : "var(--ink-quiet)",
                width: "20%",
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {COMP_ROWS.map((row) => (
          <tr
            key={row.label}
            style={{
              borderTop: `1px solid var(--border)`,
            }}
          >
            <td
              className="py-3 pr-4 font-medium"
              style={{ color: "var(--ink-soft)" }}
            >
              {row.label}
            </td>
            {(["free", "pro", "students"] as const).map((col) => {
              const val = row[col];
              const isEmpty = val === "—";
              return (
                <td
                  key={col}
                  className="py-3 text-center"
                  style={{
                    color: isEmpty
                      ? "var(--ink-quiet)"
                      : col === "pro"
                      ? "var(--brand)"
                      : "var(--ink-soft)",
                  }}
                >
                  {val === "Yes" ? (
                    <span className="flex justify-center">
                      <Check
                        color={
                          col === "pro"
                            ? "var(--brand)"
                            : "var(--status-shipped)"
                        }
                      />
                    </span>
                  ) : (
                    <span className={isEmpty ? "opacity-30" : ""}>{val}</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PricingPage() {
  // Resolve auth state so signed-in CTAs can bypass /sign-up
  const user = await getCurrentUser();
  const isSignedIn = user !== null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />

      <main className="flex-1">

        {/* ── 1. Hero strip ─────────────────────────────────────────── */}
        <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="mx-auto w-full max-w-[780px]">
            <p
              className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--brand)" }}
            >
              Pricing
            </p>
            <h1
              className="mb-4 text-[clamp(2rem,1.4rem+2.5vw,3.25rem)] font-semibold leading-[1.05]"
              style={{ letterSpacing: "-0.038em", color: "var(--ink)" }}
            >
              Pay for projects, not seats.
            </h1>
            <p
              className="max-w-[52ch] text-[16px] leading-[1.6]"
              style={{ color: "var(--ink-soft)" }}
            >
              Free until you outgrow it. Then $9. No team tier — that&apos;s the point.
            </p>
          </div>
        </section>

        {/* ── 2. Tier grid ──────────────────────────────────────────── */}
        <section className="px-6 pb-16">
          <div className="mx-auto w-full max-w-[1100px]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TIERS.map((t) => (
                <TierCard key={t.name} tier={t} isSignedIn={isSignedIn} />
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Comparison ─────────────────────────────────────────── */}
        <section className="px-6 pb-16">
          <div className="mx-auto w-full max-w-[780px]">
            <p
              className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-quiet)" }}
            >
              Compare
            </p>

            {/* Desktop */}
            <div className="hidden md:block">
              <CompTable />
            </div>

            {/* Mobile */}
            <div className="md:hidden">
              <CompAccordion rows={COMP_ROWS} />
            </div>
          </div>
        </section>

        {/* ── 4. Why no team tier ───────────────────────────────────── */}
        <section className="px-6 pb-16">
          <div className="mx-auto w-full max-w-[780px]">
            <div
              className="rounded-2xl border px-8 py-7"
              style={{
                background: "var(--bg-elev)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-1)",
              }}
            >
              <p
                className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--ink-quiet)" }}
              >
                A deliberate choice
              </p>
              <h2
                className="mb-4 text-[20px] font-semibold leading-[1.2]"
                style={{ letterSpacing: "-0.025em", color: "var(--ink)" }}
              >
                No team tier in v1.
              </h2>
              <p
                className="text-[14.5px] leading-[1.65]"
                style={{ color: "var(--ink-soft)", maxWidth: "58ch" }}
              >
                Roadmaps are written by one voice. Comments come from many. That&apos;s
                not a missing feature — it&apos;s the architecture. A roadmap authored
                by committee doesn&apos;t have a point of view; it has a meeting.
                Multi-author editing is on the list, but only once we&apos;ve figured out
                how to do it without turning every decision into a negotiation. Until
                then, one author, many readers. That&apos;s a better product.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. FAQ ────────────────────────────────────────────────── */}
        <section className="px-6 pb-20">
          <div className="mx-auto w-full max-w-[780px]">
            <p
              className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-quiet)" }}
            >
              Questions
            </p>
            <h2
              className="mb-8 text-[24px] font-semibold leading-[1.1]"
              style={{ letterSpacing: "-0.03em", color: "var(--ink)" }}
            >
              The fine print, in plain English.
            </h2>
            <dl className="space-y-5">
              {FAQ.map((item) => (
                <div
                  key={item.q}
                  className="rounded-xl border px-5 py-4"
                  style={{
                    background: "var(--bg-elev)",
                    borderColor: "var(--border)",
                    boxShadow: "var(--shadow-1)",
                  }}
                >
                  <dt
                    className="mb-1.5 text-[14px] font-semibold"
                    style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}
                  >
                    {item.q}
                  </dt>
                  <dd
                    className="text-[13.5px] leading-[1.6]"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── 6. Closing CTA ────────────────────────────────────────── */}
        <section className="px-6 pb-24">
          <div className="mx-auto w-full max-w-[780px]">
            <div
              className="rounded-2xl border px-8 py-10 text-center"
              style={{
                background: "var(--bg-elev)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-2)",
              }}
            >
              <p
                className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--brand)" }}
              >
                Start here
              </p>
              <h2
                className="mb-3 text-[22px] font-semibold leading-[1.15]"
                style={{ letterSpacing: "-0.03em", color: "var(--ink)" }}
              >
                Ship the first one free.
              </h2>
              <p
                className="mb-8 text-[14px] leading-[1.55]"
                style={{ color: "var(--ink-soft)" }}
              >
                One project, public by default, no card required. Upgrade
                when the project count does.
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center rounded-full px-6 py-2.5 text-[14px] font-medium text-white transition-all hover:-translate-y-px"
                  style={{
                    background: "var(--brand)",
                    boxShadow: "var(--shadow-indigo)",
                  }}
                >
                  Create yours, free &rarr;
                </Link>
                <Link
                  href="/about"
                  className="text-[13.5px] transition-colors hover:text-ink"
                  style={{ color: "var(--ink-quiet)" }}
                >
                  Learn what it&apos;s for
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
