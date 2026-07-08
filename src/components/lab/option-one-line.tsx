/**
 * Direction — "One Line" (TL1, flagship).
 *
 * Plans live in a dozen places and nobody sees the whole thing, so the hero puts
 * the plan on one line. The single transmutation: the underline beneath the words
 * "one line" EXTENDS horizontally across the page and becomes the actual timeline
 * axis, and the scattered plan items drop onto it in order. The sentence's own
 * line literally turns into the timeline.
 *
 *   OVERTURE (words, ~0-4.8s): three plain lines, one at a time.
 *     1. "Plans live in a dozen places."
 *     2. "Nobody sees the whole thing."
 *     3. "Put it on one line."   — seed phrase = "one line" (carries an underline).
 *   TRANSMUTATION (~4.6-5.6s): the underline under "one line" scales out into the
 *     axis (ease-draw), the overture dissolves, and the axis is now the timeline.
 *   MECHANISM (~5.6-7.6s): markers land L->R in order — Now / Soon / Later / Done —
 *     each a real plain-English wedding item with a date; Now carries the single
 *     indigo dot and one pulse.
 *   REST: a settled editorial horizontal timeline. Now is the only colour, a muted
 *     "done" tail, the `timeline·` wordmark with the sweep gesture (the one allowed
 *     loop: an indigo dot travels L->R, blinks out mid-sweep, returns).
 *
 * Pure CSS, server-rendered, zero JS. The DEFAULT styles ARE the rest state, so
 * SSR / no-JS / reduced-motion all paint the settled timeline. Intro plays only
 * inside `@media (prefers-reduced-motion: no-preference)`. Scoped `tl3-`.
 */

type Node = {
  lane: string;
  item: string;
  date: string;
  state: "now" | "soon" | "later" | "done";
  chip?: string;
};

const NODES: Node[] = [
  { lane: "Now", item: "Confirm the florist", date: "this week", state: "now", chip: "Waiting on you" },
  { lane: "Soon", item: "Send the invitations", date: "by Friday", state: "soon" },
  { lane: "Later", item: "Draw the seating plan", date: "after RSVPs", state: "later" },
  { lane: "Done", item: "Venue booked", date: "Jun 2", state: "done" },
];

