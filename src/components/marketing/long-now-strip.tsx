/**
 * Long Now Strip, Da Vinci row 9.
 *
 * A thin editorial band that names the planning horizon. Most tools
 * stop at the quarter; this one says the horizon stretches further. The
 * strip lists six time anchors, this week → 02030, quietly, in the
 * mono register. The five-digit year is a deliberate signal that the
 * work outlasts any single calendar.
 *
 * Server-rendered, zero JS, reduced-motion-safe by construction.
 * Sits between Hero and ItemAnatomy as the "and how long does it
 * think" interstitial, the question every public-roadmap reader
 * has, named on the page.
 */

const HORIZON: { label: string; sense: string }[] = [
  { label: "this week",   sense: "what got done" },
  { label: "this month",  sense: "what's moving" },
  { label: "this season", sense: "what's next" },
  { label: "this year",   sense: "what we promised" },
  { label: "next year",   sense: "where this goes" },
  { label: "02030",       sense: "the long view" },
];

export function LongNowStrip() {
  return (
    <section
      aria-label="How far the plan looks, from this week to 02030"
      className="long-now-strip"
    >
      <div className="long-now-inner">
        <p className="long-now-eyebrow">
          The plan looks further <span className="long-now-gold">·</span> this
          week to 02030
        </p>
        <ol className="long-now-list">
          {HORIZON.map((h) => (
            <li key={h.label} className="long-now-step">
              <span className="long-now-when">{h.label}</span>
              <span className="long-now-rule" aria-hidden />
              <span className="long-now-sense">{h.sense}</span>
            </li>
          ))}
        </ol>
        <p className="long-now-foot">
          Most plans stop a few months out. A public plan should say where the
          work is going after that. The extra digit in 02030 is on purpose:
          some promises take longer than a calendar.
        </p>
      </div>
      <style>{LONG_NOW_CSS}</style>
    </section>
  );
}

const LONG_NOW_CSS = `
.long-now-strip {
  border-top: 1px solid var(--border-soft, rgba(0,0,0,0.08));
  border-bottom: 1px solid var(--border-soft, rgba(0,0,0,0.08));
  padding: 56px 0 64px;
}
.long-now-inner {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}
.long-now-eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-quiet, #6b6b6b);
  margin: 0 0 28px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.long-now-eyebrow::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-soft, rgba(0,0,0,0.08));
}
.long-now-gold {
  color: var(--brand, #4f46e5);
}
.long-now-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0;
}
.long-now-step {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px 8px 0;
  border-left: 1px solid var(--border-soft, rgba(0,0,0,0.08));
  padding-left: 18px;
}
.long-now-step:first-child {
  border-left: 0;
  padding-left: 0;
}
.long-now-when {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--ink-soft, #4a4a4a);
  font-variant-numeric: tabular-nums;
}
.long-now-rule {
  height: 1px;
  background: var(--brand, #4f46e5);
  width: 18px;
  opacity: 0.55;
}
.long-now-sense {
  font-size: 14px;
  letter-spacing: -0.012em;
  color: var(--ink, #14151a);
  font-weight: 500;
}
.long-now-foot {
  margin: 32px 0 0;
  max-width: 56ch;
  font-size: 13px;
  line-height: 1.55;
  color: var(--ink-quiet, #6b6b6b);
}
@media (max-width: 880px) {
  .long-now-list {
    grid-template-columns: repeat(3, 1fr);
  }
  .long-now-step:nth-child(4) {
    border-left: 0;
    padding-left: 0;
  }
}
@media (max-width: 520px) {
  .long-now-list {
    grid-template-columns: repeat(2, 1fr);
  }
  .long-now-step:nth-child(3),
  .long-now-step:nth-child(5) {
    border-left: 0;
    padding-left: 0;
  }
}
`;
