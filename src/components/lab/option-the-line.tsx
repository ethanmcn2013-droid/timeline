import Link from "next/link";

/**
 * Direction — "The Line" (quiet counterpoint).
 *
 * One editorial rule is present from frame zero. Three short sentences establish
 * the job, then the rule reads left to right and the real dated plan settles onto
 * it. This keeps the original direction's restraint while giving the motion a
 * product argument. It plays once and stops.
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

export function TimelineHeroLine() {
  return (
    <section className="tl1" aria-labelledby="tl1-title">
      <div className="tl1-wrap">
        <div className="tl1-folio">
          <span className="tl1-folio-name">The plan</span>
          <span className="tl1-folio-rule" aria-hidden="true" />
          <Link
            href="/the-wedding"
            className="tl1-folio-link"
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
            timeline.signalstudio.ie/the-wedding
          </Link>
        </div>

        <div className="tl1-stage">
          <div className="tl1-intro" aria-hidden="true">
            <p className="tl1-intro-line tl1-intro-1">Plans move.</p>
            <p className="tl1-intro-line tl1-intro-2">The direction stays clear.</p>
            <p className="tl1-intro-line tl1-intro-3">One public line.</p>
          </div>

          <header className="tl1-copy">
            <p className="tl1-eyebrow">Signal Timeline · Public plan</p>
            <h1 id="tl1-title" className="tl1-h1">
              The plan, on one&nbsp;line.
            </h1>
            <p className="tl1-sub">
              Now, next, later, and done — one public plan in plain English,
              dated and easy to share.
            </p>
          </header>

          <article className="tl1-timeline" aria-labelledby="tl1-plan-title">
            <h2 id="tl1-plan-title" className="tl1-sr-only">
              Public wedding plan
            </h2>

            <div className="tl1-plot">
              <span className="tl1-track-base" aria-hidden="true" />
              <span className="tl1-track-fill" aria-hidden="true" />
              <ol className="tl1-nodes">
                {NODES.map((node, index) => (
                  <li
                    key={node.lane}
                    className={`tl1-node tl1-${node.state}`}
                    style={{ ["--i" as string]: index }}
                  >
                    <span className="tl1-lane">{node.lane}</span>
                    <span className="tl1-mark" aria-hidden="true">
                      {node.state === "done" ? (
                        <svg viewBox="0 0 24 24" className="tl1-check">
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
                        <span className="tl1-dot" />
                      )}
                    </span>
                    <span className="tl1-item">{node.item}</span>
                    <span className="tl1-due">{node.due}</span>
                    {node.status ? <span className="tl1-status">{node.status}</span> : null}
                  </li>
                ))}
              </ol>
            </div>

            <p className="tl1-coda">
              <span className="tl1-coda-label">Set aside</span>
              <span className="tl1-coda-dash" aria-hidden="true" />
              <span className="tl1-coda-item">A second venue viewing</span>
              <span className="tl1-coda-date">decided Jun 3</span>
            </p>

            <footer className="tl1-ledger">
              <span className="tl1-wordmark" aria-label="Timeline">
                timeline<span className="tl1-wordmark-dot" aria-hidden="true" />
              </span>
              <span>Four dated moments. One public plan. Nothing hidden.</span>
            </footer>
          </article>

          <nav className="tl1-cta" aria-label="Timeline hero actions">
            <Link className="tl1-cta-primary" href="/the-wedding">
              Open the wedding plan
            </Link>
            <Link className="tl1-cta-secondary" href="/demo">
              See how Timeline works
            </Link>
          </nav>
        </div>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.tl1{
  min-height:92svh;
  overflow:hidden;
  background-color:var(--paper);
  background-image:radial-gradient(rgba(17,17,17,.035) 1px,transparent 1px);
  background-position:center;
  background-size:28px 28px;
  color:var(--ink);
  font-family:var(--font-geist-sans,system-ui,sans-serif);
}
.tl1 *{box-sizing:border-box}
.tl1-wrap{width:min(1160px,100%);margin:0 auto;padding:clamp(44px,6vh,76px) 28px 72px}
.tl1-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);
  white-space:nowrap;border:0}

/* The editorial folio is the fixed anchor from the first frame onward. */
.tl1-folio{display:flex;align-items:center;gap:14px;padding-bottom:16px;border-bottom:1px solid var(--hairline)}
.tl1-folio-name{font-family:var(--font-geist-mono,ui-monospace,monospace);font-size:10.5px;font-weight:600;
  letter-spacing:.13em;text-transform:uppercase;color:var(--ink);white-space:nowrap}
.tl1-folio-rule{flex:1;height:1px;background:var(--hairline)}
.tl1-folio-link{display:inline-flex;align-items:center;gap:7px;min-width:0;padding:6px 10px;border:1px solid var(--hairline);
  border-radius:999px;color:var(--ink-faint);font-family:var(--font-geist-mono,ui-monospace,monospace);font-size:10.5px;
  text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  transition:border-color .18s var(--ease-out),color .18s var(--ease-out)}
.tl1-folio-link svg{width:12px;height:12px;color:var(--accent);flex:0 0 auto}
.tl1-folio-link:hover{border-color:var(--accent);color:var(--ink)}

