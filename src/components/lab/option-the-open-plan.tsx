/**
 * Direction — "The Open Plan" (TL2).
 *
 * A plan only works if everyone sees it. You wrote it, then chased everyone to
 * read it. So you send one link instead. The single transmutation: the words
 * "one link" condense into an actual URL pill, it is opened, and a sign-in wall
 * dissolves to reveal the plan already underneath — access made literal, no
 * account. This is the shipped "The Link" idea brought to Playbook standard:
 * sentence-first, one clean delight (the wall dissolving on the URL).
 *
 *   OVERTURE (words, ~0-4.8s): three plain lines, one at a time.
 *     1. "You wrote the plan."
 *     2. "Then chased everyone to read it."
 *     3. "Send one link instead."   — seed = "one link".
 *   TRANSMUTATION (~4.6-5.8s): "one link" condenses into a URL pill (ease-rack);
 *     the pill is opened and the sign-in wall dissolves off the plan.
 *   MECHANISM (~5.8-7.6s): the shared plan unfolds exactly as a guest sees it —
 *     a readable dated line, no chrome to decode, a sweep reading it.
 *   REST: the plan open in a minimal reading frame, `timeline·` wordmark with the
 *     sweep gesture (an indigo dot travels L->R, blinks out mid-sweep, returns —
 *     the one allowed loop). Now is the only colour.
 *
 * Pure CSS, server-rendered, zero JS. The DEFAULT styles ARE the rest state, so
 * SSR / no-JS / reduced-motion all paint the opened plan. Intro plays only inside
 * `@media (prefers-reduced-motion: no-preference)`. Scoped `tl4-`.
 */

type Row = {
  lane: string;
  item: string;
  date: string;
  state: "now" | "soon" | "later" | "done";
  chip?: string;
};

const ROWS: Row[] = [
  { lane: "Now", item: "Confirm the florist", date: "this week", state: "now", chip: "Waiting on you" },
  { lane: "Soon", item: "Send the invitations", date: "by Friday", state: "soon" },
  { lane: "Later", item: "Draw the seating plan", date: "after RSVPs", state: "later" },
  { lane: "Done", item: "Venue booked", date: "Jun 2", state: "done" },
];

