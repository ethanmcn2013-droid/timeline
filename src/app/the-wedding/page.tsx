import type { Metadata } from "next";
import { Wordmark } from "@/components/brand/wordmark";
import { SiteFooter } from "@/components/marketing/site-footer";

/**
 * /the-wedding — the canonical public wedding-plan example.
 *
 * This is the single artifact the whole venue motion points at
 * (BUSINESS_PARTNER_REVIEW §5 item 2; the Superhuman-3 seed shape).
 * It is what a couple sees when a premium venue forwards them their
 * plan: no account, no login, plain English, the venue's name in one
 * quiet line.
 *
 * It is deliberately NOT routed through the generic [workspaceSlug]
 * viewer. That surface is built for a software roadmap shown to
 * stakeholders — stat bands, blocker cards, a progress dial, T-N
 * countdowns, a refusals rail, a shortcuts hint. Correct there;
 * wrong for a couple. A static segment file takes route precedence
 * over [workspaceSlug] for this one path, so this renders instead.
 *
 * Content is verbatim-faithful to
 * studio/docs/strategy/VENUE_EXAMPLE_ROADMAP.md — panel-approved and
 * signal-brand-voice passed. The four states are the only ones; only
 * "Waiting on you" asks for action, and never more than two at once.
 * The venue is named once at the top and once at the foot, quietly —
 * an eyebrow, never a logo. No DB, no rate limiter, no per-item
 * drill-down: it is a document you forward, not an app you operate.
 */

export const metadata: Metadata = {
  title: "Your wedding plan — kept by Glenmara House",
  description:
    "Everything that matters, in one place. The plan a venue keeps for you, in plain English. No account, no login.",
  openGraph: {
    title: "Your wedding plan — kept by Glenmara House",
    description:
      "Everything that matters, in one place. The plan a venue keeps for you, in plain English.",
    type: "website",
  },
};

type State = "Done" | "Underway" | "Waiting on you" | "Coming up";

type Item = {
  title: string;
  state: State;
  body: string;
};

type Section = {
  label: string;
  caption: string;
  items: Item[];
};

const VENUE = "Glenmara House";

const SECTIONS: Section[] = [
  {
    label: "Now",
    caption: "What is moving this week.",
    items: [
      {
        title: "Final numbers",
        state: "Waiting on you",
        body: `${VENUE} needs your final guest count by 1 June to lock catering. You're at 118 of an expected ~130. One short list to close.`,
      },
      {
        title: "Menu tasting",
        state: "Underway",
        body: `Booked for 24 May, 11am, at the house. Bring anyone helping you decide. ${VENUE} confirms the tasting menu the same day.`,
      },
      {
        title: "Arrival and access times",
        state: "Done",
        body: "Settled. You and the wedding party have the house from 2pm the day before. Suppliers from 8am on the day. This is the question that used to take five emails — it is answered here now.",
      },
    ],
  },
  {
    label: "Soon",
    caption: "Coming up, with nothing for you to do yet.",
    items: [
      {
        title: "Music and sound",
        state: "Waiting on you",
        body: `${VENUE}'s only ask is a final song list and the band's arrival time, two weeks out. Nothing needed yet — this is here so you know it's coming, not so you act today.`,
      },
      {
        title: "Florist walkthrough",
        state: "Coming up",
        body: `${VENUE} will host your florist for a walkthrough of the room. Date set once the tasting is done. No action from you until then.`,
      },
      {
        title: "Transport and timings",
        state: "Coming up",
        body: "The arrival and ceremony timings get firmed up after final numbers. We'll draft it; you confirm it reads right.",
      },
    ],
  },
  {
    label: "Later",
    caption: "The last things, written down so no one has to ask.",
    items: [
      {
        title: "The week-of plan",
        state: "Coming up",
        body: `A single page everyone can read: who arrives when, where setup happens, who ${VENUE}'s coordinator is, what happens if it rains. We write it. You forward it. No one asks you the same question twice.`,
      },
      {
        title: "Final walkthrough",
        state: "Coming up",
        body: `Two weeks before, you and ${VENUE}'s coordinator walk the whole day start to finish. Anything unclear gets cleared then. That is the last thing you have to do.`,
      },
    ],
  },
];

