"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { AudienceToggle } from "@/components/marketing/audience-toggle";
import { RoadmapDemo } from "@/components/showcase/roadmap-demo";
import { type DomainId } from "@/lib/domains";

/**
 * Roadmap homepage hero.
 * H1: "The plan your client can actually read." (operator-ratified phase 1).
 * "Show your work, not your Jira." relocated here as supporting body copy —
 * it belongs in the register of "what this isn't", not as the primary claim.
 */
export function Hero() {
  const [domain, setDomain] = useState<DomainId>("wedding");

  return (
    <section className="relative isolate overflow-hidden pt-8 md:pt-14">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-6">
        <Eyebrow />

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
          className="rise mt-6 max-w-[54ch] text-[17px]"
          style={{
            color: "var(--ink-soft)",
            lineHeight: 1.55,
            animationDelay: "160ms",
          }}
        >
          A public roadmap written in plain English, live the moment you publish,
          easy to share with one link. Show your work, not your Jira.
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
            href="#how-it-works"
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-5 py-2.5 text-[14px] font-medium transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--ink-soft)",
            }}
          >
            See how it works
          </Link>
        </div>

        <p
          className="rise mt-3 inline-flex items-center gap-2 text-[12.5px]"
          style={{
            color: "var(--ink-faint, var(--ink-quiet))",
            animationDelay: "320ms",
          }}
        >
          <span
            className="block h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ background: "var(--status-shipped)" }}
          />
          Demo is live · choose an audience to reseed
        </p>

        {/* Audience toggle — proves the format fits whatever you&apos;re publishing.
            id="demo" anchors deep-links from the suite landing page. */}
        <div
          id="demo"
          className="rise mt-8 scroll-mt-20 md:mt-10"
          style={{ animationDelay: "400ms" }}
        >
          <AudienceToggle domain={domain} onChange={setDomain} />
        </div>

        {/* Demo — full width, keyed by domain so swap = clean reset */}
        <div className="rise mt-6 md:mt-8" style={{ animationDelay: "480ms" }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={domain}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto w-full"
            >
              <RoadmapDemo domain={domain} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Eyebrow() {
  return (
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
  );
}
