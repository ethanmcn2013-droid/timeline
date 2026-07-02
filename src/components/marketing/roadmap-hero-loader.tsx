"use client";

/**
 * Timeline hero loader — "the line extends."
 *
 * Dot rolls in assembling "timeline." then every 20s pulses: it fires
 * concentric rings and lays a thin timeline track with a milestone node
 * at its end — the Timeline gesture, on a clean white field. (The earlier
 * MapLibre Limerick-map background was removed 2026-06-22, review issue 05:
 * a heavy raster background is off the white-lock register.)
 *
 * SAFETY CONTRACT:
 *   · Fully scoped — every class and @keyframes prefixed `rml-`.
 *   · In-flow only — no position:fixed, no inset:0 globally.
 *   · rAF loop runs only during the intro roll then cancels.
 *   · prefers-reduced-motion → assembled state, no animation.
 */

import { useEffect, useRef } from "react";

export function RoadmapHeroLoader() {
  const stageRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage  = stageRef.current;
    if (!stage) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Anchor the pulse rings + track gesture to the dot's resting place ──
    const composerEl = stage.querySelector<HTMLElement>(".rml-composer");
    const dotEl      = stage.querySelector<HTMLElement>(".rml-dot");
    const sectionEl  = stage.closest(".rml-hero-section") as HTMLElement | null;

    const anchorPulse = () => {
      if (!composerEl || !dotEl || !sectionEl) return;
      const cr = composerEl.getBoundingClientRect();
      const sr = sectionEl.getBoundingClientRect();
      const absX = cr.left + dotEl.offsetLeft + dotEl.offsetWidth  / 2 - sr.left;
      const absY = cr.top  + dotEl.offsetTop  + dotEl.offsetHeight / 2 - sr.top;
      sectionEl.style.setProperty("--rml-origin-x", (absX / sr.width  * 100).toFixed(2) + "%");
      sectionEl.style.setProperty("--rml-origin-y", (absY / sr.height * 100).toFixed(2) + "%");
    };

    // ── Reduced motion: show assembled state immediately ─────────────────────
    if (reduced) {
      stage.querySelectorAll<HTMLElement>(".rml-letter").forEach((el) => {
        el.style.opacity   = "1";
        el.style.transform = "translateY(0)";
      });
      anchorPulse();
      return;
    }

    // ── Letter rise during intro ─────────────────────────────────────────────
    const letterEls  = [...stage.querySelectorAll<HTMLElement>(".rml-letter")];
    const INTRO_MS   = 2600;
    const RISE_MS    = 280;
    const RISE_LEAD  = 80;

    const start   = performance.now();
    let risenAt: Array<number | null> = new Array(letterEls.length).fill(null);
    let centers: number[] = [];
    let raf = 0;

    const measure = () => {
      if (!composerEl) return;
      const cl = composerEl.getBoundingClientRect().left;
      centers = letterEls.map((el) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2 - cl;
      });
      anchorPulse();
    };

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const frame = () => {
      const elapsed = performance.now() - start;
      if (elapsed > INTRO_MS + 200) return;

      if (!composerEl || !dotEl) return;
      const cl     = composerEl.getBoundingClientRect().left;
      const dr     = dotEl.getBoundingClientRect();
      const dotX   = dr.left + dr.width  / 2 - cl;
      const dotOpa = parseFloat(getComputedStyle(dotEl).opacity);

      letterEls.forEach((el, i) => {
        const lx = centers[i];
        if (lx === undefined) return;
        if (risenAt[i] === null && dotOpa > 0.2 && lx - dotX < RISE_LEAD) {
          risenAt[i] = elapsed;
        }
        if (risenAt[i] === null) {
          el.style.opacity   = "0";
          el.style.transform = "translateY(115%)";
          return;
        }
        let p = Math.min(1, Math.max(0, (elapsed - risenAt[i]!) / RISE_MS));
        p = easeOutCubic(p);
        el.style.opacity   = p.toString();
        el.style.transform = `translateY(${(1 - p) * 115}%)`;
      });

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(() => { measure(); raf = requestAnimationFrame(frame); });
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section className="rml-hero-section" aria-label="Signal Timeline">

      {/* Pulse rings */}
      <span className="rml-pulse-ring rml-pulse-soft" aria-hidden />
      <span className="rml-pulse-ring" aria-hidden />

      {/* Corner chrome */}
      <div className="rml-chrome rml-chrome-tl">
        <span className="rml-wm">
          signal studio<span className="rml-dot-static" />
          <span className="rml-sep">/</span>timeline
        </span>
      </div>
      <div className="rml-chrome rml-chrome-tr">
        <span className="rml-pip" aria-hidden />
        the line extends
      </div>

      {/* Stage — wordmark + animated dot */}
      <div className="rml-stage" ref={stageRef} aria-hidden>
        <div className="rml-composer">
          <span className="rml-word">
            {"timeline".split("").map((ch, i) => (
              <span key={i} className="rml-letter">{ch}</span>
            ))}
          </span>
          <span className="rml-trail rml-t1" />
          <span className="rml-trail rml-t2" />
          <span className="rml-trail rml-t3" />
          <span className="rml-ripple-slow" />
          <span className="rml-ripple" />
          <span className="rml-dot" />
        </div>
      </div>

      {/* Caption */}
      <p className="rml-caption">the long view</p>

      <style>{CSS}</style>
    </section>
  );
}