export function TimelineHeroOneLine() {
  return (
    <section className="tl3">
      <div className="tl3-wrap">
        {/* Overture — the spoken idea, before any timeline. Decorative and
            aria-hidden; the settled artifact below carries the same meaning for
            assistive tech and no-JS. Default display:none. */}
        <div className="tl3-overture" aria-hidden>
          <p className="tl3-ov tl3-ov-1">Plans live in a dozen places.</p>
          <p className="tl3-ov tl3-ov-2">Nobody sees the whole thing.</p>
          <p className="tl3-ov tl3-ov-3">
            Put it on{" "}
            <span className="tl3-seed">
              one line<span className="tl3-seed-rule" aria-hidden />
            </span>
            .
          </p>
        </div>

        <p className="tl3-eyebrow">Signal Timeline · One line</p>
        <h1 className="tl3-h1">Put the whole plan on one&nbsp;line.</h1>
        <p className="tl3-sub">
          One public plan in plain English, laid on a single line anyone can read. What is moving now, what is
          coming, what is done. No more chasing it across a dozen places.
        </p>

        <div
          className="tl3-timeline"
          role="img"
          aria-label="A dated timeline on one line. Now, confirm the florist, this week, waiting on you. Soon, send the invitations, by Friday. Later, draw the seating plan, after RSVPs. Done, venue booked, June 2. One wedding, fourteen milestones, everyone sees the same line."
        >
          <div className="tl3-plot">
            <span className="tl3-track" aria-hidden />
            <span className="tl3-sweep" aria-hidden />
            <ol className="tl3-nodes">
              {NODES.map((n, i) => (
                <li
                  key={n.lane}
                  className={`tl3-node tl3-${n.state}`}
                  style={{ ["--i" as string]: i }}
                >
                  <span className="tl3-lane">{n.lane}</span>
                  <span className="tl3-mark" aria-hidden>
                    {n.state === "done" ? (
                      <svg viewBox="0 0 24 24" className="tl3-check">
                        <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span className="tl3-dot" />
                    )}
                  </span>
                  <span className="tl3-item">{n.item}</span>
                  <span className="tl3-date">{n.date}</span>
                  {n.chip && <span className="tl3-chip">{n.chip}</span>}
                </li>
              ))}
            </ol>
            <span className="tl3-onward" aria-hidden>
              <span className="tl3-onward-line" />
              <span className="tl3-onward-year">the day</span>
            </span>
          </div>

          <p className="tl3-ledger">
            <span className="tl3-mark-word">timeline</span>
            <span className="tl3-mark-dot" aria-hidden />
            <span className="tl3-ledger-line">
              One wedding. Fourteen milestones. Everyone sees the same line.
            </span>
          </p>
        </div>

        <div className="tl3-cta">
          <a className="tl3-cta-primary" href="mailto:hello@signalstudio.ie?subject=A%20shared%20plan">
            Open a shared plan
          </a>
          <a className="tl3-cta-secondary" href="https://timeline.signalstudio.ie">
            See a live line
          </a>
        </div>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.tl3{--ink:#111;--soft:#3f3f46;--faint:#71717a;--accent:#4f46e5;--paper:#fff;
  --hair:rgba(17,17,17,.12);--hair-soft:rgba(17,17,17,.07);
  --ease-rack:cubic-bezier(0.22,0.61,0.18,1);
  --ease-soft:cubic-bezier(0.16,1,0.3,1);
  --ease-draw:cubic-bezier(0.22,0.61,0.36,1);
  --ease-pencil:cubic-bezier(0.7,0,0.3,1);
  position:relative;min-height:92svh;display:flex;align-items:flex-start;background:var(--paper);color:var(--ink);
  font-family:var(--font-geist-sans,system-ui,sans-serif);overflow:hidden;
  background-image:radial-gradient(rgba(17,17,17,.045) 1px,transparent 1px);background-size:26px 26px;
  background-position:center}
.tl3 *{box-sizing:border-box}
.tl3-wrap{position:relative;max-width:1160px;margin:0 auto;padding:clamp(64px,9vh,120px) 28px 80px;width:100%}

/* ── Overture: the spoken idea. Default hidden; the settled artifact is canon. ── */
.tl3-overture{display:none}
.tl3-ov{position:absolute;left:28px;right:28px;top:clamp(140px,26vh,300px);margin:0;
  max-width:20ch;font-size:clamp(2rem,1rem+4.4vw,4.4rem);line-height:1;letter-spacing:-.045em;font-weight:600;
  color:var(--ink);opacity:0}
.tl3-ov-3{color:var(--soft)}
.tl3-seed{position:relative;display:inline-block;color:var(--ink);font-weight:660}
/* The underline that will become the axis. */
.tl3-seed-rule{position:absolute;left:0;right:0;bottom:-.14em;height:3px;border-radius:2px;
  background:var(--ink);transform-origin:left center}

.tl3-eyebrow{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.14em;
  text-transform:uppercase;color:var(--faint);margin:0 0 20px}
.tl3-h1{font-size:clamp(34px,6vw,76px) !important;line-height:.96;letter-spacing:-.045em;font-weight:600;
  margin:0 0 22px;max-width:15ch}
.tl3-sub{font-size:clamp(15px,.6rem+.6vw,18px);line-height:1.55;color:var(--soft);max-width:52ch;margin:0 0 56px}

/* ── The plot: one line, four dated markers ─────────────────── */
.tl3-plot{position:relative;padding-top:2px}
/* The axis: the sentence's underline, extended. Solid ink fading to a done tail. */
.tl3-track{position:absolute;left:0;right:96px;top:calc(2px + 26px + 15px);height:3px;
  background:linear-gradient(90deg,var(--ink) 0%,var(--ink) 64%,var(--hair) 100%);border-radius:2px;
  transform-origin:left center}

/* The sweep gesture: an indigo dot travels L->R along the axis, blinks out
   mid-sweep, and returns. The single allowed infinite loop. */
.tl3-sweep{position:absolute;left:0;top:calc(2px + 26px + 15px - 3.5px);width:10px;height:10px;border-radius:50%;
  background:var(--accent);box-shadow:0 0 0 4px rgba(79,70,229,.18);opacity:0;pointer-events:none}

.tl3-nodes{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.tl3-node{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:0;padding-right:14px}
.tl3-lane{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.1em;
  text-transform:uppercase;color:var(--faint);margin-bottom:14px}
.tl3-mark{position:relative;display:grid;place-items:center;width:30px;height:30px;margin-bottom:16px}
.tl3-dot{width:15px;height:15px;border-radius:50%;background:var(--paper);border:2px solid var(--ink);
  box-shadow:0 0 0 5px var(--paper)}
.tl3-item{font-size:clamp(15px,.5rem+.7vw,19px);font-weight:500;letter-spacing:-.01em;color:var(--ink);
  line-height:1.25;max-width:16ch}
.tl3-date{margin-top:7px;font-family:var(--font-geist-mono,monospace);font-size:11px;letter-spacing:.03em;color:var(--faint)}
.tl3-chip{margin-top:12px;display:inline-flex;align-items:center;gap:6px;font-family:var(--font-geist-mono,monospace);
  font-size:10.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#1d6fa3;
  background:#eff6fc;border:1px solid rgba(29,111,163,.2);padding:4px 9px;border-radius:999px}

/* Now — the earned indigo: the only node that carries colour + a single pulse. */
.tl3-now .tl3-lane{color:var(--accent)}
.tl3-now .tl3-dot{background:var(--accent);border-color:var(--accent);
  box-shadow:0 0 0 5px var(--paper),0 0 0 6px rgba(79,70,229,.25)}
.tl3-now .tl3-date{color:var(--accent)}
.tl3-now .tl3-mark::before{content:"";position:absolute;inset:2px;border-radius:50%;
  border:2px solid var(--accent);opacity:0}

/* Later — quieter, it is further away. */
.tl3-later .tl3-lane,.tl3-later .tl3-item{color:var(--soft)}
.tl3-later .tl3-dot{border-color:var(--faint)}

/* Done — settled, checked, muted. */
.tl3-done .tl3-lane{color:var(--faint)}
.tl3-done .tl3-item{color:var(--faint)}
.tl3-check{width:26px;height:26px;color:var(--faint)}

/* The onward tail: the line keeps going, off toward the day itself. */
.tl3-onward{position:absolute;right:0;top:calc(2px + 26px + 6px);display:flex;flex-direction:column;
  align-items:flex-end;gap:8px;width:96px}
.tl3-onward-line{width:100%;height:3px;background:repeating-linear-gradient(90deg,var(--hair) 0 6px,transparent 6px 12px)}
.tl3-onward-year{font-family:var(--font-geist-mono,monospace);font-size:11px;letter-spacing:.06em;color:var(--faint)}

/* ── Ledger: wordmark + honest line ─────────────────────────── */
.tl3-ledger{display:flex;align-items:center;gap:10px;margin:48px 0 0;padding-top:22px;
  border-top:1px solid var(--hair-soft);flex-wrap:wrap}
.tl3-mark-word{font-size:15px;font-weight:600;letter-spacing:-.02em;color:var(--ink)}
.tl3-mark-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);margin-left:-4px}
.tl3-ledger-line{margin-left:12px;font-size:13px;line-height:1.45;color:var(--faint)}

/* ── CTA row ─────────────────────────────────────────────── */
.tl3-cta{display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;margin-top:34px}
.tl3-cta-primary{display:inline-flex;align-items:center;padding:9px 16px;background:var(--ink);color:var(--paper);
  font-size:13px;font-weight:540;text-decoration:none;border:1px solid var(--ink);border-radius:3px;
  transition:opacity .16s var(--ease-soft)}
.tl3-cta-primary:hover{opacity:.86}
.tl3-cta-secondary{display:inline-flex;align-items:center;padding:9px 14px;color:var(--soft);font-size:13px;
  text-decoration:none;border:1px solid var(--hair);border-radius:3px;
  transition:color .16s var(--ease-soft),border-color .16s var(--ease-soft)}
.tl3-cta-secondary:hover{color:var(--ink);border-color:var(--faint)}

/* ── Vertical timeline on narrow screens ─────────────────────── */
@media (max-width:720px){
  .tl3-sub{margin-bottom:40px}
  .tl3-track{left:14px;right:auto;top:0;bottom:44px;width:3px;height:auto;
    background:linear-gradient(180deg,var(--ink) 0%,var(--ink) 64%,var(--hair) 100%)}
  .tl3-sweep{left:14px;top:0;transform:translateX(-3.5px)}
  .tl3-nodes{grid-template-columns:1fr;gap:32px}
  .tl3-node{flex-direction:row;align-items:center;gap:16px;flex-wrap:wrap;padding-right:0}
  .tl3-lane{width:52px;margin:0;flex-shrink:0}
  .tl3-mark{margin:0}
  .tl3-item{flex:1;max-width:none}
  .tl3-date{margin:0;width:100%;padding-left:68px}
  .tl3-chip{margin:0}
  .tl3-onward{position:static;flex-direction:row;align-items:center;width:auto;margin-top:28px;padding-left:6px}
  .tl3-onward-line{width:56px}
  .tl3-ledger{flex-wrap:wrap;gap:8px}
  .tl3-ledger-line{margin-left:0;flex-basis:100%}
}

/* ── Intro motion, opt-in only. Default above IS the rest state. ── */
@media (prefers-reduced-motion:no-preference){
  /* Hold the headline/artifact hidden until the overture hands off. */
  .tl3-eyebrow{opacity:0;animation:tl3-rise .6s var(--ease-soft) 5.35s forwards}
  .tl3-h1{opacity:0;animation:tl3-rise .7s var(--ease-rack) 5.45s forwards}
  .tl3-sub{opacity:0;animation:tl3-rise .7s var(--ease-soft) 5.6s forwards}

  /* Show + run the overture: three lines, one at a time, in->hold->out. */
  .tl3-overture{display:block}
  .tl3-ov-1{animation:tl3-ov-inout 2.4s var(--ease-soft) .25s both}
  .tl3-ov-2{animation:tl3-ov-inout 2.4s var(--ease-soft) 2.55s both}
  /* Line 3 sets and holds; it is carried out by the seed transmutation + layer fade. */
  .tl3-ov-3{animation:tl3-ov-in 1s var(--ease-soft) 4.8s both}
  .tl3-overture{animation:tl3-ov-layer-out .5s var(--ease-soft) 5.55s both}

  /* Transmutation: the underline under "one line" extends into the axis. The
     seed rule scales out, then the real track takes over as the layer dissolves. */
  .tl3-seed-rule{transform:scaleX(0);animation:tl3-draw .55s var(--ease-draw) 5.5s both}
  .tl3-track{transform:scaleX(0);animation:tl3-draw .85s var(--ease-draw) 5.55s forwards}

  /* Mechanism: markers drop onto the line L->R, in order. */
  .tl3-node{opacity:0;animation:tl3-pop .5s cubic-bezier(.2,.8,.2,1) forwards;
    animation-delay:calc(5.9s + var(--i) * .22s)}
  .tl3-onward{opacity:0;animation:tl3-rise .6s var(--ease-soft) 6.95s forwards}
  .tl3-ledger{opacity:0;animation:tl3-rise .6s var(--ease-soft) 7.15s forwards}
  .tl3-cta{opacity:0;animation:tl3-rise .6s var(--ease-soft) 7.35s forwards}
  /* Now marker gets one pulse as the line settles on it. */
  .tl3-now .tl3-mark::before{animation:tl3-pulse 1.4s ease-out 6.6s 1}

  /* The sweep gesture — the resting wordmark loop. Starts after settle; an indigo
     dot travels L->R, blinks out mid-sweep, and returns. The one allowed loop. */
  .tl3-sweep{animation:tl3-sweep 5.2s var(--ease-soft) 7.8s infinite}
}
@keyframes tl3-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes tl3-ov-inout{0%{opacity:0;transform:translateY(12px)}16%{opacity:1;transform:translateY(0)}74%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-9px)}}
@keyframes tl3-ov-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes tl3-ov-layer-out{from{opacity:1}to{opacity:0}}
@keyframes tl3-draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes tl3-pop{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
@keyframes tl3-pulse{0%{opacity:.5;transform:scale(1)}100%{opacity:0;transform:scale(2.4)}}
/* Sweep: rest at left, travel right, blink out at the far end, return dark, reappear. */
@keyframes tl3-sweep{
  0%{opacity:0;left:0}
  6%{opacity:1}
  44%{opacity:1;left:calc(100% - 96px - 10px)}
  50%{opacity:0;left:calc(100% - 96px - 10px)}
  56%{opacity:0;left:0}
  62%{opacity:1;left:0}
  100%{opacity:0;left:0}
}
`;
