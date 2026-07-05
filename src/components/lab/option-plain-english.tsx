/**
 * Direction 3 — "Plain English" (polished).
 *
 * Timeline's promise: no project-management vocabulary to learn. The stage opens
 * on a pile of PM machinery, Gantt bars, tickets, sprint chips, story points,
 * and a single translation pass dissolves it. Plain sentences settle into the
 * Now / Soon / Later ladder that was underneath all along.
 *
 * Pure CSS, server-rendered. Default styles ARE the rest state (clean ladder;
 * the jargon pile is decorative + hidden). The chaos + translation play only
 * under `prefers-reduced-motion: no-preference`. Scoped `tl3-`.
 */

type Row = { lane: string; item: string; state: "now" | "soon" | "later" };

const ROWS: Row[] = [
  { lane: "Now", item: "Confirm the florist", state: "now" },
  { lane: "Soon", item: "Send the invitations", state: "soon" },
  { lane: "Later", item: "Draw the seating plan", state: "later" },
];

// Decorative jargon pile — what the plan is NOT written in.
const NOISE = [
  { t: "EPIC-204", s: "8 pts · P1", cls: "tl3-n1" },
  { t: "SPRINT 14", s: "68% complete", cls: "tl3-n2" },
  { t: "BLOCKED", s: "depends on #1187", cls: "tl3-n3" },
  { t: "backlog", s: "WSJF 21.5", cls: "tl3-n4" },
  { t: "STORY", s: "AC 3/5 · QA", cls: "tl3-n5" },
  { t: "milestone M3", s: "burndown -12", cls: "tl3-n6" },
];

