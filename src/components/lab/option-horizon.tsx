"use client";

/**
 * Direction 4 — "Horizon" (WILDCARD).
 *
 * The Long Now made literal. The plan becomes a vista: a road receding to a
 * vanishing point where the five-digit year sits. Now is in the foreground where
 * you stand; the far things are planted small and honest on the road ahead. Move
 * the pointer and the road shifts under you (depth parallax).
 *
 * SSR renders the full static vista (real text, positioned markers). The parallax
 * is a pure enhancement, skipped under reduced-motion / no pointer. Scoped `tl4-`.
 */

import { useEffect, useRef } from "react";

type Marker = {
  when: string;
  item: string;
  top: number; // % down the stage
  scale: number;
  depth: number; // 1 = nearest (moves most), 0 = at the horizon
  side: "l" | "r" | "c";
  delay: number; // intro plant order, far → near
};

const MARKERS: Marker[] = [
  { when: "Now", item: "Confirm the florist", top: 80.5, scale: 1, depth: 1, side: "c", delay: 1.34 },
  { when: "Soon", item: "Send the invitations", top: 61, scale: 0.84, depth: 0.7, side: "r", delay: 1.1 },
  { when: "Later", item: "Draw the seating plan", top: 46, scale: 0.72, depth: 0.46, side: "l", delay: 0.9 },
  { when: "Next year", item: "The first anniversary", top: 31.5, scale: 0.62, depth: 0.26, side: "r", delay: 0.74 },
  { when: "02030", item: "Still here", top: 19.5, scale: 0.56, depth: 0.1, side: "c", delay: 0.6 },
];

