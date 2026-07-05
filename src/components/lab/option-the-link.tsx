/**
 * Direction 2 — "The Link" (polished).
 *
 * The URL is the product, so the URL is the hero. The shared link sits in a
 * browser bar and opens with no wall in front of it: the plan unfolds exactly
 * as the person on the other end sees it. No account, no app, nothing to decode.
 *
 * Pure CSS, server-rendered. Default styles ARE the rest state (opened plan);
 * intro plays only under `prefers-reduced-motion: no-preference`. Scoped `tl2-`.
 */

type Row = { lane: string; item: string; meta: string; state: "now" | "soon" | "later" | "refused" };

const ROWS: Row[] = [
  { lane: "Now", item: "Confirm the florist", meta: "Waiting on you", state: "now" },
  { lane: "Soon", item: "Send the invitations", meta: "by Friday", state: "soon" },
  { lane: "Later", item: "Draw the seating plan", meta: "after RSVPs", state: "later" },
  { lane: "Refused", item: "A second venue viewing", meta: "decided Jun 3", state: "refused" },
];

export function TimelineHeroLink() {
  return (
    <section className="tl2">
      <div className="tl2-wrap">
        <div className="tl2-copy">
          <p className="tl2-eyebrow">Signal Timeline · Public by default</p>
          <h1 className="tl2-h1">Send the link. They just read&nbsp;it.</h1>
          <p className="tl2-sub">
            A public plan lives at one link. The people who need it open it and read, no account, no app,
            nothing to install. What you publish is exactly what they see.
          </p>
          <p className="tl2-proof">
            <span className="tl2-proof-dot" aria-hidden />
            No sign-in. The plan is the page.
          </p>
        </div>

        <div className="tl2-stage">
          <div className="tl2-browser" role="img" aria-label="A browser showing timeline.signalstudio.ie/the-wedding: a public plan with Now, confirm the florist; Soon, send the invitations; Later, draw the seating plan. No account required.">
            <div className="tl2-chrome">
              <span className="tl2-lights" aria-hidden><i /><i /><i /></span>
              <div className="tl2-omni">
                <svg className="tl2-lock" viewBox="0 0 24 24" aria-hidden><path d="M7 11V8a5 5 0 0110 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor" /></svg>
                <span className="tl2-url"><span className="tl2-host">timeline.signalstudio.ie</span><span className="tl2-path">/the-wedding</span></span>
                <span className="tl2-caret" aria-hidden />
              </div>
              <span className="tl2-tab">Share ▸</span>
            </div>

            <div className="tl2-sweep" aria-hidden />

            <div className="tl2-page">
              <div className="tl2-mast">
                <p className="tl2-kicker">Public plan · updated today</p>
                <h2 className="tl2-title">Méabh &amp; Grace, the wedding</h2>
                <p className="tl2-read">Read-only. Anyone with the link can see the direction.</p>
              </div>

              <ol className="tl2-lanes">
                {ROWS.map((r, i) => (
                  <li key={r.lane} className={`tl2-row tl2-${r.state}`} style={{ ["--i" as string]: i }}>
                    <span className="tl2-rlane">{r.lane}</span>
                    <span className="tl2-rdot" aria-hidden />
                    <span className="tl2-ritem">{r.item}</span>
                    <span className="tl2-rmeta">{r.meta}</span>
                  </li>
                ))}
              </ol>

              <p className="tl2-foot">
                <span className="tl2-avatars" aria-hidden><i /><i /><i /></span>
                Opened by 14 people this week. None of them made an account.
              </p>
            </div>

            {/* The wall that never drops — a sign-in scrim that dissolves on open. */}
            <div className="tl2-wall" aria-hidden>
              <div className="tl2-wall-card">
                <span className="tl2-wall-lock">Sign in to view</span>
                <span className="tl2-wall-x">not here</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.tl2{--ink:#111;--soft:#3f3f46;--faint:#71717a;--accent:#4f46e5;--paper:#fff;--hair:rgba(17,17,17,.1);
  min-height:92svh;display:flex;align-items:center;background:var(--paper);color:var(--ink);
  font-family:var(--font-geist-sans,system-ui,sans-serif)}
.tl2-wrap{max-width:1200px;margin:0 auto;padding:72px 28px;width:100%;
  display:grid;grid-template-columns:1fr 1.05fr;gap:56px;align-items:center}
@media (max-width:900px){.tl2-wrap{grid-template-columns:1fr;gap:40px}}

.tl2-eyebrow{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.14em;
  text-transform:uppercase;color:var(--faint);margin:0 0 20px}
.tl2-h1{font-size:clamp(2rem,1rem+4.4vw,4.1rem);line-height:.98;letter-spacing:-.04em;font-weight:600;margin:0 0 20px;max-width:14ch}
.tl2-sub{font-size:clamp(15px,.6rem+.5vw,17.5px);line-height:1.55;color:var(--soft);max-width:46ch;margin:0 0 22px}
.tl2-proof{display:inline-flex;align-items:center;gap:9px;font-size:13px;color:var(--faint);margin:0}
.tl2-proof-dot{width:7px;height:7px;border-radius:50%;background:#15803d;box-shadow:0 0 0 4px rgba(21,128,61,.12)}

/* ── Browser ─────────────────────────────────────────────── */
.tl2-stage{position:relative}
.tl2-browser{position:relative;border:1px solid var(--hair);border-radius:14px;overflow:hidden;background:var(--paper);
  box-shadow:0 30px 70px -40px rgba(17,17,17,.4),0 8px 24px -18px rgba(17,17,17,.3)}
.tl2-chrome{display:flex;align-items:center;gap:12px;padding:11px 14px;background:#fafafa;border-bottom:1px solid var(--hair)}
.tl2-lights{display:flex;gap:6px}
.tl2-lights i{width:11px;height:11px;border-radius:50%;background:#e4e4e7}
.tl2-omni{flex:1;display:flex;align-items:center;gap:8px;height:32px;padding:0 12px;background:var(--paper);
  border:1px solid var(--hair);border-radius:8px;font-family:var(--font-geist-mono,monospace);font-size:12.5px}
.tl2-lock{width:13px;height:13px;color:#15803d;flex-shrink:0}
.tl2-url{color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tl2-host{color:var(--soft)}
.tl2-path{color:var(--accent);font-weight:600}
.tl2-caret{width:1.5px;height:15px;background:var(--accent);opacity:0}
.tl2-tab{font-family:var(--font-geist-mono,monospace);font-size:11.5px;color:var(--accent);white-space:nowrap}

.tl2-sweep{position:absolute;left:0;right:0;top:55px;height:2px;background:var(--accent);transform:scaleX(0);opacity:0;transform-origin:left}

.tl2-page{padding:30px 30px 26px}
.tl2-mast{border-bottom:1px solid var(--hair);padding-bottom:20px;margin-bottom:6px}
.tl2-kicker{font-family:var(--font-geist-mono,monospace);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:0 0 10px}
.tl2-title{font-size:clamp(20px,1rem+1.4vw,29px);font-weight:600;letter-spacing:-.03em;margin:0 0 8px;line-height:1.05}
.tl2-read{font-size:13px;color:var(--faint);margin:0}

.tl2-lanes{list-style:none;margin:14px 0 0;padding:0;display:flex;flex-direction:column}
.tl2-row{display:grid;grid-template-columns:56px 16px 1fr auto;align-items:center;gap:12px;padding:15px 0;border-bottom:1px solid rgba(17,17,17,.06)}
.tl2-rlane{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}
.tl2-rdot{width:11px;height:11px;border-radius:50%;border:2px solid var(--faint);justify-self:center}
.tl2-ritem{font-size:15.5px;font-weight:500;color:var(--ink);letter-spacing:-.01em}
.tl2-rmeta{font-size:12px;color:var(--faint);font-family:var(--font-geist-mono,monospace)}
.tl2-now .tl2-rlane{color:var(--accent)}
.tl2-now .tl2-rdot{background:var(--accent);border-color:var(--accent);box-shadow:0 0 0 4px rgba(79,70,229,.14)}
.tl2-now .tl2-rmeta{color:#1d6fa3}
.tl2-later .tl2-ritem{color:var(--soft)}
/* Refused — the honest bucket. Dated, no apology, no colour. */
.tl2-refused .tl2-rlane,.tl2-refused .tl2-ritem{color:var(--faint)}
.tl2-refused .tl2-rdot{border:none;width:12px;height:2px;border-radius:2px;background:var(--faint)}
.tl2-refused .tl2-rmeta{color:var(--faint)}

.tl2-foot{display:flex;align-items:center;gap:10px;margin:20px 0 0;font-size:12.5px;color:var(--faint)}
.tl2-avatars{display:flex}
.tl2-avatars i{width:18px;height:18px;border-radius:50%;border:2px solid var(--paper);margin-left:-6px;
  background:linear-gradient(135deg,#c7d2fe,#a5b4fc)}
.tl2-avatars i:first-child{margin-left:0}

/* The wall that never drops. */
.tl2-wall{position:absolute;inset:52px 0 0;background:rgba(255,255,255,.72);backdrop-filter:blur(3px);
  display:grid;place-items:center;opacity:0;pointer-events:none}
.tl2-wall-card{display:flex;flex-direction:column;align-items:center;gap:6px}
.tl2-wall-lock{font-size:14px;font-weight:600;color:var(--soft)}
.tl2-wall-x{font-family:var(--font-geist-mono,monospace);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);text-decoration:line-through}

@media (prefers-reduced-motion:no-preference){
  .tl2-copy>*{opacity:0;animation:tl2-rise .6s ease forwards}
  .tl2-eyebrow{animation-delay:.05s}.tl2-h1{animation-delay:.14s}.tl2-sub{animation-delay:.24s}.tl2-proof{animation-delay:.34s}
  .tl2-browser{opacity:0;animation:tl2-lift .8s cubic-bezier(.2,.7,.2,1) .3s forwards}
  .tl2-caret{animation:tl2-blink 1s step-end .9s 3}
  .tl2-path{background:linear-gradient(90deg,rgba(79,70,229,.18),rgba(79,70,229,.18));background-size:0% 100%;
    background-repeat:no-repeat;animation:tl2-hi .5s ease 1.2s forwards}
  .tl2-sweep{animation:tl2-scan .7s cubic-bezier(.4,.6,.2,1) .95s forwards}
  /* Plan is populated BEHIND the wall, then the wall lifts to reveal it. */
  .tl2-mast,.tl2-row,.tl2-foot{opacity:0;animation:tl2-rise .5s ease forwards}
  .tl2-mast{animation-delay:.95s}
  .tl2-row{animation-delay:calc(1.1s + var(--i) * .12s)}
  .tl2-foot{animation-delay:1.7s}
  .tl2-wall{animation:tl2-drop 1.5s ease .9s forwards}
}
@keyframes tl2-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes tl2-lift{from{opacity:0;transform:translateY(26px) scale(.985)}to{opacity:1;transform:none}}
@keyframes tl2-blink{50%{opacity:1}0%,100%{opacity:0}}
@keyframes tl2-hi{to{background-size:100% 100%}}
@keyframes tl2-scan{0%{opacity:1;transform:scaleX(0)}70%{opacity:1;transform:scaleX(1)}100%{opacity:0;transform:scaleX(1)}}
@keyframes tl2-drop{0%{opacity:1}70%{opacity:1}100%{opacity:0}}
`;
