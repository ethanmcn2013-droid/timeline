/**
 * Direction — "The Link" (polished, v2).
 *
 * The URL is the product, so the URL is the hero. The shared link sits in a real
 * browser (tab, nav, favicon) and opens with no wall in front of it: the plan
 * unfolds exactly as the person on the other end sees it. No account, no app.
 * The path types itself into the bar, the sign-in wall dissolves to reveal the
 * already-loaded plan, and a "Copy link → Copied" beat shows how it travels.
 *
 * Pure CSS, server-rendered. Default styles ARE the rest state (opened plan);
 * intro plays only under `prefers-reduced-motion: no-preference`. Scoped `tl2-`.
 */

type Row = { lane: string; item: string; meta: string; state: "now" | "soon" | "later" | "refused" };

const ROWS: Row[] = [
  { lane: "Now", item: "Confirm the florist", meta: "Waiting on you", state: "now" },
  { lane: "Soon", item: "Send the invitations", meta: "by Friday", state: "soon" },
  { lane: "Later", item: "Draw the seating plan", meta: "after RSVPs", state: "later" },
  { lane: "Set aside", item: "A second venue viewing", meta: "decided Jun 3", state: "refused" },
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
          <div className="tl2-browser" role="img" aria-label="A browser open to timeline.signalstudio.ie/the-wedding: a public plan, viewed as a guest with no account. Now, confirm the florist, waiting on you. Soon, send the invitations. Later, draw the seating plan. Set aside, a second venue viewing.">
            {/* Tab strip */}
            <div className="tl2-tabs" aria-hidden>
              <span className="tl2-tab-on">
                <span className="tl2-fav" />
                <span className="tl2-tab-title">The wedding</span>
                <span className="tl2-tab-x">×</span>
              </span>
              <span className="tl2-tab-new">+</span>
            </div>

            {/* Toolbar: nav + omnibox + copy */}
            <div className="tl2-chrome">
              <span className="tl2-nav" aria-hidden>
                <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <svg className="tl2-nav-off" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <svg viewBox="0 0 24 24"><path d="M4 4v6h6M20 20v-6h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M19 9a8 8 0 00-14-2M5 15a8 8 0 0014 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </span>
              <div className="tl2-omni">
                <svg className="tl2-lock" viewBox="0 0 24 24" aria-hidden><path d="M7 11V8a5 5 0 0110 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor" /></svg>
                <span className="tl2-url"><span className="tl2-host">timeline.signalstudio.ie</span><span className="tl2-path"><span className="tl2-path-in">/the-wedding</span></span></span>
                <span className="tl2-caret" aria-hidden />
              </div>
              <span className="tl2-share">
                <span className="tl2-share-idle">Copy link</span>
                <span className="tl2-share-done" aria-hidden>Copied ✓</span>
              </span>
            </div>

            <div className="tl2-sweep" aria-hidden />

            <div className="tl2-page">
              <div className="tl2-mast">
                <p className="tl2-kicker">
                  <span className="tl2-live" aria-hidden />
                  Public plan · updated 2h ago
                </p>
                <h2 className="tl2-title">Méabh &amp; Grace, the wedding</h2>
                <p className="tl2-read">Viewing as a guest. Read-only, and no account to make.</p>
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
.tl2{--soft:var(--ink-soft);--faint:var(--ink-faint);--hair:var(--hairline);
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
.tl2-proof-dot{width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px var(--accent-soft)}

/* ── Browser ─────────────────────────────────────────────── */
.tl2-stage{position:relative}
.tl2-browser{position:relative;border:1px solid var(--hair);border-radius:14px;overflow:hidden;background:var(--paper);
  box-shadow:0 40px 80px -44px rgba(17,17,17,.45),0 10px 26px -18px rgba(17,17,17,.3)}

/* Tab strip */
.tl2-tabs{display:flex;align-items:flex-end;gap:6px;padding:8px 10px 0;background:var(--paper-deep)}
.tl2-tab-on{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;background:var(--paper);
  border-radius:8px 8px 0 0;font-size:12px;color:var(--soft);max-width:180px}
.tl2-fav{width:11px;height:11px;border-radius:50%;background:var(--accent);flex-shrink:0}
.tl2-tab-title{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tl2-tab-x{color:var(--faint);font-size:14px;line-height:1}
.tl2-tab-new{color:var(--faint);font-size:15px;padding:0 6px 6px}

.tl2-chrome{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--paper);border-bottom:1px solid var(--hair)}
.tl2-nav{display:flex;align-items:center;gap:4px;color:var(--faint)}
.tl2-nav svg{width:17px;height:17px}
.tl2-nav-off{opacity:.35}
.tl2-omni{flex:1;display:flex;align-items:center;gap:8px;height:34px;padding:0 12px;background:var(--paper-soft);
  border:1px solid transparent;border-radius:9px;font-family:var(--font-geist-mono,monospace);font-size:12.5px}
.tl2-lock{width:13px;height:13px;color:var(--accent);flex-shrink:0}
.tl2-url{display:inline-flex;min-width:0;color:var(--faint);white-space:nowrap}
.tl2-host{color:var(--soft)}
.tl2-path{color:var(--accent);font-weight:600;overflow:hidden;max-width:200px}
.tl2-path-in{display:inline-block;white-space:nowrap}
.tl2-caret{width:1.5px;height:15px;background:var(--accent);opacity:0;margin-left:1px}
.tl2-share{position:relative;font-family:var(--font-geist-mono,monospace);font-size:11.5px;white-space:nowrap;
  padding:6px 11px;border:1px solid var(--hair);border-radius:8px;color:var(--accent)}
.tl2-share-done{position:absolute;inset:0;display:grid;place-items:center;border-radius:8px;
  background:var(--accent);color:var(--paper);opacity:0}

.tl2-sweep{position:absolute;left:0;right:0;top:96px;height:2px;background:var(--accent);transform:scaleX(0);opacity:0;transform-origin:left}

.tl2-page{padding:28px 30px 26px}
.tl2-mast{border-bottom:1px solid var(--hair);padding-bottom:20px;margin-bottom:6px}
.tl2-kicker{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-geist-mono,monospace);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:0 0 10px}
.tl2-live{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.tl2-title{font-size:clamp(20px,1rem+1.4vw,29px);font-weight:600;letter-spacing:-.03em;margin:0 0 8px;line-height:1.05}
.tl2-read{font-size:13px;color:var(--faint);margin:0}

.tl2-lanes{position:relative;list-style:none;margin:14px 0 0;padding:0;display:flex;flex-direction:column}
/* Connecting spine through the dots: reads as a timeline, not a doc list. */
.tl2-lanes::before{content:"";position:absolute;left:91px;top:24px;bottom:34px;width:2px;
  background:linear-gradient(180deg,var(--accent) 0,var(--hair) 42%,var(--hair) 100%);z-index:0}
.tl2-row{position:relative;display:grid;grid-template-columns:72px 16px 1fr auto;align-items:center;gap:12px;padding:15px 0;border-bottom:1px solid rgba(17,17,17,.06)}
.tl2-rlane{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
.tl2-rdot{position:relative;z-index:1;width:11px;height:11px;border-radius:50%;border:2px solid var(--faint);background:var(--paper);justify-self:center;box-shadow:0 0 0 3px var(--paper)}
.tl2-ritem{font-size:15.5px;font-weight:500;color:var(--ink);letter-spacing:-.01em}
.tl2-rmeta{font-size:12px;color:var(--faint);font-family:var(--font-geist-mono,monospace)}
.tl2-now .tl2-rlane{color:var(--accent)}
.tl2-now .tl2-rdot{background:var(--accent);border-color:var(--accent);box-shadow:0 0 0 4px rgba(79,70,229,.14)}
.tl2-now .tl2-rmeta{color:var(--accent)}
.tl2-later .tl2-ritem{color:var(--soft)}
/* Refused — the honest bucket. Dated, no apology, no colour. */
.tl2-refused .tl2-rlane,.tl2-refused .tl2-ritem{color:var(--faint)}
.tl2-refused .tl2-rdot{border:none;width:12px;height:2px;border-radius:2px;background:var(--faint)}
.tl2-refused .tl2-rmeta{color:var(--faint)}

.tl2-foot{display:flex;align-items:center;gap:10px;margin:20px 0 0;font-size:12.5px;color:var(--faint)}
.tl2-avatars{display:flex}
.tl2-avatars i{width:18px;height:18px;border-radius:50%;border:2px solid var(--paper);margin-left:-6px;
  background:var(--accent-soft)}
.tl2-avatars i:first-child{margin-left:0}

/* The wall that never drops. */
.tl2-wall{position:absolute;inset:96px 0 0;background:rgba(255,255,255,.72);backdrop-filter:blur(3px);
  display:grid;place-items:center;opacity:0;pointer-events:none}
.tl2-wall-card{display:flex;flex-direction:column;align-items:center;gap:6px}
.tl2-wall-lock{font-size:14px;font-weight:600;color:var(--soft)}
.tl2-wall-x{font-family:var(--font-geist-mono,monospace);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);text-decoration:line-through}

@media (prefers-reduced-motion:no-preference){
  .tl2-copy>*{opacity:0;animation:tl2-rise .6s ease forwards}
  .tl2-eyebrow{animation-delay:.05s}.tl2-h1{animation-delay:.14s}.tl2-sub{animation-delay:.24s}.tl2-proof{animation-delay:.34s}
  .tl2-browser{opacity:0;animation:tl2-lift .8s var(--ease-out) .3s forwards}
  .tl2-omni{animation:tl2-focus .5s ease .85s forwards}
  .tl2-path-in{max-width:0;animation:tl2-type .55s steps(12,end) .95s forwards}
  .tl2-caret{animation:tl2-blink 1s step-end 1.5s 2}
  .tl2-sweep{animation:tl2-scan .7s var(--ease-in-out) 1.05s forwards}
  .tl2-share-done{animation:tl2-copied 1.2s ease 2.5s 1}
  /* Plan is populated BEHIND the wall, then the wall lifts to reveal it. */
  .tl2-mast,.tl2-row,.tl2-foot{opacity:0;animation:tl2-rise .5s ease forwards}
  .tl2-mast{animation-delay:1s}
  .tl2-row{animation-delay:calc(1.15s + var(--i) * .12s)}
  .tl2-foot{animation-delay:1.75s}
  .tl2-wall{animation:tl2-drop 1.6s ease .95s forwards}
}
@keyframes tl2-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes tl2-lift{from{opacity:0;transform:translateY(26px) scale(.985)}to{opacity:1;transform:none}}
@keyframes tl2-focus{from{background:var(--paper-soft);border-color:transparent}to{background:var(--paper);border-color:var(--accent-soft)}}
@keyframes tl2-type{from{max-width:0}to{max-width:200px}}
@keyframes tl2-blink{50%{opacity:1}0%,100%{opacity:0}}
@keyframes tl2-scan{0%{opacity:1;transform:scaleX(0)}70%{opacity:1;transform:scaleX(1)}100%{opacity:0;transform:scaleX(1)}}
@keyframes tl2-copied{0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0}}
@keyframes tl2-drop{0%{opacity:1}70%{opacity:1}100%{opacity:0}}
`;
