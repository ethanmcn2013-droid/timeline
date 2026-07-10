/**
 * Direction — "The Open Line" (HYBRID of The Link × The Line).
 *
 * The clever marriage: the shared URL opens, with no account, to a single
 * readable line, and the line begins at the link itself. An indigo thread drops
 * from the highlighted path in the address bar straight into the first marker
 * (Now); from there the hairline extends right through Soon, Later, Done, with
 * what was set aside kept honestly below. One URL in, one plain line out, access
 * and shape on the same axis.
 *
 * Pure CSS, server-rendered. Default styles ARE the rest state (opened line);
 * intro plays only under `prefers-reduced-motion: no-preference`. Scoped `tlo-`.
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

export function TimelineHeroOpenLine() {
  return (
    <section className="tlo">
      <div className="tlo-wrap">
        <div className="tlo-copy">
          <p className="tlo-eyebrow">Signal Timeline · One link, one line</p>
          <h1 className="tlo-h1">One link opens the whole&nbsp;plan.</h1>
          <p className="tlo-sub">
            Share one URL. It opens, with no account, to a single readable line, and the line starts at the
            link itself: now, soon, later, and what you set aside.
          </p>
        </div>

        <div
          className="tlo-browser"
          role="img"
          aria-label="A browser open to timeline.signalstudio.ie/the-wedding. The link feeds a timeline: Now, confirm the florist, this week, waiting on you. Soon, send the invitations, by Friday. Later, draw the seating plan, after RSVPs. Done, venue booked, June 2. Set aside: a second venue viewing, decided June 3."
        >
          <div className="tlo-chrome">
            <span className="tlo-lights" aria-hidden><i /><i /><i /></span>
            <div className="tlo-omni">
              <svg className="tlo-lock" viewBox="0 0 24 24" aria-hidden><path d="M7 11V8a5 5 0 0110 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor" /></svg>
              <span className="tlo-url"><span className="tlo-host">timeline.signalstudio.ie</span><span className="tlo-path">/the-wedding{/* The cord: hangs from the link, straight down into the Now marker. */}
                <span className="tlo-cord" aria-hidden><span className="tlo-cord-tip" /></span>
              </span></span>
            </div>
            <span className="tlo-share">Copy link</span>
          </div>

          <div className="tlo-page">
            <div className="tlo-mast">
              <p className="tlo-kicker"><span className="tlo-live" aria-hidden />Public plan · updated today</p>
              <h2 className="tlo-title">Méabh &amp; Grace</h2>
              <p className="tlo-guest">Viewing as a guest. No account.</p>
            </div>

            <div className="tlo-plot">
              <span className="tlo-track" aria-hidden />
              <ol className="tlo-nodes">
                {NODES.map((n, i) => (
                  <li key={n.lane} className={`tlo-node tlo-${n.state}`} style={{ ["--i" as string]: i }}>
                    <span className="tlo-lane">{n.lane}</span>
                    <span className="tlo-mark" aria-hidden>
                      {n.state === "done" ? (
                        <svg viewBox="0 0 24 24" className="tlo-check"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      ) : (
                        <span className="tlo-dot" />
                      )}
                    </span>
                    <span className="tlo-item">{n.item}</span>
                    <span className="tlo-date">{n.date}</span>
                    {n.chip && <span className="tlo-chip">{n.chip}</span>}
                  </li>
                ))}
              </ol>
              <span className="tlo-onward" aria-hidden>
                <span className="tlo-onward-line" />
                <span className="tlo-onward-year">02030</span>
              </span>
            </div>

            <p className="tlo-coda">
              <span className="tlo-coda-lane">Set aside</span>
              <span className="tlo-coda-dash" aria-hidden />
              <span className="tlo-coda-item">A second venue viewing</span>
              <span className="tlo-coda-date">decided Jun 3</span>
              <span className="tlo-coda-spacer" />
              <span className="tlo-coda-proof">No account · opened by 14 people</span>
            </p>
          </div>
        </div>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.tlo{--soft:var(--ink-soft);--faint:var(--ink-faint);
  --hair:var(--hairline);--hair-soft:var(--hairline-soft);
  min-height:92svh;display:flex;align-items:center;background:var(--paper);color:var(--ink);
  font-family:var(--font-geist-sans,system-ui,sans-serif);
  background-image:radial-gradient(rgba(17,17,17,.04) 1px,transparent 1px);background-size:26px 26px;background-position:center}
.tlo-wrap{max-width:1180px;margin:0 auto;padding:64px 28px;width:100%}

.tlo-copy{max-width:760px;margin-bottom:40px}
.tlo-eyebrow{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.14em;
  text-transform:uppercase;color:var(--faint);margin:0 0 18px}
