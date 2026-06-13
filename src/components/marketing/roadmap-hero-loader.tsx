"use client";

/**
 * Roadmap hero loader — "the map unfolds."
 *
 * Real Limerick city map (MapLibre GL + OpenFreeMap vector tiles).
 * Dot rolls in assembling "roadmap." then every 20s pulses —
 * the map radial-reveals from the dot via clip-path, holds, retreats.
 *
 * SAFETY CONTRACT:
 *   · Fully scoped — every class and @keyframes prefixed `rml-`.
 *   · In-flow only — no position:fixed, no inset:0 globally.
 *   · rAF loop runs only during the intro roll then cancels.
 *   · MapLibre loaded from CDN only on client; script/link cleaned up on unmount.
 *   · prefers-reduced-motion → assembled state, map shown statically.
 */

import { useEffect, useRef } from "react";

export function RoadmapHeroLoader() {
  const stageRef  = useRef<HTMLDivElement>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage  = stageRef.current;
    const mapDiv = mapDivRef.current;
    if (!stage || !mapDiv) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Anchor pulse rings + vignette + map clip to the dot's resting place ──
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
      mapDiv.classList.add("rml-map-ready");
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

    // ── MapLibre GL — load from CDN, init ghost map ──────────────────────────
    const cssLink = document.createElement("link");
    cssLink.rel   = "stylesheet";
    cssLink.href  = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css";
    document.head.appendChild(cssLink);

    let mapInstance: unknown = null;

    const script   = document.createElement("script");
    script.src     = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";
    script.onload  = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ml = (window as any).maplibregl;
      if (!ml || !mapDiv) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map: any = new ml.Map({
        container:            mapDiv,
        interactive:          false,
        attributionControl:   false,
        preserveDrawingBuffer: false,
        style: {
          version: 8,
          glyphs:  "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
          sprite:  "https://tiles.openfreemap.org/sprites/ofm_f384/ofm",
          sources: {
            openmaptiles: {
              type:        "vector",
              url:         "https://tiles.openfreemap.org/planet",
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: buildMapStyle(),
        },
        center:  [-8.627, 52.674],
        zoom:    12.4,
        bearing: 0,
        pitch:   0,
      });

      mapInstance = map;

      // Only start animation once tiles have fully rendered
      map.once("idle", () => {
        mapDiv.classList.add("rml-map-ready");
        anchorPulse(); // re-anchor after map renders (layout may have shifted)
      });
    };
    document.head.appendChild(script);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (mapInstance) (mapInstance as any).remove?.();
      script.remove();
      cssLink.remove();
    };
  }, []);

  return (
    <section className="rml-hero-section" aria-label="Signal Timeline">

      {/* Layer 0: real Limerick city map — MapLibre GL */}
      <div ref={mapDivRef} className="rml-map-bg" aria-hidden />

      {/* Layer 1: vignette — pulls focus to dot origin */}
      <div className="rml-map-vignette" aria-hidden />

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

      {/* Stage — wordmark + animated dot */}
      <div className="rml-stage" ref={stageRef} aria-hidden>
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

// ─── MapLibre style — Limerick ghost palette (matches loader.html exactly) ───
function buildMapStyle() {
  function z(...pairs: number[]) {
    const stops: number[] = [];
    for (let i = 0; i < pairs.length; i += 2) stops.push(pairs[i], pairs[i + 1]);
    return ["interpolate", ["linear"], ["zoom"], ...stops];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function fill(id: string, sourceLayer: string, color: string, opacity: number, filter?: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const l: any = {
      id, type: "fill",
      source: "openmaptiles",
      "source-layer": sourceLayer,
      paint: { "fill-color": color, "fill-opacity": opacity },
    };
    if (filter) l.filter = filter;
    return l;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function casing(id: string, filter: any[], color: string, width: unknown) {
    return {
      id, type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": color, "line-width": width },
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function road(id: string, filter: any[], color: string, width: unknown, cap = "round", extra: Record<string, unknown> = {}) {
    return {
      id, type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter,
      layout: { "line-cap": cap, "line-join": "round" },
      paint: { "line-color": color, "line-width": width, ...extra },
    };
  }

  return [
    // Canvas
    { id: "background", type: "background", paint: { "background-color": "#ffffff" } },

    // Landuse — warm stone fills, no green
    fill("lu-residential", "landuse", "#F5F4F1", 0.55, ["in", "class", "residential", "suburbs"]),
    fill("lu-commercial",  "landuse", "#F2F0EC", 0.50, ["in", "class", "commercial",  "retail"]),
    fill("lu-industrial",  "landuse", "#EDEAE6", 0.45, ["in", "class", "industrial",  "garages", "railway"]),

    // Water — Shannon in soft lavender, fill only, no lines
    { id: "water-fill", type: "fill", source: "openmaptiles", "source-layer": "water",
      paint: { "fill-color": "#DDD8FC", "fill-opacity": 0.85 } },

    // Buildings — ghost texture only
    { id: "bldg", type: "fill", source: "openmaptiles", "source-layer": "building",
      minzoom: 13,
      paint: { "fill-color": "#EDEAE7",
               "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0.15, 15, 0.45] } },

    // Road casings — paper-white gap lines only
    casing("rc-tertiary",  ["==", "class", "tertiary"],  "#ffffff", z(12, 1.5, 17, 5)),
    casing("rc-secondary", ["==", "class", "secondary"], "#ffffff", z(11, 2,   17, 7)),
    casing("rc-primary",   ["==", "class", "primary"],   "#ffffff", z(11, 2.5, 17, 9)),
    casing("rc-trunk",     ["==", "class", "trunk"],     "#ffffff", z(10, 3,   17, 10)),
    casing("rc-motorway",  ["==", "class", "motorway"],  "#ffffff", z(9,  4,   17, 12)),

    // Road fills — all warm stone, narrow tone range, no bright indigo
    road("r-living",   ["==", "class", "living_street"],             "#DCDAD5", z(13, 0.5, 17, 2)),
    road("r-res",      ["==", "class", "residential"],               "#D8D6D2", z(12, 0.5, 17, 2.5)),
    road("r-service",  ["==", "class", "service"],                   "#D4D2CE", z(13, 0.5, 17, 2)),
    road("r-minor",    ["in",  "class", "minor", "unclassified"],    "#D0CECC", z(12, 0.6, 17, 2.5)),
    road("r-tertiary", ["==", "class", "tertiary"],                  "#C8C6C2", z(11, 0.8, 17, 3.5)),
    road("r-secondary",["==", "class", "secondary"],                 "#BFBDB9", z(10, 1,   17, 5)),
    road("r-primary",  ["==", "class", "primary"],                   "#B4B2AE", z(10, 1.2, 17, 6)),
    road("r-trunk",    ["==", "class", "trunk"],                     "#BCBACE", z(10, 1.5, 17, 7), "butt"),
    road("r-motorway", ["==", "class", "motorway"],                  "#AEACBF", z(9,  1.8, 17, 8), "butt"),

    // NO labels
  ];
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
  min-height: min(88vh, 900px);
  padding: clamp(80px,12vh,160px) 24px clamp(64px,10vh,128px);
  --rml-origin-x: 56%;
  --rml-origin-y: 50%;
  --rml-ink: #111111;
  --rml-stone-400: #b8b2a3;
  --rml-stone-500: #8c887e;
  --rml-indigo: #4f46e5;
  --rml-indigo-300: #a5b4fc;
  --rml-hairline: rgba(17,17,17,0.06);
  --rml-wm-size: clamp(56px, 12vw, 168px);
  --rml-roll: calc(var(--rml-wm-size) * 8);
  --rml-intro: 2.6s;
  --rml-pulse-cycle: 20s;
  --rml-pulse-delay: calc(var(--rml-intro) + 1.8s);
  --rml-font: var(--font-geist-sans, 'Geist', system-ui, sans-serif);
  --rml-mono: var(--font-geist-mono, 'Geist Mono', ui-monospace, monospace);
}

/* ─── MapLibre map container ───────────────────────────────── */
.rml-map-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  clip-path: circle(0% at var(--rml-origin-x) var(--rml-origin-y));
}
/* Fires once MapLibre tiles are idle */
.rml-map-bg.rml-map-ready {
  animation: rml-map-pulse var(--rml-pulse-cycle) linear var(--rml-pulse-delay) infinite;
}

/* ── Map pulse choreography (20s cycle, mirrors loader.html exactly) ──
   Physics: dot squishes at 0% → ring fires at 0.5% → map seeds at 0.5%
   Timeline:
     0.00s  dot impact + squish
     0.10s  ring fires, map seeds (shockwave)
     1.80s  map 65% open
     2.00s  map fully open, peak opacity 0.34
     2–5s   3s exact hold, completely still
     5–7s   stage 1: slow graceful retreat
     7–8s   stage 2: decisive snap back
     8–20s  12s rest
*/
@keyframes rml-map-pulse {
  0%   { clip-path: circle(0%  at var(--rml-origin-x) var(--rml-origin-y)); opacity: 0;    }
  0.5% { clip-path: circle(4%  at var(--rml-origin-x) var(--rml-origin-y)); opacity: 0.06; }
  9%   { clip-path: circle(65% at var(--rml-origin-x) var(--rml-origin-y)); opacity: 0.33; }
  10%  { clip-path: circle(80% at var(--rml-origin-x) var(--rml-origin-y)); opacity: 0.34; }
  25%  { clip-path: circle(80% at var(--rml-origin-x) var(--rml-origin-y)); opacity: 0.34; }
  35%  { clip-path: circle(45% at var(--rml-origin-x) var(--rml-origin-y)); opacity: 0.12; }
  40%  { clip-path: circle(0%  at var(--rml-origin-x) var(--rml-origin-y)); opacity: 0;    }
  100% { clip-path: circle(0%  at var(--rml-origin-x) var(--rml-origin-y)); opacity: 0;    }
}

/* ─── Vignette — pulls focus to dot origin ─────────────────── */
.rml-map-vignette {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(
    ellipse 75% 70% at var(--rml-origin-x) var(--rml-origin-y),
    transparent 30%,
    rgba(255,255,255,0.40) 55%,
    rgba(255,255,255,0.80) 78%,
    rgba(255,255,255,0.97) 100%
  );
}

/* ─── Strip MapLibre chrome ────────────────────────────────── */
.rml-map-bg .maplibregl-ctrl-attrib,
.rml-map-bg .maplibregl-ctrl-bottom-left,
.rml-map-bg .maplibregl-ctrl-bottom-right,
.rml-map-bg .maplibregl-ctrl-top-left,
.rml-map-bg .maplibregl-ctrl-top-right { display: none !important; }

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
  margin-top: 48px;
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
  .rml-map-bg.rml-map-ready { animation: none !important; }
  .rml-dot   { opacity: 1; transform: none; }
  .rml-trail, .rml-ripple, .rml-ripple-slow, .rml-pulse-ring { display: none; }
  .rml-map-bg.rml-map-ready {
    opacity: 0.25;
    clip-path: circle(80% at var(--rml-origin-x) var(--rml-origin-y));
  }
  .rml-caption { opacity: 1; }
  .rml-letter  { opacity: 1; transform: none; }
}

/* ─── Responsive chrome ────────────────────────────────────── */
@media (max-width: 600px) {
  .rml-chrome-tl { top: 18px; left: 20px; }
  .rml-chrome-tr { top: 18px; right: 20px; font-size: 10px; }
}
@media (max-width: 420px) { .rml-chrome-tr { display: none; } }
`;
