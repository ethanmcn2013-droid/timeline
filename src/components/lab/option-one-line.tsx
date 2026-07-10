import Link from "next/link";

/**
 * Direction — "One Line" (flagship).
 *
 * The sentence and the product share one physical line. During the intro the
 * real timeline axis sits beneath the words "one line"; that same element then
 * moves into the public-plan artifact and opens to full length. The dated
 * moments arrive as the line reaches them. A single, small wordmark sweep closes
 * the sequence, then every part of the hero is still.
 *
 * Default CSS is the settled artifact. SSR, no-JS, and reduced-motion all get
 * the complete public plan immediately. Intro motion is opt-in only.
 */

type Node = {
  lane: string;
  item: string;
  due: string;
  state: "now" | "soon" | "later" | "done";
  status?: string;
};

const NODES: Node[] = [
  {
    lane: "Now",
    item: "Confirm the florist",
    due: "this week",
    state: "now",
    status: "Waiting on you",
  },
  {
    lane: "Soon",
    item: "Send the invitations",
    due: "by Friday",
    state: "soon",
  },
  {
    lane: "Later",
    item: "Draw the seating plan",
    due: "after RSVPs",
    state: "later",
  },
  {
    lane: "Done",
    item: "Venue booked",
    due: "Jun 2",
    state: "done",
  },
];

export function TimelineHeroOneLine() {
  return (
    <section className="tl3" aria-labelledby="tl3-title">
      <div className="tl3-wrap">
        <header className="tl3-anchor">
          <p className="tl3-anchor-label">Signal Timeline · Public plan</p>
          <Link
            href="/the-wedding"
            className="tl3-anchor-link"
            aria-label="Open the public wedding plan"
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path
                d="M7 11V8a5 5 0 0110 0v3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor" />
            </svg>
            <span>timeline.signalstudio.ie/the-wedding</span>
            <span className="tl3-anchor-state">read-only</span>
          </Link>
        </header>

        <div className="tl3-stage">
          <div className="tl3-overture" aria-hidden="true">
            <p className="tl3-ov tl3-ov-1">Plans live in a dozen places.</p>
            <p className="tl3-ov tl3-ov-2">Nobody sees the whole thing.</p>
            <p className="tl3-ov tl3-ov-3">
              <span>Put it on</span>
              <span className="tl3-seed">one line.</span>
            </p>
          </div>

          <div className="tl3-artifact">
            <div className="tl3-copy">
              <p className="tl3-eyebrow">Signal Timeline · Direction clarity</p>
              <h1 id="tl3-title" className="tl3-h1">
                Put the whole plan on one&nbsp;line.
              </h1>
              <p className="tl3-sub">
                A public plan in plain English. What is moving now, what comes next,
                and what is already done, shared at one link anyone can read.
              </p>
            </div>

            <article className="tl3-plan" aria-labelledby="tl3-plan-title">
              <header className="tl3-plan-head">
                <div>
                  <p className="tl3-plan-kicker">The wedding · Public</p>
                  <h2 id="tl3-plan-title" className="tl3-plan-title">
                    Méabh &amp; Grace
                  </h2>
                </div>
                <p className="tl3-updated">Updated today</p>
              </header>

              <div className="tl3-plot">
                {/* This is both the phrase underline and the final timeline axis. */}
                <span className="tl3-axis" aria-hidden="true" />
                <ol className="tl3-nodes">
                  {NODES.map((node, index) => (
                    <li
                      key={node.lane}
                      className={`tl3-node tl3-${node.state}`}
                      style={{ ["--i" as string]: index }}
                    >
                      <span className="tl3-lane">{node.lane}</span>
                      <span className="tl3-mark" aria-hidden="true">
                        {node.state === "done" ? (
                          <svg viewBox="0 0 24 24" className="tl3-check">
                            <path
                              d="M5 12.5l4.2 4.2L19 7"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <span className="tl3-dot" />
                        )}
                      </span>
                      <span className="tl3-item">{node.item}</span>
                      <span className="tl3-due">{node.due}</span>
                      {node.status ? <span className="tl3-status">{node.status}</span> : null}
                    </li>
                  ))}
                </ol>
              </div>

              <footer className="tl3-ledger">
                <span className="tl3-wordmark" aria-label="Timeline">
                  timeline<span className="tl3-wordmark-dot" aria-hidden="true" />
                </span>
                <span className="tl3-ledger-copy">
                  Four moments shown. One public plan. One link to share.
                </span>
              </footer>
            </article>

            <nav className="tl3-cta" aria-label="Timeline hero actions">
              <Link className="tl3-cta-primary" href="/the-wedding">
                Open the wedding plan
              </Link>
              <Link className="tl3-cta-secondary" href="/demo">
                See how Timeline works
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.tl3{
  position:relative;
  min-height:92svh;
  overflow:hidden;
  background:var(--paper);
  color:var(--ink);
  font-family:var(--font-geist-sans,system-ui,sans-serif);
}
.tl3 *{box-sizing:border-box}
.tl3-wrap{width:min(1160px,100%);margin:0 auto;padding:clamp(44px,6vh,76px) 28px 72px}

/* Crisp from frame zero: the public location and reading posture never move. */
.tl3-anchor{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-bottom:16px;
  border-bottom:1px solid var(--hairline)}
.tl3-anchor-label{margin:0;font-family:var(--font-geist-mono,ui-monospace,monospace);font-size:10.5px;
  font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint)}
.tl3-anchor-link{display:inline-flex;align-items:center;gap:8px;min-width:0;padding:6px 10px;border:1px solid var(--hairline);
  border-radius:999px;color:var(--ink-soft);font-family:var(--font-geist-mono,ui-monospace,monospace);font-size:11px;
  text-decoration:none;transition:border-color .18s var(--ease-out),color .18s var(--ease-out)}
.tl3-anchor-link svg{width:12px;height:12px;color:var(--accent);flex:0 0 auto}
.tl3-anchor-link>span:first-of-type{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tl3-anchor-state{padding-left:8px;border-left:1px solid var(--hairline);color:var(--ink-faint);letter-spacing:.06em;
  text-transform:uppercase;font-size:9.5px}
.tl3-anchor-link:hover{border-color:var(--accent);color:var(--ink)}

.tl3-stage{position:relative}
.tl3-overture{display:none}
.tl3-ov{position:absolute;left:0;top:clamp(72px,10vh,108px);z-index:3;margin:0;max-width:18ch;
  font-size:clamp(34px,5vw,62px);font-weight:620;line-height:1.02;letter-spacing:-.042em;color:var(--ink);opacity:0}
.tl3-ov-3>span{display:block}
.tl3-seed{width:max-content;color:var(--ink);font-weight:680}

.tl3-copy{padding-top:clamp(44px,7vh,82px);margin-bottom:38px}
.tl3-eyebrow{margin:0 0 16px;font-family:var(--font-geist-mono,ui-monospace,monospace);font-size:11px;
  font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint)}
.tl3-h1{max-width:15ch;margin:0 0 20px;font-size:clamp(38px,6vw,76px);font-weight:620;line-height:.96;
  letter-spacing:-.046em;text-wrap:balance}
.tl3-sub{max-width:54ch;margin:0;font-size:clamp(15px,.6rem + .6vw,18px);line-height:1.55;color:var(--ink-soft);
  text-wrap:pretty}

.tl3-plan{position:relative;padding:24px 26px 22px;border-radius:12px;background:var(--paper)}
.tl3-plan::before{content:"";position:absolute;inset:0;border:1px solid var(--hairline);border-radius:12px;
  box-shadow:0 30px 70px -54px rgba(17,17,17,.38);pointer-events:none;opacity:1}
.tl3-plan-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;padding-bottom:18px;
  margin-bottom:24px;border-bottom:1px solid var(--hairline-soft)}