function StateChip({ state }: { state: State }) {
  // Only "Waiting on you" carries presence — it is the one state that
  // asks for action. The rest stay quiet on purpose. Restraint is the
  // product: if a plan seems to need a fifth state, the answer is
  // plainer language, not more colour.
  if (state === "Waiting on you") {
    return (
      <span
        className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium"
        style={{
          color: "var(--aud-wedding)",
          background: "color-mix(in srgb, var(--aud-wedding) 9%, var(--bg))",
        }}
      >
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--aud-wedding)" }}
        />
        Waiting on you
      </span>
    );
  }

  if (state === "Done") {
    return (
      <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-[11.5px] text-ink-faint">
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="flex-shrink-0"
        >
          <path
            d="M2.5 6.2 5 8.5l4.5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Done
      </span>
    );
  }

  if (state === "Underway") {
    return (
      <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-[11.5px] text-ink-soft">
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--ink-soft)" }}
        />
        Underway
      </span>
    );
  }

  return (
    <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-[11.5px] text-ink-faint">
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full border border-ink-faint/60"
      />
      Coming up
    </span>
  );
}

export default function TheWeddingExamplePage() {
  let rise = 0;
  const nextDelay = () => `${(rise++ * 70).toString()}ms`;

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      {/* Quiet header — identity, not chrome. No app affordances:
          this is a document to read and forward, not a tool. */}
      <header className="border-b border-line-soft/70">
        <div className="mx-auto flex h-14 w-full max-w-[760px] items-center justify-between px-6">
          <span className="text-[12.5px] text-ink-quiet">
            A plan kept by{" "}
            <span className="font-medium text-ink-soft">{VENUE}</span>
          </span>
          <Wordmark size="sm" href="/" />
        </div>
      </header>

      <main className="flex-1">
        <article className="mx-auto w-full max-w-[760px] px-6 pb-8 pt-16 md:pt-20">
          {/* Eyebrow — the venue named once, quietly. A single
              hairline of the wedding accent is the only colour the
              page spends here. */}
          <div
            className="reveal flex items-center gap-3"
            style={{ animationDelay: nextDelay() }}
          >
            <span
              aria-hidden
              className="inline-block h-3.5 w-px"
              style={{ background: "var(--aud-wedding)" }}
            />
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-quiet">
              Planning with{" "}
              <span className="text-ink-soft">{VENUE}</span>
              <span className="mx-2 text-ink-faint" aria-hidden>
                ·
              </span>
              since March
            </p>
          </div>

          <h1
            className="reveal mt-6 text-[clamp(2.1rem,1.5rem+2.6vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-ink"
            style={{ animationDelay: nextDelay() }}
          >
            Your wedding plan.
          </h1>

          <p
            className="reveal mt-5 max-w-[54ch] text-[17px] leading-[1.65] text-ink-soft"
            style={{ animationDelay: nextDelay() }}
          >
            Everything that matters, in one place. Forward this to anyone
            who needs to see where things stand — they will not need an
            account or a login.
          </p>

          <p
            className="reveal mt-4 text-[12.5px] text-ink-quiet"
            style={{ animationDelay: nextDelay() }}
          >
            Last updated by{" "}
            <span className="text-ink-soft">{VENUE}</span> — 14 May
          </p>

          {/* Sections — Now / Soon / Later */}
          <div className="mt-14 space-y-14">
            {SECTIONS.map((section) => (
              <section key={section.label}>
                <div
                  className="reveal flex items-baseline gap-3 border-t border-line-soft/70 pt-5"
                  style={{ animationDelay: nextDelay() }}
                >
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
                    {section.label}
                  </h2>
                  <span className="text-[11.5px] text-ink-faint">
                    {section.caption}
                  </span>
                </div>

                <ul className="mt-6 space-y-px">
                  {section.items.map((item, i) => (
                    <li
                      key={item.title}
                      className="reveal py-5"
                      style={{ animationDelay: nextDelay() }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-[16.5px] font-medium leading-snug text-ink">
                          {item.title}
                        </h3>
                        <StateChip state={item.state} />
                      </div>
                      <p className="mt-2 max-w-[58ch] text-[15px] leading-[1.6] text-ink-soft">
                        {item.body}
                      </p>
                      {i < section.items.length - 1 ? (
                        <div className="mt-5 h-px w-full bg-line-soft/55" />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {/* Closing — the promise, restated calmly. No CTA: a
              couple is never sold to on their own plan. */}
          <p
            className="reveal mt-16 border-t border-line-soft/70 pt-8 text-[14px] leading-[1.65] text-ink-quiet"
            style={{ animationDelay: nextDelay() }}
          >
            This plan is kept by {VENUE}. It updates on its own — you do
            not need to check back, and you will not be asked to log in.
            If something needs you, it will say so, in plain words, here.
          </p>
        </article>
      </main>

      <SiteFooter />

      {/* One-shot entrance only. No perpetual motion — the page should
          feel as calm as it reads, and a still page is a forwardable
          one. Fully disabled under reduced-motion. */}
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(10px);
          animation: wedding-reveal 0.7s var(--spring-glide, cubic-bezier(.16,1,.3,1)) forwards;
        }
        @keyframes wedding-reveal {
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