.tl1-stage{position:relative}
.tl1-intro{display:none}
.tl1-intro-line{position:absolute;left:0;top:clamp(68px,9vh,98px);z-index:3;margin:0;max-width:19ch;
  font-size:clamp(32px,4.6vw,56px);font-weight:620;line-height:1.03;letter-spacing:-.04em;color:var(--ink);opacity:0}

.tl1-copy{padding-top:clamp(44px,7vh,82px);margin-bottom:44px}
.tl1-eyebrow{margin:0 0 16px;font-family:var(--font-geist-mono,ui-monospace,monospace);font-size:11px;
  font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint)}
.tl1-h1{max-width:15ch;margin:0 0 20px;font-size:clamp(38px,6vw,76px);font-weight:620;line-height:.96;
  letter-spacing:-.046em;text-wrap:balance}
.tl1-sub{max-width:50ch;margin:0;font-size:clamp(15px,.6rem + .6vw,18px);line-height:1.55;color:var(--ink-soft);
  text-wrap:pretty}

.tl1-timeline{position:relative}
.tl1-plot{position:relative;padding-top:1px}
.tl1-track-base,.tl1-track-fill{position:absolute;left:15px;right:0;top:40px;height:2px;border-radius:2px;
  transform-origin:left center}
.tl1-track-base{background:var(--hairline)}
.tl1-track-fill{background:linear-gradient(90deg,var(--ink) 0 66%,var(--hairline) 100%)}
.tl1-nodes{position:relative;list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
.tl1-node{position:relative;display:grid;grid-template-rows:auto 30px auto auto auto;justify-items:start;min-width:0}
.tl1-lane{margin-bottom:10px;font-family:var(--font-geist-mono,ui-monospace,monospace);font-size:10.5px;
  font-weight:600;letter-spacing:.11em;text-transform:uppercase;color:var(--ink-faint)}
.tl1-mark{position:relative;z-index:1;display:grid;place-items:center;width:30px;height:30px;margin-bottom:13px}
.tl1-dot{width:14px;height:14px;border:2px solid var(--ink);border-radius:50%;background:var(--paper);
  box-shadow:0 0 0 5px var(--paper)}
.tl1-item{max-width:16ch;font-size:clamp(15px,.5rem + .65vw,18px);font-weight:520;line-height:1.24;
  letter-spacing:-.012em;color:var(--ink);text-wrap:pretty}
.tl1-due{margin-top:6px;font-family:var(--font-geist-mono,ui-monospace,monospace);font-size:10.5px;
  letter-spacing:.03em;color:var(--ink-faint)}
.tl1-status{margin-top:10px;padding:4px 8px;border:1px solid rgba(79,70,229,.22);border-radius:999px;
  background:var(--accent-tint);color:var(--accent);font-family:var(--font-geist-mono,ui-monospace,monospace);
  font-size:9.5px;font-weight:600;letter-spacing:.055em;text-transform:uppercase;white-space:nowrap}
.tl1-now .tl1-lane,.tl1-now .tl1-due{color:var(--accent)}
.tl1-now .tl1-dot{border-color:var(--accent);background:var(--accent);
  box-shadow:0 0 0 5px var(--paper),0 0 0 6px rgba(79,70,229,.22)}
.tl1-now .tl1-mark::before{content:"";position:absolute;inset:2px;border:2px solid var(--accent);border-radius:50%;opacity:0}
.tl1-later .tl1-item{color:var(--ink-soft)}
.tl1-later .tl1-dot{border-color:var(--ink-faint)}
.tl1-done .tl1-lane,.tl1-done .tl1-item,.tl1-done .tl1-due{color:var(--ink-faint)}
.tl1-check{width:24px;height:24px;color:var(--ink-faint)}

.tl1-coda{display:flex;align-items:center;gap:12px;margin:38px 0 0;padding-top:18px;border-top:1px solid var(--hairline-soft)}
.tl1-coda-label{font-family:var(--font-geist-mono,ui-monospace,monospace);font-size:10px;font-weight:600;
  letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint)}
.tl1-coda-dash{width:16px;height:2px;border-radius:2px;background:var(--ink-faint)}
.tl1-coda-item{font-size:14px;color:var(--ink-faint)}
.tl1-coda-date{font-family:var(--font-geist-mono,ui-monospace,monospace);font-size:10.5px;color:var(--ink-faint)}
.tl1-ledger{display:flex;align-items:center;gap:16px;margin-top:24px;color:var(--ink-faint);font-size:12.5px;line-height:1.45}
.tl1-wordmark{display:inline-flex;align-items:flex-end;color:var(--ink);font-size:15px;font-weight:620;letter-spacing:-.025em}
.tl1-wordmark-dot{display:inline-block;width:6px;height:6px;margin:0 0 2px 3px;border-radius:50%;background:var(--accent)}

.tl1-cta{display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;margin-top:26px}
.tl1-cta a{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:9px 15px;border-radius:4px;
  font-size:13px;font-weight:550;text-decoration:none;transition:transform .18s var(--ease-out),border-color .18s var(--ease-out),
  color .18s var(--ease-out),background .18s var(--ease-out)}