export function TimelineHeroPlain() {
  return (
    <section className="tl3">
      <div className="tl3-wrap">
        <div className="tl3-copy">
          <p className="tl3-eyebrow">Signal Timeline · Plain English</p>
          <h1 className="tl3-h1">No vocabulary to&nbsp;learn.</h1>
          <p className="tl3-sub">
            Most plans are written for the people who built them. This one is written for the people who have to
            read it. No sprints, no story points, no status codes, just what is happening, in words.
          </p>
          <p className="tl3-note">
            <span className="tl3-strike">EPIC-204 · P1 · 68%</span>
            <span className="tl3-arrow" aria-hidden>→</span>
            <span className="tl3-plain">&ldquo;Confirm the florist.&rdquo;</span>
          </p>
        </div>

        <div className="tl3-stage" role="img" aria-label="Project-management jargon translated into a plain plan: Now, confirm the florist. Soon, send the invitations. Later, draw the seating plan.">
          {/* The clean ladder — the rest state. */}
          <ol className="tl3-ladder">
            {ROWS.map((r, i) => (
              <li key={r.lane} className={`tl3-row tl3-${r.state}`} style={{ ["--i" as string]: i }}>
                <span className="tl3-rlane">{r.lane}</span>
                <span className="tl3-rdot" aria-hidden />
                <span className="tl3-ritem">{r.item}</span>
              </li>
            ))}
          </ol>

          {/* The jargon pile — decorative, dissolves on translate. */}
          <div className="tl3-noise" aria-hidden>
            {NOISE.map((n) => (
              <span key={n.t} className={`tl3-chip ${n.cls}`}>
                <b>{n.t}</b>
                <i>{n.s}</i>
              </span>
            ))}
            <span className="tl3-gantt tl3-g1" />
            <span className="tl3-gantt tl3-g2" />
            <span className="tl3-gantt tl3-g3" />
          </div>

          {/* The translation pass. */}
          <span className="tl3-sweep" aria-hidden><span className="tl3-sweep-label">translating</span></span>
        </div>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.tl3{--ink:#111;--soft:#3f3f46;--faint:#71717a;--accent:#4f46e5;--paper:#fff;--hair:rgba(17,17,17,.1);
  min-height:92svh;display:flex;align-items:center;background:var(--paper);color:var(--ink);
  font-family:var(--font-geist-sans,system-ui,sans-serif)}
.tl3-wrap{max-width:1200px;margin:0 auto;padding:72px 28px;width:100%;
  display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
@media (max-width:900px){.tl3-wrap{grid-template-columns:1fr;gap:44px}}

.tl3-eyebrow{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.14em;
  text-transform:uppercase;color:var(--faint);margin:0 0 20px}
.tl3-h1{font-size:clamp(2.1rem,1rem+4.8vw,4.4rem);line-height:.98;letter-spacing:-.04em;font-weight:600;margin:0 0 20px;max-width:12ch}
.tl3-sub{font-size:clamp(15px,.6rem+.5vw,17.5px);line-height:1.55;color:var(--soft);max-width:48ch;margin:0 0 24px}
.tl3-note{display:inline-flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:13.5px;margin:0}
.tl3-strike{font-family:var(--font-geist-mono,monospace);font-size:12px;color:var(--faint);text-decoration:line-through}
.tl3-arrow{color:var(--accent);font-weight:600}
.tl3-plain{color:var(--ink);font-weight:500}

/* ── Stage ─────────────────────────────────────────────── */
.tl3-stage{position:relative;min-height:360px;display:flex;flex-direction:column;justify-content:center;
  border:1px solid var(--hair);border-radius:16px;
  background:var(--paper);box-shadow:0 24px 60px -44px rgba(17,17,17,.4);overflow:hidden;padding:34px 32px}

.tl3-ladder{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;position:relative;z-index:2}
.tl3-row{display:grid;grid-template-columns:60px 16px 1fr;align-items:center;gap:14px;padding:24px 0;
  border-bottom:1px solid rgba(17,17,17,.06)}
.tl3-row:last-child{border-bottom:0}
.tl3-rlane{font-family:var(--font-geist-mono,monospace);font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}
.tl3-rdot{width:12px;height:12px;border-radius:50%;border:2px solid var(--faint);justify-self:center}
.tl3-ritem{font-size:clamp(16px,.6rem+.8vw,20px);font-weight:500;letter-spacing:-.01em;color:var(--ink)}
.tl3-now .tl3-rlane{color:var(--accent)}
.tl3-now .tl3-rdot{background:var(--accent);border-color:var(--accent);box-shadow:0 0 0 4px rgba(79,70,229,.14)}
.tl3-later .tl3-ritem{color:var(--soft)}

/* ── Jargon pile (decorative; hidden at rest) ─────────────── */
.tl3-noise{position:absolute;inset:0;z-index:3;opacity:0;pointer-events:none}
.tl3-chip{position:absolute;display:inline-flex;flex-direction:column;gap:2px;padding:8px 12px;border-radius:8px;
  background:#fff;border:1px solid var(--hair);box-shadow:0 8px 22px -14px rgba(17,17,17,.5);
  font-family:var(--font-geist-mono,monospace);white-space:nowrap}
.tl3-chip b{font-size:11.5px;font-weight:700;color:var(--soft);letter-spacing:.03em}
.tl3-chip i{font-size:10px;font-style:normal;color:var(--faint)}
.tl3-n1{top:22px;left:28px;transform:rotate(-5deg)}
.tl3-n2{top:40px;right:34px;transform:rotate(4deg)}
.tl3-n3{top:128px;left:20px;transform:rotate(3deg);border-color:rgba(239,68,68,.4)}
.tl3-n3 b{color:#b91c1c}
.tl3-n4{bottom:70px;right:26px;transform:rotate(-3deg)}
.tl3-n5{bottom:34px;left:60px;transform:rotate(6deg)}
.tl3-n6{top:150px;right:70px;transform:rotate(-6deg)}
.tl3-gantt{position:absolute;height:9px;border-radius:3px;background:repeating-linear-gradient(90deg,#e4e4e7 0 14px,#d4d4d8 14px 15px)}
.tl3-g1{top:96px;left:40px;width:150px;transform:rotate(-2deg)}
.tl3-g2{top:200px;left:90px;width:200px;transform:rotate(1deg);opacity:.8}
.tl3-g3{bottom:96px;right:50px;width:120px;transform:rotate(3deg);opacity:.7}

/* ── Translation sweep ─────────────────────────────────────── */
.tl3-sweep{position:absolute;top:0;bottom:0;left:0;width:40%;z-index:4;pointer-events:none;opacity:0;
  background:linear-gradient(90deg,transparent,rgba(79,70,229,.06) 60%,rgba(79,70,229,.14));
  border-right:2px solid var(--accent)}
.tl3-sweep-label{position:absolute;top:14px;right:12px;font-family:var(--font-geist-mono,monospace);font-size:9.5px;
  letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}

@media (prefers-reduced-motion:no-preference){
  .tl3-copy>*{opacity:0;animation:tl3-rise .6s ease forwards}
  .tl3-eyebrow{animation-delay:.05s}.tl3-h1{animation-delay:.14s}.tl3-sub{animation-delay:.24s}.tl3-note{animation-delay:1.9s}
  /* pile shows first, then dissolves */
  .tl3-noise{animation:tl3-noise-life 2.2s ease .3s forwards}
  .tl3-chip{animation:tl3-chip-out .5s ease forwards;animation-delay:calc(1.3s + var(--d,0s))}
  .tl3-n1{--d:0s}.tl3-n2{--d:.06s}.tl3-n3{--d:.12s}.tl3-n4{--d:.18s}.tl3-n5{--d:.24s}.tl3-n6{--d:.3s}
  .tl3-gantt{animation:tl3-fade-out .5s ease 1.4s forwards}
  .tl3-sweep{animation:tl3-sweep-run 1.15s cubic-bezier(.4,.6,.2,1) .95s forwards}
  /* ladder resolves as the pile clears */
  .tl3-row{opacity:0;animation:tl3-resolve .6s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(1.7s + var(--i) * .16s)}
}
@keyframes tl3-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes tl3-noise-life{0%{opacity:0}12%{opacity:1}72%{opacity:1}100%{opacity:0}}
@keyframes tl3-chip-out{to{opacity:0;transform:translateY(-8px) scale(.9) rotate(0deg)}}
@keyframes tl3-fade-out{to{opacity:0}}
@keyframes tl3-sweep-run{0%{opacity:1;left:-42%}100%{opacity:0;left:100%}}
@keyframes tl3-resolve{from{opacity:0;transform:translateY(8px);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}
`;