.tlo-h1{font-size:clamp(2rem,1rem+4.6vw,4.2rem);line-height:.98;letter-spacing:-.045em;font-weight:600;margin:0 0 18px;max-width:16ch}
.tlo-sub{font-size:clamp(15px,.6rem+.5vw,17.5px);line-height:1.55;color:var(--soft);max-width:58ch;margin:0}

/* ── Browser ─────────────────────────────────────────────── */
.tlo-browser{position:relative;border:1px solid var(--hair);border-radius:16px;background:var(--paper);
  box-shadow:0 44px 90px -50px rgba(17,17,17,.45),0 12px 30px -20px rgba(17,17,17,.28)}
.tlo-chrome{display:flex;align-items:center;gap:14px;padding:12px 16px;background:var(--paper-soft);
  border-bottom:1px solid var(--hair);border-radius:16px 16px 0 0}
.tlo-lights{display:flex;gap:6px}
.tlo-lights i{width:11px;height:11px;border-radius:50%;background:var(--paper-deep)}
.tlo-omni{flex:1;display:flex;align-items:center;gap:8px;height:34px;padding:0 12px;background:var(--paper);
  border:1px solid var(--hair);border-radius:9px;font-family:var(--font-geist-mono,monospace);font-size:12.5px}
.tlo-lock{width:13px;height:13px;color:var(--accent);flex-shrink:0}
.tlo-url{color:var(--faint);white-space:nowrap}
.tlo-host{color:var(--soft)}
.tlo-path{position:relative;color:var(--accent);font-weight:600;padding:1px 3px;border-radius:4px;background:rgba(79,70,229,.09)}
.tlo-share{font-family:var(--font-geist-mono,monospace);font-size:11.5px;color:var(--accent);white-space:nowrap;
  padding:6px 11px;border:1px solid var(--hair);border-radius:8px}

/* The cord: hangs straight from the highlighted path down into the Now marker,
   which is positioned directly beneath the link (plot padding-left). */
.tlo-cord{position:absolute;left:50%;top:calc(100% + 3px);width:2px;height:190px;margin-left:-1px;z-index:2;
  pointer-events:none;transform-origin:top center;border-radius:2px;
  background:linear-gradient(180deg,rgba(79,70,229,.35),var(--accent) 34%,var(--accent))}
.tlo-cord-tip{position:absolute;top:-4px;left:-3px;width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px var(--paper)}

.tlo-page{padding:26px 34px 24px}
.tlo-mast{margin-bottom:30px}
.tlo-kicker{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-geist-mono,monospace);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:0 0 9px}
.tlo-live{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.tlo-title{font-size:clamp(19px,1rem+1.1vw,26px);font-weight:600;letter-spacing:-.03em;margin:0;line-height:1.05}
.tlo-guest{margin:8px 0 0;font-size:12.5px;color:var(--faint)}

/* Plot padding-left drops the Now marker directly under the address-bar path,
   so the cord hangs straight into it. Calibrated to the omnibox text width. */
.tlo-plot{position:relative;padding-top:2px;padding-left:288px}
.tlo-track{position:absolute;left:288px;right:88px;top:calc(2px + 24px + 15px);height:2px;
  background:linear-gradient(90deg,var(--ink) 0%,var(--ink) 62%,var(--hair) 100%);border-radius:2px;transform-origin:left center}
.tlo-nodes{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,150px);gap:20px}
.tlo-node{position:relative;display:flex;flex-direction:column;align-items:flex-start;padding-right:14px}
.tlo-lane{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:12px}
.tlo-mark{position:relative;display:grid;place-items:center;width:30px;height:30px;margin-bottom:14px}
.tlo-dot{width:15px;height:15px;border-radius:50%;background:var(--paper);border:2px solid var(--ink);box-shadow:0 0 0 5px var(--paper)}
.tlo-item{font-size:clamp(15px,.5rem+.6vw,18px);font-weight:500;letter-spacing:-.01em;color:var(--ink);line-height:1.25;max-width:16ch}
.tlo-date{margin-top:6px;font-family:var(--font-geist-mono,monospace);font-size:11px;letter-spacing:.03em;color:var(--faint)}
.tlo-chip{margin-top:11px;display:inline-flex;align-items:center;font-family:var(--font-geist-mono,monospace);font-size:10.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--accent);background:var(--accent-tint);border:1px solid var(--accent-soft);padding:4px 9px;border-radius:999px}