.tl1-cta-primary{border:1px solid var(--ink);background:var(--ink);color:var(--paper)}
.tl1-cta-primary:hover{transform:translateY(-1px);background:var(--ink-soft)}
.tl1-cta-secondary{border:1px solid var(--hairline);background:var(--paper);color:var(--ink-soft)}
.tl1-cta-secondary:hover{transform:translateY(-1px);border-color:var(--ink-faint);color:var(--ink)}
.tl1 a:focus-visible{outline:2px solid var(--accent);outline-offset:3px}

@media (max-width:720px){
  .tl1-wrap{padding:34px 20px 56px}
  .tl1-folio{align-items:flex-start;flex-wrap:wrap}
  .tl1-folio-rule{min-width:36px;margin-top:8px}
  .tl1-folio-link{max-width:100%;order:3}
  .tl1-copy{padding-top:42px;margin-bottom:34px}
  .tl1-h1{font-size:clamp(38px,12vw,58px)}
  .tl1-nodes{display:flex;flex-direction:column;gap:26px}
  .tl1-node{display:grid;grid-template-columns:52px 30px minmax(0,1fr);grid-template-areas:
      "lane mark item" ". . due" ". . status";column-gap:14px;row-gap:5px;align-items:start;min-height:62px}
  .tl1-lane{grid-area:lane;margin:7px 0 0}
  .tl1-mark{grid-area:mark;margin:0}
  .tl1-item{grid-area:item;max-width:none;padding-top:4px}
  .tl1-due{grid-area:due;margin:0}
  .tl1-status{grid-area:status;margin:3px 0 0;width:max-content}
  .tl1-track-base,.tl1-track-fill{left:79.5px;right:auto;top:15px;bottom:15px;width:2px;height:auto;
    transform-origin:top center}
  .tl1-track-fill{background:linear-gradient(180deg,var(--ink) 0 66%,var(--hairline) 100%)}
  .tl1-coda{align-items:flex-start;flex-wrap:wrap;gap:9px}
  .tl1-coda-date{flex-basis:100%;padding-left:28px}
  .tl1-ledger{align-items:flex-start;flex-direction:column;gap:8px}
  .tl1-cta{align-items:stretch;flex-direction:column}
  .tl1-cta a{width:100%}
  .tl1-intro-line{top:76px;font-size:clamp(34px,11vw,48px)}
}

@media (prefers-reduced-motion:no-preference){
  .tl1-intro{display:block}
  .tl1-intro-1{animation:tl1-intro-beat 1.45s var(--ease-out) .2s both}
  .tl1-intro-2{animation:tl1-intro-beat 1.55s var(--ease-out) 1.55s both}
  .tl1-intro-3{animation:tl1-intro-last 1.35s var(--ease-out) 2.95s both}
  .tl1-copy>*{opacity:0;animation:tl1-rise .58s var(--ease-out) forwards}
  .tl1-eyebrow{animation-delay:3.75s}
  .tl1-h1{animation-delay:3.84s}
  .tl1-sub{animation-delay:3.96s}
  .tl1-track-fill{transform:scaleX(0);animation:tl1-draw-x 1.1s var(--ease-in-out) 3.65s forwards}
  .tl1-node{opacity:0;animation:tl1-node-in .46s var(--ease-out) forwards;
    animation-delay:calc(3.82s + var(--i) * .22s)}
  .tl1-now .tl1-mark::before{animation:tl1-pulse 1.1s var(--ease-out) 4.62s 1}
  .tl1-coda{opacity:0;animation:tl1-rise .5s var(--ease-out) 4.82s forwards}
  .tl1-ledger{opacity:0;animation:tl1-rise .5s var(--ease-out) 5s forwards}
  .tl1-cta{opacity:0;animation:tl1-rise .5s var(--ease-out) 5.16s forwards}
  .tl1-wordmark-dot{animation:tl1-wordmark-sweep 1s var(--ease-out) 5.3s 1 both}
}

@media (max-width:720px) and (prefers-reduced-motion:no-preference){
  .tl1-track-fill{transform:scaleY(0);animation-name:tl1-draw-y}
}

@keyframes tl1-rise{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:none}}
@keyframes tl1-node-in{from{opacity:0;transform:translateY(8px);clip-path:inset(0 0 18% 0)}to{opacity:1;transform:none;clip-path:inset(0)}}
@keyframes tl1-intro-beat{0%{opacity:0;transform:translateY(10px)}18%,72%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-7px)}}
@keyframes tl1-intro-last{0%{opacity:0;transform:translateY(10px)}22%,70%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-5px)}}
@keyframes tl1-draw-x{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes tl1-draw-y{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes tl1-pulse{0%{opacity:.5;transform:scale(1)}100%{opacity:0;transform:scale(2.25)}}
@keyframes tl1-wordmark-sweep{
  0%{opacity:1;transform:translateX(0)}
  42%{opacity:1;transform:translateX(4px)}
  50%{opacity:0;transform:translateX(4px)}
  58%{opacity:0;transform:translateX(0)}
  100%{opacity:1;transform:translateX(0)}
}
`;