export function TimelineHeroOpenPlan() {
  return (
    <section className="tl4">
      <div className="tl4-wrap">
        {/* Overture — the spoken idea, before the plan. Decorative, aria-hidden;
            the settled artifact carries the meaning for assistive tech and no-JS.
            Default display:none. */}
        <div className="tl4-overture" aria-hidden>
          <p className="tl4-ov tl4-ov-1">You wrote the plan.</p>
          <p className="tl4-ov tl4-ov-2">Then chased everyone to read it.</p>
          <p className="tl4-ov tl4-ov-3">
            Send{" "}
            <span className="tl4-seed">
              <span className="tl4-seed-words">one link</span>
              <span className="tl4-seed-pill" aria-hidden>
                <span className="tl4-seed-lock" />
                timeline.signalstudio.ie/the-wedding
              </span>
            </span>{" "}
            instead.
          </p>
        </div>

        <p className="tl4-eyebrow">Signal Timeline · Public by default</p>
        <h1 className="tl4-h1">Send one link. Everyone reads the same&nbsp;plan.</h1>
        <p className="tl4-sub">
          A public plan lives at one link. The people who need it open it and read, no account, no app, nothing
          to install. What you publish is exactly what they see.
        </p>

        <div
          className="tl4-frame"
          role="img"
          aria-label="A shared plan open at timeline.signalstudio.ie/the-wedding, viewed as a guest with no account. Now, confirm the florist, this week, waiting on you. Soon, send the invitations, by Friday. Later, draw the seating plan, after RSVPs. Done, venue booked, June 2. No account, no app, they just read it."
        >
          {/* The address line — the URL is the product, kept editorial not a
              browser skin. */}
          <div className="tl4-address">
            <span className="tl4-lock" aria-hidden>
              <svg viewBox="0 0 24 24"><path d="M7 11V8a5 5 0 0110 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor" /></svg>
            </span>
            <span className="tl4-url">
              <span className="tl4-host">timeline.signalstudio.ie</span>
              <span className="tl4-path">/the-wedding</span>
            </span>
            <span className="tl4-open" aria-hidden>Open</span>
          </div>

          <div className="tl4-plan">
            <span className="tl4-sweep" aria-hidden />

            <div className="tl4-mast">
              <p className="tl4-kicker">
                <span className="tl4-live" aria-hidden />
                Public plan · updated 2h ago
              </p>
              <h2 className="tl4-title">Méabh &amp; Grace, the wedding</h2>
              <p className="tl4-read">Viewing as a guest. Read-only, and no account to make.</p>
            </div>

            <ol className="tl4-rows">
              {ROWS.map((r, i) => (
                <li key={r.lane} className={`tl4-row tl4-${r.state}`} style={{ ["--i" as string]: i }}>
                  <span className="tl4-rlane">{r.lane}</span>
                  <span className="tl4-mark" aria-hidden>
                    {r.state === "done" ? (
                      <svg viewBox="0 0 24 24" className="tl4-check">
                        <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span className="tl4-rdot" />
                    )}
                  </span>
                  <span className="tl4-ritem">{r.item}</span>
                  <span className="tl4-rdate">{r.date}</span>
                  {r.chip && <span className="tl4-chip">{r.chip}</span>}
                </li>
              ))}
            </ol>

            <p className="tl4-foot">
              <span className="tl4-avatars" aria-hidden><i /><i /><i /></span>
              Opened by 14 people this week. None of them made an account.
            </p>

            {/* The wall that never drops — a sign-in scrim that dissolves on open. */}
            <div className="tl4-wall" aria-hidden>
              <div className="tl4-wall-card">
                <span className="tl4-wall-lock">Sign in to view</span>
                <span className="tl4-wall-x">not here</span>
              </div>
            </div>
          </div>

          <p className="tl4-ledger">
            <span className="tl4-mark-word">timeline</span>
            <span className="tl4-mark-dot" aria-hidden />
            <span className="tl4-ledger-line">No account. No app. They just read it.</span>
          </p>
        </div>

        <div className="tl4-cta">
          <a className="tl4-cta-primary" href="mailto:hello@signalstudio.ie?subject=Send%20a%20plan">
            Send a plan
          </a>
          <a className="tl4-cta-secondary" href="https://timeline.signalstudio.ie">
            Open a live link
          </a>
        </div>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.tl4{--soft:var(--ink-soft);--faint:var(--ink-faint);
  --hair:var(--hairline);--hair-soft:var(--hairline-soft);
  --ease-rack:var(--ease-out);
  --ease-soft:var(--ease-out);
  --ease-draw:var(--ease-in-out);
  --ease-pencil:var(--ease-in-out);
  position:relative;min-height:92svh;display:flex;align-items:flex-start;background:var(--paper);color:var(--ink);
  font-family:var(--font-geist-sans,system-ui,sans-serif);overflow:hidden;
  background-image:radial-gradient(rgba(17,17,17,.045) 1px,transparent 1px);background-size:26px 26px;
  background-position:center}
.tl4 *{box-sizing:border-box}
.tl4-wrap{position:relative;max-width:720px;margin:0 auto;padding:clamp(64px,9vh,120px) 28px 80px;width:100%}

/* ── Overture: the spoken idea. Default hidden; the settled artifact is canon. ── */
.tl4-overture{display:none}
.tl4-ov{position:absolute;left:28px;right:28px;top:clamp(140px,26vh,300px);margin:0;
  max-width:16ch;font-size:clamp(1.9rem,1rem+3.8vw,3.9rem);line-height:1.02;letter-spacing:-.045em;font-weight:600;
  color:var(--ink);opacity:0}
.tl4-ov-3{color:var(--soft)}
/* The seed "one link": the words and the URL pill share one cell; the words
   condense out and the pill condenses in. */
.tl4-seed{position:relative;display:inline-block;color:var(--ink);font-weight:660;vertical-align:baseline}
.tl4-seed-words{display:inline-block}
.tl4-seed-pill{position:absolute;left:0;top:50%;transform:translateY(-50%) scale(.9);opacity:0;
  display:inline-flex;align-items:center;gap:7px;white-space:nowrap;
  font-family:var(--font-geist-mono,monospace);font-size:.42em;font-weight:500;letter-spacing:.01em;
  color:var(--faint);background:var(--paper-soft);border:1px solid var(--hair);border-radius:999px;padding:.5em .9em}
.tl4-seed-lock{width:.9em;height:.9em;border-radius:2px;background:var(--accent);flex-shrink:0}

.tl4-eyebrow{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.14em;
  text-transform:uppercase;color:var(--faint);margin:0 0 20px}
.tl4-h1{font-size:clamp(2rem,1rem+5vw,4.4rem);line-height:.98;letter-spacing:-.045em;font-weight:600;
  margin:0 0 22px;max-width:15ch}
.tl4-sub{font-size:clamp(15px,.6rem+.6vw,18px);line-height:1.55;color:var(--soft);max-width:50ch;margin:0 0 48px}

/* ── The reading frame ─────────────────────────────────────── */
.tl4-frame{position:relative}

/* Address line — editorial, not a browser skin. */
.tl4-address{display:flex;align-items:center;gap:10px;padding:0 0 16px;margin-bottom:22px;
  border-bottom:1px solid var(--hair)}
.tl4-lock{display:grid;place-items:center;color:var(--accent)}
.tl4-lock svg{width:14px;height:14px}
.tl4-url{flex:1;min-width:0;display:inline-flex;white-space:nowrap;overflow:hidden;
  font-family:var(--font-geist-mono,monospace);font-size:13px;letter-spacing:.01em}
.tl4-host{color:var(--soft)}
.tl4-path{color:var(--accent);font-weight:600}
.tl4-open{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.08em;
  text-transform:uppercase;color:var(--faint);border:1px solid var(--hair);border-radius:999px;padding:5px 12px}

/* The plan itself. */
.tl4-plan{position:relative}
.tl4-sweep{position:absolute;left:0;right:0;top:96px;height:2px;background:var(--accent);
  transform:scaleX(0);opacity:0;transform-origin:left;pointer-events:none;z-index:2}

.tl4-mast{margin-bottom:8px}
.tl4-kicker{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-geist-mono,monospace);
  font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:0 0 12px}
.tl4-live{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.tl4-title{font-size:clamp(22px,1rem+1.8vw,32px);font-weight:600;letter-spacing:-.03em;margin:0 0 8px;line-height:1.04}
.tl4-read{font-size:13px;color:var(--faint);margin:0}

.tl4-rows{position:relative;list-style:none;margin:20px 0 0;padding:0;display:flex;flex-direction:column}
/* Connecting spine through the marks: reads as a timeline, not a doc list. */
.tl4-rows::before{content:"";position:absolute;left:87px;top:26px;bottom:34px;width:2px;
  background:linear-gradient(180deg,var(--accent) 0,var(--hair) 44%,var(--hair) 100%);z-index:0}
.tl4-row{position:relative;display:grid;grid-template-columns:72px 20px 1fr auto;align-items:center;gap:14px;
  padding:16px 0;border-bottom:1px solid var(--hair-soft)}
.tl4-rlane{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.1em;
  text-transform:uppercase;color:var(--faint)}
.tl4-mark{position:relative;z-index:1;display:grid;place-items:center;width:20px;height:20px;justify-self:center}
.tl4-rdot{width:12px;height:12px;border-radius:50%;border:2px solid var(--ink);background:var(--paper);
  box-shadow:0 0 0 3px var(--paper)}
.tl4-ritem{font-size:clamp(15px,.5rem+.6vw,17px);font-weight:500;color:var(--ink);letter-spacing:-.01em}
.tl4-rdate{font-size:12px;color:var(--faint);font-family:var(--font-geist-mono,monospace)}
.tl4-chip{grid-column:3;margin-top:8px;justify-self:start;display:inline-flex;align-items:center;
  font-family:var(--font-geist-mono,monospace);font-size:10px;font-weight:600;letter-spacing:.04em;
  text-transform:uppercase;color:var(--accent);background:var(--accent-tint);border:1px solid var(--accent-soft);
  padding:3px 8px;border-radius:999px}

/* Now — the earned indigo, the only coloured row + a single pulse. */
.tl4-now .tl4-rlane{color:var(--accent)}
.tl4-now .tl4-rdot{background:var(--accent);border-color:var(--accent);
  box-shadow:0 0 0 3px var(--paper),0 0 0 4px rgba(79,70,229,.22)}
.tl4-now .tl4-rdate{color:var(--accent)}
.tl4-now .tl4-mark::before{content:"";position:absolute;inset:0;border-radius:50%;
  border:2px solid var(--accent);opacity:0}
/* Later — quieter. */
.tl4-later .tl4-ritem{color:var(--soft)}
.tl4-later .tl4-rdot{border-color:var(--faint)}
/* Done — settled, checked, muted. */
.tl4-done .tl4-rlane,.tl4-done .tl4-ritem,.tl4-done .tl4-rdate{color:var(--faint)}
.tl4-check{width:20px;height:20px;color:var(--faint)}

.tl4-foot{display:flex;align-items:center;gap:10px;margin:22px 0 0;font-size:12.5px;color:var(--faint)}
.tl4-avatars{display:flex}
.tl4-avatars i{width:18px;height:18px;border-radius:50%;border:2px solid var(--paper);margin-left:-6px;
  background:var(--accent-soft)}
.tl4-avatars i:first-child{margin-left:0}

/* The wall that never drops — hidden at rest, dissolves during intro only. */
.tl4-wall{position:absolute;inset:0;background:rgba(255,255,255,.72);backdrop-filter:blur(3px);
  display:grid;place-items:center;opacity:0;pointer-events:none;z-index:3}
.tl4-wall-card{display:flex;flex-direction:column;align-items:center;gap:6px}
.tl4-wall-lock{font-size:15px;font-weight:600;color:var(--soft)}
.tl4-wall-x{font-family:var(--font-geist-mono,monospace);font-size:11px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--accent);text-decoration:line-through}

/* ── Ledger: wordmark + honest line ─────────────────────────── */
.tl4-ledger{display:flex;align-items:center;gap:10px;margin:32px 0 0;padding-top:22px;
  border-top:1px solid var(--hair-soft);flex-wrap:wrap}
.tl4-mark-word{font-size:15px;font-weight:600;letter-spacing:-.02em;color:var(--ink)}
.tl4-mark-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);margin-left:-4px}
.tl4-ledger-line{margin-left:12px;font-size:13px;line-height:1.45;color:var(--faint)}