// ─── Scoped CSS ───────────────────────────────────────────────────────────────
const CSS = `
.rml-hero-section {
  position: relative;
  overflow: hidden;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: clamp(520px, 62svh, 720px);
  padding: clamp(72px,10svh,112px) 24px clamp(44px,7svh,72px);
  border-bottom: 1px solid var(--rml-hairline);
  --rml-origin-x: 56%;
  --rml-origin-y: 50%;
  --rml-ink: #111111;
  --rml-stone-400: #b8b2a3;
  --rml-stone-500: #8c887e;
  --rml-indigo: #4f46e5;
  --rml-indigo-300: #a5b4fc;
  --rml-hairline: rgba(17,17,17,0.06);
  --rml-wm-size: clamp(56px, 10.8vw, 148px);
  --rml-roll: calc(var(--rml-wm-size) * 8);
  --rml-intro: 2.6s;
  --rml-pulse-cycle: 20s;
  --rml-pulse-delay: calc(var(--rml-intro) + 1.8s);
  --rml-font: var(--font-geist-sans, 'Geist', system-ui, sans-serif);
  --rml-mono: var(--font-geist-mono, 'Geist Mono', ui-monospace, monospace);
}

/* ─── Pulse rings ──────────────────────────────────────────── */
.rml-pulse-ring {
  position: absolute;
  left: var(--rml-origin-x); top: var(--rml-origin-y);
  width: 28px; height: 28px;
  margin-left: -14px; margin-top: -14px;
  border-radius: 50%;
  border: 1px solid var(--rml-indigo);
  transform: scale(0.4); opacity: 0;
  z-index: 3; pointer-events: none;
  animation: rml-pulse-ring var(--rml-pulse-cycle) cubic-bezier(.22,.7,.2,1) var(--rml-pulse-delay) infinite;
}
.rml-pulse-soft {
  border-color: var(--rml-indigo-300);
  animation-name: rml-pulse-ring-soft;
}
/* Fires at 0.5% — AFTER dot squish at 0% (physics: cause precedes effect) */
@keyframes rml-pulse-ring {
  0%   { transform: scale(0.4); opacity: 0;    }
  0.5% { transform: scale(0.6); opacity: 0.35; }
  16%  { transform: scale(10);  opacity: 0;    }
  100% { transform: scale(10);  opacity: 0;    }
}
@keyframes rml-pulse-ring-soft {
  0%   { transform: scale(0.4); opacity: 0;    }
  0.5% { transform: scale(0.6); opacity: 0.22; }
  22%  { transform: scale(18);  opacity: 0;    }
  100% { transform: scale(18);  opacity: 0;    }
}

/* ─── Chrome ───────────────────────────────────────────────── */
.rml-chrome {
  position: absolute;
  font-family: var(--rml-mono);
  font-size: 11px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--rml-stone-500);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  z-index: 5;
}
.rml-chrome-tl { top: 28px; left: 32px; }
.rml-chrome-tr { top: 28px; right: 32px; }
.rml-wm {
  display: inline-flex;
  align-items: baseline;
  font-family: var(--rml-font);
  font-weight: 500;
  font-size: 14px;
  letter-spacing: -.025em;
  line-height: .95;
  color: var(--rml-ink);
  text-transform: none;
}
.rml-dot-static {
  width: .16em; height: .16em;
  border-radius: 50%;
  background: var(--rml-indigo);
  margin-left: .06em;
  align-self: flex-end;
  margin-bottom: .06em;
}
.rml-sep { color: var(--rml-stone-500); margin: 0 .4em; font-weight: 300; }
.rml-pip {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--rml-indigo);
  display: inline-block;
  animation: rml-pip-blink 5s cubic-bezier(.45,.05,.55,.95) infinite;
}
@keyframes rml-pip-blink { 0%,100%{opacity:1} 50%{opacity:0.35} }

/* ─── Stage ────────────────────────────────────────────────── */
.rml-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  z-index: 4;
  transform: translateY(-8px);
}
.rml-composer {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  font-family: var(--rml-font);
  font-weight: 500;
  font-size: var(--rml-wm-size);
  line-height: .95;
  letter-spacing: -.03em;
  color: var(--rml-ink);
  padding-bottom: calc(var(--rml-wm-size) * .25);
}
.rml-composer::before {
  content: '';
  position: absolute;
  left:  calc(-1 * var(--rml-wm-size) * 3.2);
  right: calc(-1 * var(--rml-wm-size) * 1.2);
  bottom: calc(var(--rml-wm-size) * .15);
  height: 1px;
  background: var(--rml-hairline);
}
.rml-word { display: inline-flex; gap: 0; position: relative; z-index: 1; }
.rml-letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(115%);
  color: var(--rml-ink);
  will-change: opacity, transform;
}

/* ─── The dot ──────────────────────────────────────────────── */
/* Physics law: dot squishes at 0% of pulse cycle (impact fires FIRST),
   then ring + map fire at 0.5%. Cause precedes effect. */
.rml-dot {
  position: relative;
  width: .16em; height: .16em;
  border-radius: 50%;
  background: var(--rml-indigo);
  margin-left: .06em;
  align-self: flex-end;
  margin-bottom: .06em;
  transform-origin: center bottom;
  z-index: 4;
  animation:
    rml-roll  var(--rml-intro)       cubic-bezier(.34,1.56,.64,1) 0s                    1        forwards,
    rml-pulse var(--rml-pulse-cycle) cubic-bezier(.45,.05,.55,.95) var(--rml-pulse-delay) infinite;
}
@keyframes rml-roll {
  0%   { transform: translate(calc(-1    * var(--rml-roll)), 0) scale(1,1);       opacity: 0; }
  8%   { transform: translate(calc(-1    * var(--rml-roll)), 0) scale(1,1);       opacity: 1; }
  63%  { transform: translate(calc(-.03  * var(--rml-wm-size)), 0) scale(1,1);    opacity: 1; }
  67%  { transform: translate(0, 0) scale(1,1);                                   opacity: 1; }
  73%  { transform: translate(0, 0) scale(1.55, .55);                             opacity: 1; }
  78%  { transform: translate(0, 0) scale(1.96, .4);                              opacity: 1; }
  82%  { transform: translate(0, 0) scale(1.88, .43);                             opacity: 1; }
  88%  { transform: translate(0, calc(-.075 * var(--rml-wm-size))) scale(.74, 1.34); opacity: 1; }
  93%  { transform: translate(0, 0) scale(1.24, .82);                             opacity: 1; }
  96%  { transform: translate(0, 0) scale(.96, 1.05);                             opacity: 1; }
  100% { transform: translate(0, 0) scale(1, 1);                                  opacity: 1; }
}
@keyframes rml-pulse {
  0%   { transform: scale(1.4, 0.62);  opacity: 1; }  /* impact — fires FIRST */
  2.5% { transform: scale(.9,  1.12);  opacity: 1; }  /* rebound */
  4%   { transform: scale(1.04, .96);  opacity: 1; }  /* settle */
  8%   { transform: scale(1, 1);       opacity: 1; }  /* rest */
  100% { transform: scale(1, 1);       opacity: 1; }
}

/* ─── Timeline track — the dot lays a line, drops a milestone ───────
   The fitting Signal Timeline gesture: "the line extends." Once the dot
   has rolled in, each pulse cycle it extrudes a thin track to the right
   and drops a milestone node at its end — a timeline being laid, in step
   with the map opening from the same origin. The whole gesture lives in
   the dot's REST window (>8%, after the impact squish settles) so the
   dot's scale never distorts the line. --rml-track is the line length.
   Pseudo-element em = composer size, so it scales with the wordmark. */
.rml-dot { --rml-track: 0.92em; }
.rml-dot::before,
.rml-dot::after { content: ''; position: absolute; pointer-events: none; z-index: 4; }
.rml-dot::before {
  left: 100%; top: 50%;
  height: 1px; width: 0;
  background: var(--rml-indigo);
  transform: translateY(-50%);
  opacity: 0;
  animation: rml-track var(--rml-pulse-cycle) cubic-bezier(.22,.7,.2,1) var(--rml-pulse-delay) infinite;
}
.rml-dot::after {
  left: calc(100% + var(--rml-track));
  top: 50%;
  width: .16em; height: .16em;
  border-radius: 50%;
  background: var(--rml-indigo);
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  animation: rml-milestone var(--rml-pulse-cycle) cubic-bezier(.34,1.56,.64,1) var(--rml-pulse-delay) infinite;
}
@keyframes rml-track {
  0%, 8%   { width: 0;             opacity: 0; }
  10%      { width: 0;             opacity: 1; }
  22%      { width: var(--rml-track); opacity: 1; }
  33%      { width: var(--rml-track); opacity: 1; }
  39%      { width: var(--rml-track); opacity: 0; }
  40%,100% { width: 0;             opacity: 0; }
}
@keyframes rml-milestone {
  0%, 17%  { transform: translate(-50%,-50%) scale(0); opacity: 0; }
  25%      { transform: translate(-50%,-50%) scale(1); opacity: 1; }
  33%      { transform: translate(-50%,-50%) scale(1); opacity: 1; }
  39%      { transform: translate(-50%,-50%) scale(0); opacity: 0; }
  40%,100% { transform: translate(-50%,-50%) scale(0); opacity: 0; }
}

/* ─── Intro trails ─────────────────────────────────────────── */
.rml-trail {
  position: absolute;
  width: .16em; height: .16em;
  border-radius: 50%;
  background: var(--rml-indigo);
  align-self: flex-end;
  margin-bottom: .06em;
  margin-left: .06em;
  opacity: 0;
  z-index: 2;
}
.rml-t1 { animation: rml-ghost1 var(--rml-intro) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards; }
.rml-t2 { animation: rml-ghost2 var(--rml-intro) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards; }
.rml-t3 { animation: rml-ghost3 var(--rml-intro) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards; }
@keyframes rml-ghost1 {
  0%,10%   { transform: translate(calc(-1    * var(--rml-roll)), 0); opacity: 0;    }
  27%      { transform: translate(calc(-.85  * var(--rml-roll)), 0); opacity: 0.5;  }
  50%      { transform: translate(calc(-.2   * var(--rml-roll)), 0); opacity: 0.26; }
  63%,100% { transform: translate(calc(-.1   * var(--rml-roll)), 0); opacity: 0;    }
}
@keyframes rml-ghost2 {
  0%,13%   { transform: translate(calc(-1    * var(--rml-roll)), 0); opacity: 0;    }
  30%      { transform: translate(calc(-.78  * var(--rml-roll)), 0); opacity: 0.36; }
  50%      { transform: translate(calc(-.28  * var(--rml-roll)), 0); opacity: 0.18; }
  63%,100% { transform: translate(calc(-.16  * var(--rml-roll)), 0); opacity: 0;    }
}
@keyframes rml-ghost3 {
  0%,17%   { transform: translate(calc(-1    * var(--rml-roll)), 0); opacity: 0;    }
  34%      { transform: translate(calc(-.7   * var(--rml-roll)), 0); opacity: 0.24; }
  50%      { transform: translate(calc(-.35  * var(--rml-roll)), 0); opacity: 0.11; }
  63%,100% { transform: translate(calc(-.24  * var(--rml-roll)), 0); opacity: 0;    }
}

/* ─── Impact ripples ───────────────────────────────────────── */
.rml-ripple, .rml-ripple-slow {
  position: absolute;
  width: .16em; height: .16em;
  border-radius: 50%;
  background: transparent;
  align-self: flex-end;
  margin-bottom: .06em;
  margin-left: .06em;
  opacity: 0;
  transform: scale(1);
  z-index: 1;
}
.rml-ripple      { border: 1px solid var(--rml-indigo);     animation: rml-rip-fast var(--rml-intro) cubic-bezier(.22,.7,.2,1) 0s 1 forwards; }
.rml-ripple-slow { border: 1px solid var(--rml-indigo-300); animation: rml-rip-slow var(--rml-intro) cubic-bezier(.22,.7,.2,1) 0s 1 forwards; }
@keyframes rml-rip-fast { 0%,75%{transform:scale(1);opacity:0} 78%{transform:scale(1);opacity:.55} 100%{transform:scale(8);opacity:0} }
@keyframes rml-rip-slow { 0%,75%{transform:scale(1);opacity:0} 78%{transform:scale(1);opacity:.35} 100%{transform:scale(16);opacity:0} }

/* ─── Caption ──────────────────────────────────────────────── */
.rml-caption {
  font-family: var(--rml-mono);
  font-size: 11px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--rml-stone-500);
  z-index: 5;
  opacity: 0;
  margin-top: 36px;
  animation: rml-caption-in .7s cubic-bezier(.22,.7,.2,1) calc(var(--rml-intro) - 0.1s) 1 forwards;
}
@keyframes rml-caption-in {
  0%   { opacity: 0; transform: translateY(4px); }
  100% { opacity: 1; transform: translateY(0);   }
}

/* ─── Reduced motion ───────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .rml-dot, .rml-trail, .rml-ripple, .rml-ripple-slow,
  .rml-caption, .rml-pip, .rml-pulse-ring,
  .rml-dot::before, .rml-dot::after { animation: none !important; }
  .rml-dot   { opacity: 1; transform: none; }
  .rml-dot::before, .rml-dot::after { display: none; }
  .rml-trail, .rml-ripple, .rml-ripple-slow, .rml-pulse-ring { display: none; }
  .rml-caption { opacity: 1; }
  .rml-letter  { opacity: 1; transform: none; }
}

/* ─── Responsive chrome ────────────────────────────────────── */
@media (max-width: 600px) {
  .rml-chrome-tl { top: 18px; left: 20px; }
  .rml-chrome-tr { top: 18px; right: 20px; font-size: 10px; }
  .rml-hero-section {
    min-height: 58svh;
    padding: 58px 20px 44px;
    --rml-wm-size: clamp(52px, 15vw, 82px);
  }
  .rml-stage { transform: translateY(-4px); }
  .rml-caption { margin-top: 30px; }
}
@media (max-width: 420px) { .rml-chrome-tr { display: none; } }
`;
