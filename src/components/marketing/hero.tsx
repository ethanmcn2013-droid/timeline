import Image from "next/image";
import Link from "next/link";

/**
 * Roadmap homepage hero.
 * H1: "The plan your client can actually read."
 * "Show your work, not your Jira." sits in the supporting line — the register
 * of "what this isn't", not the primary claim.
 *
 * The visual is the REAL product (a live wedding plan — the 80%'s own use
 * case, BRAND.md §2.1), not a fabricated mock. Honesty is the pitch: what you
 * see here is exactly what loads at /demo. No audience-toggle theatre.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-8 md:pt-14">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-6">
        <p
          className="rise font-mono text-[11px] font-semibold uppercase"
          style={{
            color: "var(--ink-quiet)",
            letterSpacing: "0.14em",
            animationDelay: "0ms",
          }}
        >
          Signal Roadmap &middot; Direction clarity
        </p>

        <h1
          className="rise mt-5 max-w-[16ch] text-balance font-display"
          style={{
            fontSize: "clamp(2.6rem, 1.8rem + 4.6vw, 5.5rem)",
            fontWeight: 600,
            lineHeight: 0.96,
            letterSpacing: "-0.045em",
            color: "var(--ink)",
            animationDelay: "80ms",
          }}
        >
          The plan your client can actually read.
        </h1>

        <p
          className="rise mt-6 max-w-[52ch] text-[17px]"
          style={{
            color: "var(--ink-soft)",
            lineHeight: 1.55,
            animationDelay: "160ms",
          }}
        >
          A public plan written in plain English, live the moment you publish,
          shared with one link. The people who need it just read it — no
          account, no app. Show your work, not your Jira.
        </p>

        <div
          className="rise mt-8 flex flex-wrap items-center gap-3"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(20,21,26,0.4)] transition-transform hover:-translate-y-px"
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
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-5 py-2.5 text-[14px] font-medium transition-colors hover:border-[var(--ink-quiet)]"
            style={{
              borderColor: "var(--border)",
              color: "var(--ink-soft)",
            }}
          >
            See a real one
          </Link>
        </div>

        {/* The real product. This exact view is what loads at /demo. */}
        <Link
          href="/demo"
          aria-label="Open the live wedding-plan demo"
          className="rise group mt-12 block overflow-hidden rounded-[14px] border md:mt-16"
          style={{
            borderColor: "var(--border)",
            background: "var(--bg-elev)",
            boxShadow: "var(--shadow-2, 0 24px 60px -28px rgba(20,21,26,0.28))",
            animationDelay: "360ms",
          }}
        >
          {/* Browser-chrome strip — frames the screenshot as a live page */}
          <div
            className="flex items-center gap-2 border-b px-4 py-2.5"
            style={{ borderColor: "var(--border)", background: "var(--bg)" }}
          >
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--border)" }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--border)" }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--border)" }} />
            </span>
            <span
              className="ml-2 truncate font-mono text-[11px]"
              style={{ color: "var(--ink-quiet)" }}
            >
              roadmap.signalstudio.ie/the-wedding
            </span>
            <span
              className="ml-auto hidden items-center gap-1.5 text-[11px] font-medium sm:inline-flex"
              style={{ color: "var(--brand)" }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--status-shipped)" }}
              />
              Live
            </span>
          </div>
          <Image
            src="/proof-workspace.png"
            alt="A live wedding plan on Signal Roadmap — milestones from save-the-dates to the wedding day, each showing how close it is."
            width={1440}
            height={665}
            priority
            className="h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.012]"
          />
        </Link>
      </div>
    </section>
  );
}