.tl3-plan-kicker{margin:0 0 7px;font-family:var(--font-geist-mono,ui-monospace,monospace);font-size:10px;
  font-weight:600;letter-spacing:.13em;text-transform:uppercase;color:var(--ink-faint)}
.tl3-plan-title{margin:0;font-size:clamp(22px,2.5vw,30px);font-weight:620;line-height:1;letter-spacing:-.032em}
.tl3-updated{margin:0;font-family:var(--font-geist-mono,ui-monospace,monospace);font-size:10.5px;
  letter-spacing:.06em;text-transform:uppercase;color:var(--ink-faint);white-space:nowrap}

.tl3-plot{position:relative;padding-top:1px}
.tl3-axis{position:absolute;left:15px;right:0;top:40px;height:3px;border-radius:2px;
  background:linear-gradient(90deg,var(--ink) 0 66%,var(--hairline) 100%);transform-origin:left center;
  clip-path:inset(0 0 0 0)}
.tl3-nodes{position:relative;list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
.tl3-node{position:relative;display:grid;grid-template-rows:auto 30px auto auto auto;justify-items:start;min-width:0}
.tl3-lane{margin-bottom:10px;font-family:var(--font-geist-mono,ui-monospace,monospace);font-size:10.5px;
  font-weight:600;letter-spacing:.11em;text-transform:uppercase;color:var(--ink-faint)}
.tl3-mark{position:relative;z-index:1;display:grid;place-items:center;width:30px;height:30px;margin-bottom:13px}
.tl3-dot{width:14px;height:14px;border:2px solid var(--ink);border-radius:50%;background:var(--paper);
  box-shadow:0 0 0 5px var(--paper)}
.tl3-item{max-width:16ch;font-size:clamp(15px,.5rem + .65vw,18px);font-weight:520;line-height:1.24;
  letter-spacing:-.012em;color:var(--ink);text-wrap:pretty}
.tl3-due{margin-top:6px;font-family:var(--font-geist-mono,ui-monospace,monospace);font-size:10.5px;
  letter-spacing:.03em;color:var(--ink-faint)}
.tl3-status{margin-top:10px;padding:4px 8px;border:1px solid rgba(79,70,229,.22);border-radius:999px;
  background:var(--accent-tint);color:var(--accent);font-family:var(--font-geist-mono,ui-monospace,monospace);
  font-size:9.5px;font-weight:600;letter-spacing:.055em;text-transform:uppercase;white-space:nowrap}
.tl3-now .tl3-lane,.tl3-now .tl3-due{color:var(--accent)}
.tl3-now .tl3-dot{border-color:var(--accent);background:var(--accent);
  box-shadow:0 0 0 5px var(--paper),0 0 0 6px rgba(79,70,229,.22)}
.tl3-now .tl3-mark::before{content:"";position:absolute;inset:2px;border:2px solid var(--accent);border-radius:50%;opacity:0}
.tl3-later .tl3-item{color:var(--ink-soft)}
.tl3-later .tl3-dot{border-color:var(--ink-faint)}
.tl3-done .tl3-lane,.tl3-done .tl3-item,.tl3-done .tl3-due{color:var(--ink-faint)}
.tl3-check{width:24px;height:24px;color:var(--ink-faint)}

.tl3-ledger{display:flex;align-items:center;gap:16px;margin-top:36px;padding-top:18px;border-top:1px solid var(--hairline-soft)}
.tl3-wordmark{display:inline-flex;align-items:flex-end;font-size:15px;font-weight:620;letter-spacing:-.025em;color:var(--ink)}
.tl3-wordmark-dot{display:inline-block;width:6px;height:6px;margin:0 0 2px 3px;border-radius:50%;background:var(--accent)}
.tl3-ledger-copy{font-size:12.5px;line-height:1.45;color:var(--ink-faint)}

.tl3-cta{display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;margin-top:26px}
.tl3-cta a{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:9px 15px;border-radius:4px;
  font-size:13px;font-weight:550;text-decoration:none;transition:transform .18s var(--ease-out),border-color .18s var(--ease-out),
  color .18s var(--ease-out),background .18s var(--ease-out)}
.tl3-cta-primary{border:1px solid var(--ink);background:var(--ink);color:var(--paper)}
.tl3-cta-primary:hover{transform:translateY(-1px);background:var(--ink-soft)}
.tl3-cta-secondary{border:1px solid var(--hairline);color:var(--ink-soft);background:var(--paper)}
.tl3-cta-secondary:hover{transform:translateY(-1px);border-color:var(--ink-faint);color:var(--ink)}
.tl3 a:focus-visible{outline:2px solid var(--accent);outline-offset:3px}

@media (max-width:720px){
  .tl3{--tl3-axis-seed-y:clamp(-335px,calc(111.4vw - 691.5px),-257px);--tl3-axis-seed-scale:.4}
  .tl3-wrap{padding:34px 20px 56px}
  .tl3-anchor{align-items:flex-start;flex-direction:column;gap:10px}
  .tl3-anchor-link{max-width:100%}
  .tl3-anchor-state{display:none}
  .tl3-copy{padding-top:42px;margin-bottom:32px}
  .tl3-h1{font-size:clamp(38px,12vw,58px)}
  .tl3-plan{padding:20px 18px}
  .tl3-plan-head{align-items:flex-start}
  .tl3-updated{padding-top:2px}
  .tl3-nodes{display:flex;flex-direction:column;gap:26px}
  .tl3-node{display:grid;grid-template-columns:52px 30px minmax(0,1fr);grid-template-areas:
      "lane mark item" ". . due" ". . status";column-gap:14px;row-gap:5px;align-items:start;min-height:62px}
  .tl3-lane{grid-area:lane;margin:7px 0 0}
  .tl3-mark{grid-area:mark;margin:0}
  .tl3-item{grid-area:item;max-width:none;padding-top:4px}
  .tl3-due{grid-area:due;margin:0}
  .tl3-status{grid-area:status;margin:3px 0 0;width:max-content}
  .tl3-axis{left:79.5px;right:auto;top:15px;bottom:15px;width:3px;height:auto;
    background:linear-gradient(180deg,var(--ink) 0 66%,var(--hairline) 100%);transform-origin:top center}
  .tl3-ledger{align-items:flex-start;flex-direction:column;gap:8px;margin-top:30px}
  .tl3-cta{align-items:stretch;flex-direction:column}
  .tl3-cta a{width:100%}
  .tl3-ov{top:76px;font-size:clamp(34px,11vw,48px)}
}

@media (max-width:360px){
  .tl3{--tl3-axis-seed-scale:.31}
}

/* Intro only. The rest state above remains the SSR and reduced-motion truth. */
@media (prefers-reduced-motion:no-preference){
  .tl3-overture{display:block}
  .tl3-ov-1{animation:tl3-ov-inout 2.15s var(--ease-out) .2s both}
  .tl3-ov-2{animation:tl3-ov-inout 2.15s var(--ease-out) 2.25s both}
  .tl3-ov-3{animation:tl3-ov-last 1.7s var(--ease-out) 4.3s both}
  .tl3-copy>*{opacity:0;animation:tl3-rise .62s var(--ease-out) forwards}
  .tl3-eyebrow{animation-delay:5.45s}
  .tl3-h1{animation-delay:5.55s}
  .tl3-sub{animation-delay:5.68s}
  .tl3-plan-head{opacity:0;animation:tl3-rise .56s var(--ease-out) 5.7s forwards}
  .tl3-plan::before{opacity:0;animation:tl3-shell-in .55s var(--ease-out) 5.55s forwards}
  .tl3-axis{opacity:0;animation:tl3-axis-transfer 1.15s var(--ease-in-out) 4.82s both}
  .tl3-node{opacity:0;animation:tl3-node-in .48s var(--ease-out) forwards;
    animation-delay:calc(5.62s + var(--i) * .22s)}
  .tl3-now .tl3-mark::before{animation:tl3-pulse 1.2s var(--ease-out) 6.45s 1}
  .tl3-ledger{opacity:0;animation:tl3-rise .55s var(--ease-out) 6.65s forwards}
  .tl3-cta{opacity:0;animation:tl3-rise .55s var(--ease-out) 6.85s forwards}
  .tl3-wordmark-dot{animation:tl3-wordmark-sweep 1.05s var(--ease-out) 7.05s 1 both}
}

@media (max-width:720px) and (prefers-reduced-motion:no-preference){
  .tl3-axis{animation-name:tl3-axis-transfer-mobile}
}

@keyframes tl3-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes tl3-shell-in{from{opacity:0}to{opacity:1}}
@keyframes tl3-node-in{from{opacity:0;transform:translateY(9px);clip-path:inset(0 0 18% 0)}to{opacity:1;transform:none;clip-path:inset(0)}}
@keyframes tl3-ov-inout{0%{opacity:0;transform:translateY(12px)}16%{opacity:1;transform:none}74%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-8px)}}
@keyframes tl3-ov-last{0%{opacity:0;transform:translateY(12px)}20%,68%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-5px)}}
@keyframes tl3-axis-transfer{
  0%{opacity:0;transform:translate(-41px,-296px);clip-path:inset(0 calc(100% - clamp(158px,20.7vw,228px)) 0 0)}
  12%,38%{opacity:1;transform:translate(-41px,-296px);clip-path:inset(0 calc(100% - clamp(158px,20.7vw,228px)) 0 0)}
  100%{opacity:1;transform:none;clip-path:inset(0)}
}
@keyframes tl3-axis-transfer-mobile{
  0%{opacity:0;transform:translate(-97.5px,var(--tl3-axis-seed-y)) rotate(-90deg) scaleY(var(--tl3-axis-seed-scale));clip-path:inset(0)}
  12%,38%{opacity:1;transform:translate(-97.5px,var(--tl3-axis-seed-y)) rotate(-90deg) scaleY(var(--tl3-axis-seed-scale));clip-path:inset(0)}
  100%{opacity:1;transform:none;clip-path:inset(0)}
}
@keyframes tl3-pulse{0%{opacity:.5;transform:scale(1)}100%{opacity:0;transform:scale(2.35)}}
@keyframes tl3-wordmark-sweep{
  0%{opacity:1;transform:translateX(0)}
  42%{opacity:1;transform:translateX(4px)}
  50%{opacity:0;transform:translateX(4px)}
  58%{opacity:0;transform:translateX(0)}
  100%{opacity:1;transform:translateX(0)}
}
`;