export function TimelineHeroHorizon() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    const onMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2; // -1 .. 1
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const apply = () => {
      raf = 0;
      stage.style.setProperty("--px", tx.toFixed(3));
      stage.style.setProperty("--py", ty.toFixed(3));
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", onLeave);
    return () => {
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="tl4">
      <div className="tl4-copy">
        <p className="tl4-eyebrow">Signal Timeline · The long now</p>
        <h1 className="tl4-h1">See the whole road, not just the&nbsp;quarter.</h1>
        <p className="tl4-sub">
          Most tools stop at this quarter. A plan should show the whole road, what is under your feet now and
          what is still standing years out. Move your pointer and look down it.
        </p>
      </div>

      <div
        className="tl4-stage"
        ref={stageRef}
        role="img"
        aria-label="A road receding to the horizon marked with the plan: Now, confirm the florist; Soon, send the invitations; Later, draw the seating plan; Next year, the first anniversary; and at the far year 02030, still here."
      >
        <svg className="tl4-road" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            <radialGradient id="tl4-glow" cx="50%" cy="14%" r="46%">
              <stop offset="0%" stopColor="rgba(79,70,229,0.16)" />
              <stop offset="55%" stopColor="rgba(79,70,229,0.04)" />
              <stop offset="100%" stopColor="rgba(79,70,229,0)" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="1000" height="620" fill="url(#tl4-glow)" />
          <line x1="60" y1="90" x2="940" y2="90" stroke="rgba(17,17,17,.1)" strokeWidth="1" />
          {/* road rails converging on the vanishing point (500,90) */}
          <line x1="120" y1="612" x2="500" y2="90" stroke="rgba(17,17,17,.14)" strokeWidth="1.5" />
          <line x1="880" y1="612" x2="500" y2="90" stroke="rgba(17,17,17,.14)" strokeWidth="1.5" />
          <line x1="500" y1="612" x2="500" y2="92" stroke="rgba(17,17,17,.16)" strokeWidth="1.5" strokeDasharray="3 12" />
          {/* depth cross-ties */}
          {[500, 380, 285, 210, 150].map((y, i) => {
            const t = (612 - y) / (612 - 90);
            const half = 380 * (1 - t) + 6;
            return <line key={i} x1={500 - half} y1={y} x2={500 + half} y2={y} stroke="rgba(17,17,17,.06)" strokeWidth="1" />;
          })}
        </svg>

        <div className="tl4-field">
          {MARKERS.map((m) => (
            <div
              key={m.when}
              className={`tl4-mk tl4-side-${m.side}${m.when === "Now" ? " tl4-now" : ""}${m.when === "02030" ? " tl4-far" : ""}`}
              style={{
                top: `${m.top}%`,
                ["--s" as string]: m.scale,
                ["--d" as string]: m.depth,
                ["--delay" as string]: `${m.delay}s`,
              }}
            >
              <span className="tl4-node" aria-hidden />
              <span className="tl4-label">
                <span className="tl4-when">{m.when}</span>
                <span className="tl4-item">{m.item}</span>
              </span>
            </div>
          ))}
          <span className="tl4-here" aria-hidden>you are here</span>
        </div>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.tl4{--ink:#111;--soft:#3f3f46;--faint:#71717a;--accent:#4f46e5;--paper:#fff;
  position:relative;min-height:92svh;display:flex;flex-direction:column;background:var(--paper);color:var(--ink);
  font-family:var(--font-geist-sans,system-ui,sans-serif);overflow:hidden;
  background-image:linear-gradient(180deg,#fbfbfe 0%,#ffffff 42%)}
.tl4-copy{position:relative;z-index:3;max-width:1160px;margin:0 auto;width:100%;padding:64px 28px 0}
.tl4-eyebrow{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.14em;
  text-transform:uppercase;color:var(--faint);margin:0 0 18px}
.tl4-h1{font-size:clamp(2rem,1rem+4.4vw,4.1rem);line-height:.98;letter-spacing:-.04em;font-weight:600;margin:0 0 18px;max-width:16ch}
.tl4-sub{font-size:clamp(15px,.6rem+.5vw,17.5px);line-height:1.55;color:var(--soft);max-width:52ch;margin:0}

/* ── Vista ─────────────────────────────────────────────── */
.tl4-stage{position:relative;flex:1;min-height:min(58svh,560px);margin-top:-10px}
.tl4-road{position:absolute;inset:0;width:100%;height:100%}
.tl4-field{position:absolute;inset:0;transform:translateX(calc(var(--px,0) * 14px));transition:transform .4s ease-out}

.tl4-mk{position:absolute;left:50%;display:flex;align-items:center;gap:12px;
  transform:translate(-50%,-50%) scale(var(--s)) translateX(calc(var(--px,0) * var(--d) * 60px)) translateY(calc(var(--py,0) * var(--d) * 22px));
  transform-origin:center;transition:transform .45s cubic-bezier(.2,.7,.2,1)}
.tl4-node{width:14px;height:14px;border-radius:50%;background:var(--paper);border:2px solid var(--ink);flex-shrink:0;
  box-shadow:0 0 0 5px var(--paper)}
.tl4-label{display:flex;flex-direction:column;gap:2px;white-space:nowrap}
.tl4-when{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.08em;
  text-transform:uppercase;color:var(--faint)}
.tl4-item{font-size:19px;font-weight:500;letter-spacing:-.01em;color:var(--ink)}

/* side placement so labels don't cross the road centre */
.tl4-side-r{flex-direction:row}
.tl4-side-l{flex-direction:row-reverse}
.tl4-side-l .tl4-label{text-align:right}
.tl4-side-c{flex-direction:column;gap:8px}
.tl4-side-c .tl4-label{align-items:center;text-align:center}

.tl4-now .tl4-node{background:var(--accent);border-color:var(--accent);
  box-shadow:0 0 0 5px var(--paper),0 0 0 7px rgba(79,70,229,.22)}
.tl4-now .tl4-when{color:var(--accent)}
.tl4-now .tl4-item{font-size:21px;font-weight:600}
.tl4-far .tl4-when{color:var(--accent)}
.tl4-far .tl4-item{color:var(--faint)}

.tl4-here{position:absolute;left:50%;top:92%;transform:translateX(-50%);
  font-family:var(--font-geist-mono,monospace);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}

@media (max-width:640px){
  .tl4-item{font-size:15px}.tl4-now .tl4-item{font-size:17px}
  .tl4-mk{gap:8px}
}

@media (prefers-reduced-motion:no-preference){
  .tl4-copy>*{opacity:0;animation:tl4-rise .6s ease forwards}
  .tl4-eyebrow{animation-delay:.05s}.tl4-h1{animation-delay:.14s}.tl4-sub{animation-delay:.24s}
  .tl4-road{opacity:0;animation:tl4-fade 1.1s ease .3s forwards}
  /* markers plant from the horizon toward you (far first), coming into focus */
  .tl4-mk{opacity:0;animation:tl4-plant .75s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:var(--delay,0s)}
  .tl4-here{opacity:0;animation:tl4-rise .6s ease 1.7s forwards}
}
@keyframes tl4-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes tl4-fade{from{opacity:0}to{opacity:1}}
@keyframes tl4-plant{from{opacity:0;filter:blur(7px)}to{opacity:1;filter:blur(0)}}
`;