.tlo-now .tlo-lane{color:var(--accent);padding-left:26px}
.tlo-now .tlo-dot{background:var(--accent);border-color:var(--accent);box-shadow:0 0 0 5px var(--paper),0 0 0 6px rgba(79,70,229,.25)}
.tlo-now .tlo-date{color:var(--accent)}
.tlo-later .tlo-lane,.tlo-later .tlo-item{color:var(--soft)}
.tlo-later .tlo-dot{border-color:var(--faint)}
.tlo-done .tlo-lane,.tlo-done .tlo-item{color:var(--faint)}
.tlo-check{width:26px;height:26px;color:var(--faint)}

.tlo-onward{position:absolute;right:0;top:calc(2px + 24px + 6px);display:flex;flex-direction:column;align-items:flex-end;gap:8px;width:88px}
.tlo-onward-line{width:100%;height:2px;background:repeating-linear-gradient(90deg,var(--hair) 0 6px,transparent 6px 12px)}
.tlo-onward-year{font-family:var(--font-geist-mono,monospace);font-size:11px;letter-spacing:.08em;color:var(--faint)}

.tlo-coda{display:flex;align-items:center;gap:14px;margin:34px 0 0;padding-top:20px;border-top:1px solid var(--hair-soft)}
.tlo-coda-lane{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
.tlo-coda-dash{width:16px;height:2px;border-radius:2px;background:var(--faint)}
.tlo-coda-item{font-size:14.5px;color:var(--faint)}
.tlo-coda-date{font-family:var(--font-geist-mono,monospace);font-size:11px;letter-spacing:.03em;color:var(--faint)}
.tlo-coda-spacer{flex:1}
.tlo-coda-proof{font-family:var(--font-geist-mono,monospace);font-size:11px;letter-spacing:.03em;color:var(--faint)}

@media (max-width:760px){
  .tlo-cord{display:none}
  .tlo-plot{padding-left:0}
  .tlo-now .tlo-lane{padding-left:0}
  .tlo-track{left:14px;right:auto;top:0;bottom:0;width:2px;height:auto;
    background:linear-gradient(180deg,var(--ink) 0%,var(--ink) 62%,var(--hair) 100%)}
  .tlo-nodes{grid-template-columns:1fr;gap:30px}
  .tlo-node{flex-direction:row;align-items:center;gap:14px;flex-wrap:wrap;padding-right:0}
  .tlo-lane{width:48px;margin:0}
  .tlo-mark{margin:0}
  .tlo-item{flex:1;max-width:none}
  .tlo-date{margin:0;width:100%;padding-left:62px}
  .tlo-chip{margin:0}
  .tlo-onward{position:static;flex-direction:row;width:auto;margin-top:24px}
  .tlo-onward-line{width:52px}
  .tlo-coda{flex-wrap:wrap;gap:10px}.tlo-coda-spacer{display:none}
}

@media (prefers-reduced-motion:no-preference){
  .tlo-copy>*{opacity:0;animation:tlo-rise .6s ease forwards}
  .tlo-eyebrow{animation-delay:.05s}.tlo-h1{animation-delay:.14s}.tlo-sub{animation-delay:.24s}
  .tlo-browser{opacity:0;animation:tlo-lift .8s var(--ease-out) .34s forwards}
  .tlo-path{background-size:0 100%;background-image:linear-gradient(90deg,rgba(79,70,229,.09),rgba(79,70,229,.09));
    background-repeat:no-repeat;animation:tlo-hi .45s ease .95s forwards}
  .tlo-mast{opacity:0;animation:tlo-rise .5s ease .8s forwards}
  /* cord drops from the link; the Now marker lands as it arrives, then the
     line draws right from it. No blank hand-off. */
  .tlo-cord-tip{opacity:0;animation:tlo-fade .3s ease 1.1s forwards}
  .tlo-cord{transform:scaleY(0);animation:tlo-drop .48s var(--ease-in-out) 1.15s forwards}
  .tlo-node{opacity:0;animation:tlo-pop .5s var(--ease-out) forwards;animation-delay:calc(1.5s + var(--i) * .2s)}
  .tlo-track{transform:scaleX(0);animation:tlo-draw .8s var(--ease-in-out) 1.62s forwards}
  .tlo-onward{opacity:0;animation:tlo-rise .6s ease 2.4s forwards}
  .tlo-coda{opacity:0;animation:tlo-rise .6s ease 2.55s forwards}
}
@keyframes tlo-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes tlo-lift{from{opacity:0;transform:translateY(24px) scale(.99)}to{opacity:1;transform:none}}
@keyframes tlo-hi{to{background-size:100% 100%}}
@keyframes tlo-drop{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes tlo-fade{to{opacity:1}}
@keyframes tlo-draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes tlo-pop{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
`;