/* ── CTA row ─────────────────────────────────────────────── */
.tl4-cta{display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;margin-top:34px}
.tl4-cta-primary{display:inline-flex;align-items:center;padding:9px 16px;background:var(--ink);color:var(--paper);
  font-size:13px;font-weight:540;text-decoration:none;border:1px solid var(--ink);border-radius:3px;
  transition:opacity .16s var(--ease-soft)}
.tl4-cta-primary:hover{opacity:.86}
.tl4-cta-secondary{display:inline-flex;align-items:center;padding:9px 14px;color:var(--soft);font-size:13px;
  text-decoration:none;border:1px solid var(--hair);border-radius:3px;
  transition:color .16s var(--ease-soft),border-color .16s var(--ease-soft)}
.tl4-cta-secondary:hover{color:var(--ink);border-color:var(--faint)}

/* ── Narrow screens ─────────────────────────────────────────── */
@media (max-width:720px){
  .tl4-sub{margin-bottom:36px}
  .tl4-rows::before{display:none}
  .tl4-row{grid-template-columns:64px 20px 1fr;gap:12px}
  .tl4-rdate{grid-column:3;justify-self:start;margin-top:2px}
  .tl4-open{display:none}
  .tl4-ledger{gap:8px}
  .tl4-ledger-line{margin-left:0;flex-basis:100%}
}

