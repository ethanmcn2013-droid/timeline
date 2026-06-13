import Link from "next/link";
import { RoadmapDemo } from "@/components/showcase/roadmap-demo";
import { AddressBarChip } from "@/components/marketing/address-bar-chip";

/**
 * Roadmap homepage hero.
 * The visual is the real product loop: status movement, share action, and
 * list/timeline switching on the same public plan.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-8 md:pt-14">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-6">
        {/* Walkover row 2: public-by-default proof on first paint. The
            address-bar chip is the first readable element on the page —
            the URL IS the product. */}
        <AddressBarChip />

        <p
          className="rise mt-5 font-mono text-[11px] font-semibold uppercase"
          style={{
            color: "var(--ink-quiet)",
            letterSpacing: "0.14em",
            animationDelay: "40ms",
          }}
        >
          Signal Timeline &middot; Direction clarity
        </p>

        <h1
          className="rise mt-5 max-w-[16ch] text-balance font-display"
          style={{
            fontSize: "clamp(2rem, 1rem + 5.6vw, 5.5rem)",
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
          account, no app, no translation layer.
        </p>

        <p
          className="rise mt-7 inline-flex items-center gap-2 text-[12.5px]"
          style={{ color: "var(--ink-quiet)", animationDelay: "240ms" }}
        >
          <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Reading-room is live &middot; Publishing reopens soon
        </p>

        {/* Recipient path — quiet secondary route for the visitor who arrived
            from someone's shared plan. The hero copy above is written to the
            prospect considering publishing; this line catches the other
            audience the mandate names — the one who got a link and is asking
            "what is this?". /about is the recipient-oriented explainer.
            (REVIEW Gap 5, L2.) */}
        <p
          className="rise mt-3 text-[12.5px]"
          style={{ color: "var(--ink-quiet)", animationDelay: "300ms" }}
        >
          Were you sent this?{" "}
          <Link
            href="/about"
            className="underline underline-offset-2 transition-colors hover:text-ink"
          >
            What Signal Timeline is
          </Link>
          .
        </p>

        <div id="demo" className="rise mt-8 scroll-mt-24 md:mt-10" style={{ animationDelay: "320ms" }}>
          <RoadmapDemo domain="wedding" />
        </div>
      </div>
    </section>
  );
}
