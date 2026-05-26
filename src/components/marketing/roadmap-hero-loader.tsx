"use client";

/**
 * Roadmap hero loader — "the map unfolds."
 *
 * The dot rolls in assembling "roadmap." as it passes each letter. It lands
 * and settles. Then every 6.5s it pulses — a gentle heartbeat that brings
 * up a faint Limerick road-network map behind the wordmark before it fades
 * away again. The line extends.
 *
 * The road network is Limerick city at 1:1 — hand-designed highways,
 * arterials, roundabouts, and bridges; procedurally generated residential
 * streets. The origin pin anchors to the wordmark's period.
 *
 * SAFETY CONTRACT:
 *   · Fully scoped — every class and @keyframes prefixed `rml-`.
 *   · In-flow only — no position:fixed, no inset:0, no high z-index.
 *   · rAF loop runs only during the intro roll then cancels.
 *   · prefers-reduced-motion → assembled state, map shown statically.
 */

import { useEffect, useRef } from "react";

export function RoadmapHeroLoader() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Procedural street generation (deterministic) ────────────────
    function mulberry32(seed: number) {
      return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = seed;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const rand = mulberry32(7);

    const clusters = [
      { cx: 880,  cy: 360,  w: 360, h: 220, bw: 50, bh: 36, density: 0.62, rot: 0.06 },
      { cx: 1230, cy: 360,  w: 200, h: 180, bw: 40, bh: 32, density: 0.65, rot: -0.18 },
      { cx: 480,  cy: 410,  w: 280, h: 200, bw: 56, bh: 42, density: 0.42, rot: 0.10 },
      { cx: 1380, cy: 510,  w: 90,  h: 130, bw: 25, bh: 28, density: 0.55, rot: -0.12 },
      { cx: 1800, cy: 580,  w: 380, h: 280, bw: 52, bh: 40, density: 0.55, rot: 0.04 },
      { cx: 1480, cy: 870,  w: 280, h: 200, bw: 44, bh: 36, density: 0.62, rot: -0.05 },
      { cx: 1670, cy: 920,  w: 300, h: 200, bw: 50, bh: 40, density: 0.55, rot: -0.08 },
      { cx: 1080, cy: 940,  w: 240, h: 160, bw: 42, bh: 35, density: 0.65, rot: 0.04 },
      { cx: 900,  cy: 1080, w: 380, h: 200, bw: 52, bh: 40, density: 0.6,  rot: -0.04 },
      { cx: 580,  cy: 1100, w: 280, h: 170, bw: 60, bh: 46, density: 0.38, rot: 0.0 },
      { cx: 1150, cy: 1110, w: 260, h: 150, bw: 48, bh: 38, density: 0.55, rot: 0.05 },
      { cx: 1900, cy: 460,  w: 240, h: 200, bw: 60, bh: 48, density: 0.40, rot: 0.0 },
      { cx: 1430, cy: 460,  w: 110, h: 100, bw: 28, bh: 24, density: 0.55, rot: -0.10 },
      { cx: 1570, cy: 340,  w: 240, h: 180, bw: 52, bh: 42, density: 0.45, rot: 0.0 },
    ];

    function generateStreets() {
      const out: string[] = [];
      clusters.forEach((c) => {
        const cos = Math.cos(c.rot), sin = Math.sin(c.rot);
        for (let dy = -c.h / 2; dy <= c.h / 2; dy += c.bh) {
          for (let dx = -c.w / 2; dx <= c.w / 2; dx += c.bw) {
            const distNorm = Math.sqrt((dx / (c.w / 2)) ** 2 + (dy / (c.h / 2)) ** 2);
            if (distNorm > 1.05) continue;
            const dens = c.density * (1 - distNorm * 0.45);
            if (rand() < dens) {
              const len = c.bw * (0.62 + rand() * 0.42);
              const sxL = dx + (rand() - 0.5) * 4, syL = dy + (rand() - 0.5) * 3;
              const exL = sxL + len, eyL = syL + (rand() - 0.5) * 7;
              const sx = sxL * cos - syL * sin, sy = sxL * sin + syL * cos;
              const ex = exL * cos - eyL * sin, ey = exL * sin + eyL * cos;
              out.push(`<line x1="${(c.cx+sx).toFixed(1)}" y1="${(c.cy+sy).toFixed(1)}" x2="${(c.cx+ex).toFixed(1)}" y2="${(c.cy+ey).toFixed(1)}"/>`);
            }
            if (rand() < dens * 0.88) {
              const len = c.bh * (0.62 + rand() * 0.42);
              const sxL = dx + (rand() - 0.5) * 3, syL = dy + (rand() - 0.5) * 4;
              const exL = sxL + (rand() - 0.5) * 6, eyL = syL + len;
              const sx = sxL * cos - syL * sin, sy = sxL * sin + syL * cos;
              const ex = exL * cos - eyL * sin, ey = exL * sin + eyL * cos;
              out.push(`<line x1="${(c.cx+sx).toFixed(1)}" y1="${(c.cy+sy).toFixed(1)}" x2="${(c.cx+ex).toFixed(1)}" y2="${(c.cy+ey).toFixed(1)}"/>`);
            }
            if (rand() < dens * 0.12) {
              const sxL = dx + (rand() - 0.5) * 4, syL = dy + (rand() - 0.5) * 4;
              const exL = sxL + c.bw * 0.45 * (rand() < 0.5 ? -1 : 1);
              const eyL = syL + c.bh * 0.45 * (rand() < 0.5 ? -1 : 1);
              const sx = sxL * cos - syL * sin, sy = sxL * sin + syL * cos;
              const ex = exL * cos - eyL * sin, ey = exL * sin + eyL * cos;
              out.push(`<line x1="${(c.cx+sx).toFixed(1)}" y1="${(c.cy+sy).toFixed(1)}" x2="${(c.cx+ex).toFixed(1)}" y2="${(c.cy+ey).toFixed(1)}"/>`);
            }
          }
        }
      });
      return out.join("");
    }

    const streetsEl = root.querySelector<HTMLElement>(".rml-streets-local");
    if (streetsEl) streetsEl.innerHTML = generateStreets();

    // ── Anchor the pulse ring to the dot's natural resting position ──
    const dotEl = root.querySelector<HTMLElement>(".rml-dot");
    const composerEl = root.querySelector<HTMLElement>(".rml-composer");
    const sectionEl = root.closest(".rml-hero-section") as HTMLElement | null;

    if (reduced || !dotEl || !composerEl || !sectionEl) {
      // Reduced motion: show letters immediately
      root.querySelectorAll<HTMLElement>(".rml-letter").forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
      return;
    }

    const anchorPulse = () => {
      const cr = composerEl.getBoundingClientRect();
      const sr = sectionEl.getBoundingClientRect();
      const absX = cr.left + dotEl.offsetLeft + dotEl.offsetWidth / 2 - sr.left;
      const absY = cr.top + dotEl.offsetTop + dotEl.offsetHeight / 2 - sr.top;
      sectionEl.style.setProperty("--rml-origin-x", (absX / sr.width * 100) + "%");
      sectionEl.style.setProperty("--rml-origin-y", (absY / sr.height * 100) + "%");
    };

    // ── Letter rise during intro ─────────────────────────────────────
    const letterEls = [...root.querySelectorAll<HTMLElement>(".rml-letter")];
    const INTRO_MS = 2600;
    const RISE_MS = 280;
    const RISE_LEAD = 80;

    const start = performance.now();
    let risenAt: Array<number | null> = new Array(letterEls.length).fill(null);
    let centers: number[] = [];
    let raf = 0;

    const measure = () => {
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

      const cl = composerEl.getBoundingClientRect().left;
      const dr = dotEl.getBoundingClientRect();
      const dotX = dr.left + dr.width / 2 - cl;
      const dotOpacity = parseFloat(getComputedStyle(dotEl).opacity);

      letterEls.forEach((el, i) => {
        const lx = centers[i];
        if (lx === undefined) return;
        if (risenAt[i] === null && dotOpacity > 0.2 && lx - dotX < RISE_LEAD) {
          risenAt[i] = elapsed;
        }
        if (risenAt[i] === null) {
          el.style.opacity = "0";
          el.style.transform = "translateY(115%)";
          return;
        }
        let p = Math.min(1, Math.max(0, (elapsed - risenAt[i]!) / RISE_MS));
        p = easeOutCubic(p);
        el.style.opacity = p.toString();
        el.style.transform = `translateY(${(1 - p) * 115}%)`;
      });

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(() => {
      measure();
      raf = requestAnimationFrame(frame);
    });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section className="rml-hero-section" aria-label="Signal Roadmap">
      {/* Limerick road network — animates in on each pulse */}
      <svg
        className="rml-map-bg"
        viewBox="0 0 2000 1200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* River Shannon */}
        <g style={{ stroke: "#4f46e5", fill: "none", strokeWidth: 32, opacity: 0.09, strokeLinecap: "round", strokeLinejoin: "round" }}>
          <path d="M 1820 -30 C 1740 100,1580 240,1460 360 C 1350 470,1290 540,1290 590 C 1290 640,1240 685,1150 705 C 1040 725,920 730,800 740 C 660 752,520 770,380 790 C 240 808,110 822,-30 830"/>
        </g>
        <g style={{ stroke: "#4f46e5", fill: "none", strokeWidth: 8, opacity: 0.08 }}>
          <path d="M 1410 410 Q 1430 460 1430 500 Q 1430 550 1395 575 L 1340 590"/>
        </g>
        <g style={{ stroke: "#4f46e5", fill: "none", strokeWidth: 22, opacity: 0.05 }}>
          <path d="M 850 770 Q 600 800 350 830 Q 150 855 -30 870"/>
        </g>

        {/* King's Island */}
        <g style={{ stroke: "#4f46e5", fill: "none", strokeWidth: 0.8, opacity: 0.32 }}>
          <line x1="1340" y1="450" x2="1410" y2="560"/>
          <line x1="1355" y1="475" x2="1395" y2="500"/>
          <line x1="1365" y1="495" x2="1402" y2="515"/>
          <line x1="1370" y1="525" x2="1408" y2="545"/>
          <line x1="1335" y1="485" x2="1378" y2="540"/>
          <line x1="1348" y1="515" x2="1390" y2="568"/>
        </g>

        {/* Bridges */}
        <g style={{ stroke: "#4f46e5", fill: "none", strokeWidth: 1.4, opacity: 0.30 }}>
          <line x1="1295" y1="442" x2="1342" y2="452"/>
          <line x1="1390" y1="570" x2="1430" y2="583"/>
          <line x1="1240" y1="600" x2="1290" y2="618"/>
          <line x1="1110" y1="700" x2="1160" y2="715"/>
          <line x1="1265" y1="572" x2="1305" y2="586"/>
        </g>

        {/* Motorways */}
        <g style={{ stroke: "#4f46e5", fill: "none", strokeWidth: 2.2, opacity: 0.36 }}>
          <path d="M 2030 920 Q 1820 970,1620 1010 Q 1380 1055,1180 1070 Q 950 1085,760 1075 Q 580 1065,420 1095"/>
          <path d="M 1080 1070 Q 1060 1140,1040 1220"/>
          <path d="M 760 1075 Q 620 1100,510 1180 L 470 1230"/>
          <path d="M 2030 880 Q 1880 900,1750 945"/>
        </g>

        {/* Arterials */}
        <g style={{ stroke: "#4f46e5", fill: "none", strokeWidth: 1.2, opacity: 0.28 }}>
          <path d="M 1270 615 Q 1100 580,920 540 Q 750 510,580 490 Q 380 470,180 460 L -30 455"/>
          <path d="M 1320 670 Q 1500 678,1700 700 Q 1850 716,2030 730"/>
          <path d="M 1310 760 L 1500 785 L 1700 810 L 2030 840"/>
          <path d="M 1200 720 Q 1010 740,820 765 Q 620 790,420 810 L 220 830 L -30 850"/>
          <path d="M 540 990 Q 780 1015,1020 1020 Q 1250 1025,1480 1010 Q 1660 998,1820 985"/>
          <path d="M 1240 630 L 1185 855 L 1140 1010 L 1090 1170"/>
          <path d="M 1140 1010 Q 1090 1100,1030 1220"/>
          <path d="M 1440 850 Q 1620 940,1800 1015 L 1960 1075"/>
          <path d="M 1320 590 Q 1410 560,1500 530"/>
          <path d="M 820 765 Q 700 880,600 1010 L 540 1100"/>
          <path d="M 1175 800 L 1280 825 L 1390 855"/>
          <path d="M 1100 440 Q 950 410,760 390 Q 580 370,380 360"/>
          <path d="M 1410 540 Q 1500 480,1610 430 Q 1750 380,1900 350"/>
          <path d="M 1700 700 Q 1820 620,1920 510 Q 1985 440,2030 380"/>
        </g>

        {/* Secondary streets */}
        <g style={{ stroke: "#4f46e5", fill: "none", strokeWidth: 0.9, opacity: 0.22 }}>
          <line x1="900" y1="410" x2="900" y2="540"/>
          <line x1="720" y1="395" x2="720" y2="510"/>
          <line x1="540" y1="380" x2="540" y2="495"/>
          <line x1="380" y1="360" x2="380" y2="480"/>
          <path d="M 950 360 Q 935 270,925 180"/>
          <line x1="1290" y1="460" x2="1200" y2="410"/>
          <line x1="1295" y1="445" x2="1230" y2="380"/>
          <line x1="1700" y1="700" x2="1700" y2="830"/>
          <line x1="1820" y1="720" x2="1840" y2="840"/>
          <line x1="1600" y1="690" x2="1620" y2="800"/>
          <line x1="950" y1="1010" x2="950" y2="1180"/>
          <line x1="830" y1="1015" x2="830" y2="1160"/>
          <line x1="1100" y1="1020" x2="1100" y2="1180"/>
          <line x1="700" y1="1005" x2="700" y2="1150"/>
          <path d="M 1080 880 L 1080 1020"/>
          <path d="M 1000 870 L 1000 1010"/>
          <path d="M 1175 880 L 1175 1010"/>
          <line x1="1400" y1="830" x2="1400" y2="990"/>
          <line x1="1500" y1="790" x2="1500" y2="970"/>
          <line x1="1600" y1="810" x2="1620" y2="980"/>
          <line x1="950" y1="880" x2="1290" y2="880"/>
          <line x1="950" y1="940" x2="1290" y2="940"/>
          <line x1="700" y1="1080" x2="1480" y2="1080"/>
          <path d="M 1100 580 Q 900 555,700 535"/>
          <path d="M 1100 550 Q 900 530,700 510"/>
          <path d="M 1500 760 L 1850 780"/>
          <line x1="1500" y1="650" x2="1850" y2="680"/>
        </g>

        {/* Newtown Pery Georgian grid */}
        <g transform="rotate(-25 1200 720)">
          <g style={{ stroke: "#4f46e5", fill: "none", strokeWidth: 1.2, opacity: 0.28 }}>
            <line x1="1200" y1="560" x2="1200" y2="880"/>
          </g>
          <g style={{ stroke: "#4f46e5", fill: "none", strokeWidth: 0.9, opacity: 0.22 }}>
            <line x1="1080" y1="590" x2="1080" y2="860"/>
            <line x1="1120" y1="580" x2="1120" y2="865"/>
            <line x1="1160" y1="570" x2="1160" y2="872"/>
            <line x1="1240" y1="570" x2="1240" y2="872"/>
            <line x1="1280" y1="580" x2="1280" y2="865"/>
            <line x1="1320" y1="590" x2="1320" y2="855"/>
            <line x1="1060" y1="600" x2="1340" y2="600"/>
            <line x1="1060" y1="650" x2="1340" y2="650"/>
            <line x1="1060" y1="700" x2="1340" y2="700"/>
            <line x1="1060" y1="750" x2="1340" y2="750"/>
            <line x1="1060" y1="800" x2="1340" y2="800"/>
            <line x1="1060" y1="850" x2="1340" y2="850"/>
          </g>
          <g style={{ stroke: "#4f46e5", fill: "none", strokeWidth: 0.55, opacity: 0.20 }}>
            <line x1="1100" y1="625" x2="1340" y2="625"/>
            <line x1="1100" y1="675" x2="1340" y2="675"/>
            <line x1="1100" y1="725" x2="1340" y2="725"/>
            <line x1="1100" y1="775" x2="1340" y2="775"/>
            <line x1="1100" y1="825" x2="1340" y2="825"/>
            <line x1="1280" y1="830" x2="1320" y2="830"/>
          </g>
        </g>

        {/* Procedural residential streets */}
        <g className="rml-streets-local" style={{ stroke: "#4f46e5", fill: "none", strokeWidth: 0.55, opacity: 0.20 }} />

        {/* Roundabouts */}
        <g style={{ stroke: "#4f46e5", fill: "none", strokeWidth: 1.2, opacity: 0.35 }}>
          <circle cx="1180" cy="855" r="16"/>
          <circle cx="1280" cy="615" r="10"/>
          <circle cx="1320" cy="460" r="9"/>
          <circle cx="1180" cy="1075" r="12"/>
          <circle cx="1490" cy="1005" r="12"/>
          <circle cx="1820" cy="985" r="13"/>
          <circle cx="700" cy="1010" r="11"/>
          <circle cx="540" cy="990" r="10"/>
          <circle cx="1500" cy="785" r="9"/>
          <circle cx="1700" cy="700" r="9"/>
          <circle cx="900" cy="540" r="8"/>
          <circle cx="1410" cy="540" r="7"/>
          <circle cx="1900" cy="720" r="8"/>
        </g>
      </svg>

      {/* Pulse rings */}
      <span className="rml-pulse-ring rml-pulse-soft" aria-hidden />
      <span className="rml-pulse-ring" aria-hidden />

      {/* Corner chrome */}
      <div className="rml-chrome rml-chrome-tl">
        <span className="rml-wm">
          signal studio<span className="rml-dot-static" />
          <span className="rml-sep">/</span>roadmap
        </span>
      </div>
      <div className="rml-chrome rml-chrome-tr">
        <span className="rml-pip" aria-hidden />
        the line extends
      </div>

      {/* Stage */}
      <div className="rml-stage" ref={rootRef} aria-hidden>
        <div className="rml-composer">
          <span className="rml-word">
            {"roadmap".split("").map((ch, i) => (
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
      <p className="rml-caption">the map unfolds</p>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.rml-hero-section{
  position:relative;overflow:hidden;background:var(--bg, #ffffff);
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  min-height:min(88vh,900px);
  padding:clamp(80px,12vh,160px) 24px clamp(64px,10vh,128px);
  --rml-origin-x:56%;
  --rml-origin-y:50%;
}
.rml-hero-section{
  --rml-ink:#111111;
  --rml-stone-400:#b8b2a3;
  --rml-stone-500:#8c887e;
  --rml-indigo:#4f46e5;
  --rml-indigo-300:#a5b4fc;
  --rml-hairline:rgba(17,17,17,0.06);
  --rml-wm-size:clamp(56px,12vw,168px);
  --rml-roll:calc(var(--rml-wm-size) * 8);
  --rml-intro:2.6s;
  --rml-pulse-cycle:6.5s;
  --rml-pulse-delay:calc(var(--rml-intro) + 0.7s);
  --rml-font:var(--font-geist-sans,'Geist',system-ui,sans-serif);
  --rml-mono:var(--font-geist-mono,'Geist Mono',ui-monospace,monospace);
}

/* ─── Road map background ──────────────────── */
.rml-map-bg{
  position:absolute;inset:0;pointer-events:none;z-index:0;
  opacity:0;
  animation:rml-map-loop var(--rml-pulse-cycle) cubic-bezier(.22,.7,.2,1) var(--rml-pulse-delay) infinite;
}
@keyframes rml-map-loop{
  0%  {opacity:0}
  8%  {opacity:.62}
  28% {opacity:.58}
  68% {opacity:.10}
  82% {opacity:0}
  100%{opacity:0}
}

/* ─── Pulse rings ──────────────────────────── */
.rml-pulse-ring{
  position:absolute;
  left:var(--rml-origin-x);top:var(--rml-origin-y);
  width:28px;height:28px;margin-left:-14px;margin-top:-14px;
  border-radius:50%;border:1px solid var(--rml-indigo);
  transform:scale(.4);opacity:0;z-index:1;pointer-events:none;
  animation:rml-pulse-ring var(--rml-pulse-cycle) cubic-bezier(.22,.7,.2,1) var(--rml-pulse-delay) infinite;
}
.rml-pulse-soft{
  border-color:var(--rml-indigo-300);
  animation-name:rml-pulse-ring-soft;
}
@keyframes rml-pulse-ring{
  0%  {transform:scale(.4);opacity:0}
  1%  {transform:scale(.6);opacity:.35}
  16% {transform:scale(10);opacity:0}
  100%{transform:scale(10);opacity:0}
}
@keyframes rml-pulse-ring-soft{
  0%  {transform:scale(.4);opacity:0}
  1%  {transform:scale(.6);opacity:.22}
  22% {transform:scale(18);opacity:0}
  100%{transform:scale(18);opacity:0}
}

/* ─── Chrome ───────────────────────────────── */
.rml-chrome{
  position:absolute;font-family:var(--rml-mono);font-size:11px;
  letter-spacing:.08em;text-transform:uppercase;color:var(--rml-stone-500);
  display:inline-flex;align-items:center;gap:10px;z-index:5;
}
.rml-chrome-tl{top:28px;left:32px}
.rml-chrome-tr{top:28px;right:32px}
.rml-wm{
  display:inline-flex;align-items:baseline;
  font-family:var(--rml-font);font-weight:500;
  font-size:14px;letter-spacing:-.025em;line-height:.95;
  color:var(--rml-ink);text-transform:none;
}
.rml-dot-static{
  width:.16em;height:.16em;border-radius:50%;
  background:var(--rml-indigo);margin-left:.06em;
  align-self:flex-end;margin-bottom:.06em;
}
.rml-sep{color:var(--rml-stone-500);margin:0 .4em;font-weight:300}
.rml-pip{
  width:6px;height:6px;border-radius:50%;
  background:var(--rml-indigo);display:inline-block;
  animation:rml-pip-blink 1.6s cubic-bezier(.45,.05,.55,.95) infinite;
}
@keyframes rml-pip-blink{0%,100%{opacity:1}50%{opacity:.35}}

/* ─── Stage ────────────────────────────────── */
.rml-stage{
  display:flex;align-items:center;justify-content:center;
  width:100%;z-index:2;
}
.rml-composer{
  position:relative;display:inline-flex;align-items:baseline;
  font-family:var(--rml-font);font-weight:500;
  font-size:var(--rml-wm-size);line-height:.95;
  letter-spacing:-.03em;color:var(--rml-ink);
  padding-bottom:calc(var(--rml-wm-size) * .25);
}
.rml-composer::before{
  content:'';position:absolute;
  left:calc(-1 * var(--rml-wm-size) * 3.2);
  right:calc(-1 * var(--rml-wm-size) * 1.2);
  bottom:calc(var(--rml-wm-size) * .15);
  height:1px;background:var(--rml-hairline);
}
.rml-word{display:inline-flex;gap:0;position:relative;z-index:1}
.rml-letter{
  display:inline-block;opacity:0;transform:translateY(115%);
  color:var(--rml-ink);will-change:opacity,transform;
}

/* ─── The dot ──────────────────────────────── */
.rml-dot{
  position:relative;width:.16em;height:.16em;border-radius:50%;
  background:var(--rml-indigo);margin-left:.06em;align-self:flex-end;
  margin-bottom:.06em;transform-origin:center bottom;z-index:4;
  animation:
    rml-roll  var(--rml-intro)        cubic-bezier(.34,1.56,.64,1) 0s                   1        forwards,
    rml-pulse var(--rml-pulse-cycle)  cubic-bezier(.45,.05,.55,.95) var(--rml-pulse-delay) infinite;
}
@keyframes rml-roll{
  0%  {transform:translate(calc(-1 * var(--rml-roll)),0) scale(1,1);opacity:0}
  8%  {transform:translate(calc(-1 * var(--rml-roll)),0) scale(1,1);opacity:1}
  63% {transform:translate(calc(-.03 * var(--rml-wm-size)),0) scale(1,1);opacity:1}
  67% {transform:translate(0,0) scale(1,1);opacity:1}
  73% {transform:translate(0,0) scale(1.55,.55);opacity:1}
  78% {transform:translate(0,0) scale(1.96,.4);opacity:1}
  82% {transform:translate(0,0) scale(1.88,.43);opacity:1}
  88% {transform:translate(0,calc(-.075 * var(--rml-wm-size))) scale(.74,1.34);opacity:1}
  93% {transform:translate(0,0) scale(1.24,.82);opacity:1}
  96% {transform:translate(0,0) scale(.96,1.05);opacity:1}
  100%{transform:translate(0,0) scale(1,1);opacity:1}
}
@keyframes rml-pulse{
  0%   {transform:scale(1,1);opacity:1}
  2%   {transform:scale(1.4,.62);opacity:1}
  5%   {transform:scale(.9,1.12);opacity:1}
  8%   {transform:scale(1.04,.96);opacity:1}
  12%  {transform:scale(1,1);opacity:1}
  100% {transform:scale(1,1);opacity:1}
}

/* ─── Trails ───────────────────────────────── */
.rml-trail{
  position:absolute;width:.16em;height:.16em;border-radius:50%;
  background:var(--rml-indigo);align-self:flex-end;margin-bottom:.06em;
  margin-left:.06em;opacity:0;z-index:2;
}
.rml-t1{animation:rml-ghost1 var(--rml-intro) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards}
.rml-t2{animation:rml-ghost2 var(--rml-intro) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards}
.rml-t3{animation:rml-ghost3 var(--rml-intro) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards}
@keyframes rml-ghost1{
  0%,10%{transform:translate(calc(-1 * var(--rml-roll)),0);opacity:0}
  27%{transform:translate(calc(-.85 * var(--rml-roll)),0);opacity:.5}
  50%{transform:translate(calc(-.2 * var(--rml-roll)),0);opacity:.26}
  63%,100%{transform:translate(calc(-.1 * var(--rml-roll)),0);opacity:0}
}
@keyframes rml-ghost2{
  0%,13%{transform:translate(calc(-1 * var(--rml-roll)),0);opacity:0}
  30%{transform:translate(calc(-.78 * var(--rml-roll)),0);opacity:.36}
  50%{transform:translate(calc(-.28 * var(--rml-roll)),0);opacity:.18}
  63%,100%{transform:translate(calc(-.16 * var(--rml-roll)),0);opacity:0}
}
@keyframes rml-ghost3{
  0%,17%{transform:translate(calc(-1 * var(--rml-roll)),0);opacity:0}
  34%{transform:translate(calc(-.7 * var(--rml-roll)),0);opacity:.24}
  50%{transform:translate(calc(-.35 * var(--rml-roll)),0);opacity:.11}
  63%,100%{transform:translate(calc(-.24 * var(--rml-roll)),0);opacity:0}
}

/* ─── Impact ripples ───────────────────────── */
.rml-ripple,.rml-ripple-slow{
  position:absolute;width:.16em;height:.16em;border-radius:50%;
  background:transparent;align-self:flex-end;
  margin-bottom:.06em;margin-left:.06em;opacity:0;transform:scale(1);z-index:1;
}
.rml-ripple{border:1px solid var(--rml-indigo);animation:rml-rip-fast var(--rml-intro) cubic-bezier(.22,.7,.2,1) 0s 1 forwards}
.rml-ripple-slow{border:1px solid var(--rml-indigo-300);animation:rml-rip-slow var(--rml-intro) cubic-bezier(.22,.7,.2,1) 0s 1 forwards}
@keyframes rml-rip-fast{0%,75%{transform:scale(1);opacity:0}78%{transform:scale(1);opacity:.55}100%{transform:scale(8);opacity:0}}
@keyframes rml-rip-slow{0%,75%{transform:scale(1);opacity:0}78%{transform:scale(1);opacity:.35}100%{transform:scale(16);opacity:0}}

/* ─── Caption ──────────────────────────────── */
.rml-caption{
  font-family:var(--rml-mono);font-size:11px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--rml-stone-500);
  z-index:2;opacity:0;margin-top:48px;
  animation:rml-caption-in .7s cubic-bezier(.22,.7,.2,1) calc(var(--rml-intro) - 0.1s) 1 forwards;
}
@keyframes rml-caption-in{
  0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}
}

/* ─── Reduced motion ───────────────────────── */
@media(prefers-reduced-motion:reduce){
  .rml-dot,.rml-trail,.rml-ripple,.rml-ripple-slow,
  .rml-caption,.rml-pip,.rml-pulse-ring,.rml-map-bg{animation:none!important}
  .rml-dot{opacity:1;transform:none}
  .rml-trail,.rml-ripple,.rml-ripple-slow,.rml-pulse-ring{display:none}
  .rml-map-bg{opacity:.3}
  .rml-caption{opacity:1}
  .rml-letter{opacity:1;transform:none}
}

/* ─── Responsive chrome ────────────────────── */
@media(max-width:600px){.rml-chrome-tl{top:18px;left:20px}.rml-chrome-tr{top:18px;right:20px;font-size:10px}}
@media(max-width:420px){.rml-chrome-tr{display:none}}
`;