/* ── Intro motion, opt-in only. Default above IS the rest state. ── */
@media (prefers-reduced-motion:no-preference){
  /* Hold the headline/artifact hidden until the overture hands off. */
  .tl4-eyebrow{opacity:0;animation:tl4-rise .6s var(--ease-soft) 5.35s forwards}
  .tl4-h1{opacity:0;animation:tl4-rise .7s var(--ease-rack) 5.45s forwards}
  .tl4-sub{opacity:0;animation:tl4-rise .7s var(--ease-soft) 5.6s forwards}
  .tl4-frame{opacity:0;animation:tl4-rise .7s var(--ease-soft) 5.7s forwards}

  /* Show + run the overture: three lines, one at a time, in->hold->out. */
  .tl4-overture{display:block}
  .tl4-ov-1{animation:tl4-ov-inout 2.4s var(--ease-soft) .25s both}
  .tl4-ov-2{animation:tl4-ov-inout 2.4s var(--ease-soft) 2.55s both}
  /* Line 3 sets and holds; carried out by the seed transmutation + layer fade. */
  .tl4-ov-3{animation:tl4-ov-in 1s var(--ease-soft) 4.8s both}
  .tl4-overture{animation:tl4-ov-layer-out .5s var(--ease-soft) 5.6s both}

  /* Transmutation: "one link" condenses out, the URL pill condenses in. */
  .tl4-seed-words{animation:tl4-condense-out .5s var(--ease-rack) 5.45s both}
  .tl4-seed-pill{animation:tl4-condense-in .5s var(--ease-rack) 5.55s both}

  /* Mechanism: the sweep reads the plan, then the wall dissolves to reveal it. */
  .tl4-mast{opacity:0;animation:tl4-rise .5s var(--ease-soft) 6s forwards}
  .tl4-row{opacity:0;animation:tl4-rise .5s var(--ease-soft) forwards;
    animation-delay:calc(6.15s + var(--i) * .12s)}
  .tl4-foot{opacity:0;animation:tl4-rise .5s var(--ease-soft) 6.85s forwards}
  .tl4-sweep{animation:tl4-scan .7s var(--ease-draw) 6.05s forwards}
  .tl4-wall{opacity:1;animation:tl4-wall-out 1.1s var(--ease-rack) 5.95s forwards}
  /* Now marker gets one pulse as the plan settles. */
  .tl4-now .tl4-mark::before{animation:tl4-pulse 1.4s ease-out 6.9s 1}

  .tl4-ledger{opacity:0;animation:tl4-rise .6s var(--ease-soft) 7.2s forwards}
  .tl4-cta{opacity:0;animation:tl4-rise .6s var(--ease-soft) 7.4s forwards}

  /* The sweep gesture — the resting wordmark loop. An indigo dot travels L->R,
     blinks out mid-sweep, and returns. The one allowed loop. */
  .tl4-mark-dot{animation:tl4-markdot 5.2s var(--ease-soft) 7.9s infinite}
}
@keyframes tl4-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes tl4-ov-inout{0%{opacity:0;transform:translateY(12px)}16%{opacity:1;transform:translateY(0)}74%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-9px)}}
@keyframes tl4-ov-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes tl4-ov-layer-out{from{opacity:1}to{opacity:0}}
@keyframes tl4-condense-out{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.86)}}
@keyframes tl4-condense-in{from{opacity:0;transform:translateY(-50%) scale(.9)}60%{opacity:1}to{opacity:1;transform:translateY(-50%) scale(1)}}
@keyframes tl4-scan{0%{opacity:1;transform:scaleX(0)}70%{opacity:1;transform:scaleX(1)}100%{opacity:0;transform:scaleX(1)}}
@keyframes tl4-wall-out{0%{opacity:1}55%{opacity:1}100%{opacity:0}}
@keyframes tl4-pulse{0%{opacity:.5;transform:scale(1)}100%{opacity:0;transform:scale(2.4)}}
/* Resting sweep, expressed as the wordmark dot travelling and returning. */
@keyframes tl4-markdot{
  0%{transform:translateX(-4px)}
  6%{opacity:1}
  44%{opacity:1;transform:translateX(3px)}
  50%{opacity:0;transform:translateX(3px)}
  56%{opacity:0;transform:translateX(-4px)}
  62%{opacity:1;transform:translateX(-4px)}
  100%{transform:translateX(-4px)}
}
`;
