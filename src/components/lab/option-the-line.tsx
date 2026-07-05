/**
 * Direction 1 — "The Line" (polished, flagship).
 *
 * The product's own gesture, the line extending, scaled to a first impression.
 * A single hairline draws left→right across the field; as it passes each anchor
 * a milestone node sets itself and its plain-English sentence rises: Now, Soon,
 * Later, Done. The plan lays itself onto one readable line.
 *
 * Pure CSS, server-rendered, zero JS. The DEFAULT styles ARE the rest state, so
 * SSR / no-JS / reduced-motion all show the settled timeline. The intro plays
 * only inside `@media (prefers-reduced-motion: no-preference)`. Scoped `tl1-`.
 */

type Node = {
  lane: string;
  item: string;
  state: "now" | "soon" | "later" | "done";
  chip?: string;
};

const NODES: Node[] = [
  { lane: "Now", item: "Confirm the florist", state: "now", chip: "Waiting on you" },
  { lane: "Soon", item: "Send the invitations", state: "soon" },
  { lane: "Later", item: "Draw the seating plan", state: "later" },
  { lane: "Done", item: "Venue booked", state: "done" },
];

export function TimelineHeroLine() {
  return (
    <section className="tl1">
      <div className="tl1-wrap">
        <p className="tl1-eyebrow">Signal Timeline · Direction clarity</p>
        <h1 className="tl1-h1">The plan, on one&nbsp;line.</h1>
        <p className="tl1-sub">
          One public plan in plain English, laid on a single line anyone can read. What is moving now, what is
          coming, and what you will not be doing, all in one place, shared with one link.
        </p>

        <div
          className="tl1-timeline"
          role="img"
          aria-label="A timeline: Now, confirm the florist, waiting on you. Soon, send the invitations. Later, draw the seating plan. Done, venue booked."
        >
          <span className="tl1-track" aria-hidden />
          <ol className="tl1-nodes">
            {NODES.map((n, i) => (
              <li
                key={n.lane}
                className={`tl1-node tl1-${n.state}`}
                style={{ ["--i" as string]: i }}
              >
                <span className="tl1-lane">{n.lane}</span>
                <span className="tl1-mark" aria-hidden>
                  {n.state === "done" ? (
                    <svg viewBox="0 0 24 24" className="tl1-check">
                      <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className="tl1-dot" />
                  )}
                </span>
                <span className="tl1-item">{n.item}</span>
                {n.chip && <span className="tl1-chip">{n.chip}</span>}
              </li>
            ))}
          </ol>
          <span className="tl1-onward" aria-hidden>
            <span className="tl1-onward-line" />
            <span className="tl1-onward-year">02030</span>
          </span>
        </div>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.tl1{--ink:#111;--soft:#3f3f46;--faint:#71717a;--accent:#4f46e5;--paper:#fff;
  --hair:rgba(17,17,17,.12);--hair-soft:rgba(17,17,17,.07);
  min-height:92svh;display:flex;align-items:center;background:var(--paper);color:var(--ink);
  font-family:var(--font-geist-sans,system-ui,sans-serif);
  background-image:radial-gradient(rgba(17,17,17,.045) 1px,transparent 1px);background-size:26px 26px;
  background-position:center}
.tl1-wrap{max-width:1160px;margin:0 auto;padding:76px 28px;width:100%}
.tl1-eyebrow{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.14em;
  text-transform:uppercase;color:var(--faint);margin:0 0 20px}
.tl1-h1{font-size:clamp(2.2rem,1rem+5.6vw,5rem);line-height:.96;letter-spacing:-.045em;font-weight:600;
  margin:0 0 22px;max-width:15ch}
.tl1-sub{font-size:clamp(15px,.6rem+.6vw,18px);line-height:1.55;color:var(--soft);max-width:52ch;margin:0 0 68px}

.tl1-timeline{position:relative;padding-top:8px}
.tl1-track{position:absolute;left:0;right:88px;top:calc(8px + 26px + 15px);height:2px;
  background:linear-gradient(90deg,var(--ink) 0%,var(--ink) 62%,var(--hair) 100%);border-radius:2px;
  transform-origin:left center}
.tl1-nodes{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.tl1-node{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:0;padding-right:14px}
.tl1-lane{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.1em;
  text-transform:uppercase;color:var(--faint);margin-bottom:14px}
.tl1-mark{position:relative;display:grid;place-items:center;width:30px;height:30px;margin-bottom:16px}
.tl1-dot{width:15px;height:15px;border-radius:50%;background:var(--paper);border:2px solid var(--ink);
  box-shadow:0 0 0 5px var(--paper)}
.tl1-item{font-size:clamp(15px,.5rem+.7vw,19px);font-weight:500;letter-spacing:-.01em;color:var(--ink);
  line-height:1.25;max-width:16ch}
.tl1-chip{margin-top:12px;display:inline-flex;align-items:center;gap:6px;font-family:var(--font-geist-mono,monospace);
  font-size:10.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#1d6fa3;
  background:#eff6fc;border:1px solid rgba(29,111,163,.2);padding:4px 9px;border-radius:999px}

/* Now — the earned indigo, the only node that carries colour + a pulse. */
.tl1-now .tl1-lane{color:var(--accent)}
.tl1-now .tl1-dot{background:var(--accent);border-color:var(--accent);
  box-shadow:0 0 0 5px var(--paper),0 0 0 6px rgba(79,70,229,.25)}
.tl1-now .tl1-mark::before{content:"";position:absolute;inset:2px;border-radius:50%;
  border:2px solid var(--accent);opacity:0}

/* Later — quieter, it is further away. */
.tl1-later .tl1-lane,.tl1-later .tl1-item{color:var(--soft)}
.tl1-later .tl1-dot{border-color:var(--faint)}

/* Done — settled, checked, muted. */
.tl1-done .tl1-lane{color:var(--faint)}
.tl1-done .tl1-item{color:var(--faint)}
.tl1-check{width:26px;height:26px;color:var(--faint)}

/* The onward tail: the line keeps going, to the five-digit year. */
.tl1-onward{position:absolute;right:0;top:calc(8px + 26px + 6px);display:flex;flex-direction:column;
  align-items:flex-end;gap:8px;width:88px}
.tl1-onward-line{width:100%;height:2px;background:repeating-linear-gradient(90deg,var(--hair) 0 6px,transparent 6px 12px)}
.tl1-onward-year{font-family:var(--font-geist-mono,monospace);font-size:11px;letter-spacing:.08em;color:var(--faint)}

/* ── Vertical timeline on narrow screens ─────────────────────────── */
@media (max-width:720px){
  .tl1-sub{margin-bottom:44px}
  .tl1-track{left:14px;right:auto;top:0;bottom:44px;width:2px;height:auto;
    background:linear-gradient(180deg,var(--ink) 0%,var(--ink) 62%,var(--hair) 100%)}
  .tl1-nodes{grid-template-columns:1fr;gap:34px}
  .tl1-node{flex-direction:row;align-items:center;gap:16px;flex-wrap:wrap;padding-right:0}
  .tl1-lane{width:52px;margin:0;flex-shrink:0}
  .tl1-mark{margin:0}
  .tl1-item{flex:1;max-width:none}
  .tl1-chip{margin:0}
  .tl1-onward{position:static;flex-direction:row;align-items:center;width:auto;margin-top:30px;padding-left:6px}
  .tl1-onward-line{width:56px}
}

/* ── Intro motion, opt-in only. Default above IS the rest state. ── */
@media (prefers-reduced-motion:no-preference){
  .tl1-eyebrow{opacity:0;animation:tl1-rise .6s ease .05s forwards}
  .tl1-h1{opacity:0;animation:tl1-rise .7s cubic-bezier(.2,.7,.2,1) .12s forwards}
  .tl1-sub{opacity:0;animation:tl1-rise .7s ease .22s forwards}
  .tl1-track{transform:scaleX(0);animation:tl1-draw .9s cubic-bezier(.4,.7,.2,1) .5s forwards}
  .tl1-node{opacity:0;animation:tl1-pop .5s cubic-bezier(.2,.8,.2,1) forwards;
    animation-delay:calc(.7s + var(--i) * .16s)}
  .tl1-onward{opacity:0;animation:tl1-rise .6s ease 1.5s forwards}
  .tl1-now .tl1-mark::before{animation:tl1-pulse 1.4s ease-out .95s 1}
}
@keyframes tl1-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes tl1-draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes tl1-pop{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
@keyframes tl1-pulse{0%{opacity:.5;transform:scale(1)}100%{opacity:0;transform:scale(2.4)}}
`;
