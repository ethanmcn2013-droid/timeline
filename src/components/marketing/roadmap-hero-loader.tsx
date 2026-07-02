"use client";

/**
 * Timeline hero loader: Public URL Pass.
 *
 * The public plan is readable on first paint. The only motion is the product
 * dot leaving the wordmark position and settling inside the public URL chip.
 *
 * Safety contract:
 * - fully scoped: every class and keyframe uses the `rml-` prefix
 * - in-flow only: no fixed positioning and no global selectors
 * - reduced motion: static public plan plus URL chip, no handoff animation
 */

const PLAN_ROWS = [
  {
    label: "Now",
    text: "Supplier follow-up is waiting on the final guest count.",
  },
  {
    label: "Soon",
    text: "Send the short update to the couple and venue.",
  },
  {
    label: "Done",
    text: "Ceremony time is confirmed.",
  },
  {
    label: "Refused",
    text: "Private notes stay out of the public page.",
  },
] as const;

export function RoadmapHeroLoader() {
  return (
    <section className="rml-hero-section" aria-label="Signal Timeline public plan">
      <div className="rml-shell">
        <div className="rml-intro">
          <p className="rml-kicker">Signal Timeline</p>
          <div className="rml-wordmark" aria-hidden="true">
            <span>timeline</span>
            <span className="rml-word-dot" />
          </div>
          <p className="rml-caption">A readable public plan, shared as one link.</p>
        </div>

        <article className="rml-plan-card" aria-label="Public plan preview">
          <div className="rml-plan-head">
            <div>
              <p className="rml-plan-label">Public plan</p>
              <h2>Venue week</h2>
            </div>
            <span className="rml-link-state">Reader view ready</span>
          </div>

          <div className="rml-plan-rows">
            {PLAN_ROWS.map((row) => (
              <div className="rml-plan-row" key={row.label}>
                <span>{row.label}</span>
                <p>{row.text}</p>
              </div>
            ))}
          </div>

          <div className="rml-url-bar" aria-label="Public URL">
            <span className="rml-url-label">Public link</span>
            <span className="rml-url-chip">
              <span className="rml-url-dot" aria-hidden="true" />
              timeline.signalstudio.ie/venue-week
              <span className="rml-url-track" aria-hidden="true" />
              <span className="rml-url-milestone" aria-hidden="true" />
            </span>
          </div>
        </article>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.rml-hero-section {
  position: relative;
  overflow: hidden;
  background: #ffffff;
  min-height: min(88dvh, 880px);
  padding: 88px 24px 82px;
  display: flex;
  align-items: center;
  color: #111111;
  --rml-ink: #111111;
  --rml-ink-soft: #5f5c55;
  --rml-ink-muted: #8c887e;
  --rml-line: rgba(17, 17, 17, 0.08);
  --rml-panel: #fbfbfa;
  --rml-indigo: #4f46e5;
  --rml-indigo-soft: rgba(79, 70, 229, 0.1);
  --rml-font: var(--font-geist-sans, 'Geist', system-ui, sans-serif);
  --rml-mono: var(--font-geist-mono, 'Geist Mono', ui-monospace, monospace);
}

.rml-shell {
  width: min(1120px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(280px, 0.86fr) minmax(360px, 1.14fr);
  gap: 56px;
  align-items: center;
}

.rml-intro {
  display: grid;
  gap: 18px;
}

.rml-kicker,
.rml-plan-label,
.rml-url-label {
  margin: 0;
  font-family: var(--rml-mono);
  font-size: 12px;
  line-height: 1;
  color: var(--rml-ink-muted);
}

.rml-wordmark {
  display: inline-flex;
  align-items: baseline;
  width: max-content;
  font-family: var(--rml-font);
  font-size: 128px;
  font-weight: 560;
  line-height: 0.92;
  letter-spacing: 0;
  color: var(--rml-ink);
}

.rml-word-dot,
.rml-url-dot {
  width: 0.16em;
  height: 0.16em;
  border-radius: 999px;
  background: var(--rml-indigo);
  flex: 0 0 auto;
}

.rml-word-dot {
  margin-left: 0.06em;
  align-self: flex-end;
  margin-bottom: 0.08em;
  animation: rml-source-dot 2.2s cubic-bezier(0.22, 0.7, 0.2, 1) 0.18s both;
}

.rml-caption {
  max-width: 25rem;
  margin: 0;
  color: var(--rml-ink-soft);
  font-family: var(--rml-font);
  font-size: 17px;
  line-height: 1.55;
}

.rml-plan-card {
  position: relative;
  border: 1px solid var(--rml-line);
  border-radius: 8px;
  background: var(--rml-panel);
  box-shadow: 0 28px 70px rgba(17, 17, 17, 0.08);
  padding: 24px;
}

.rml-plan-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--rml-line);
}

.rml-plan-head h2 {
  margin: 8px 0 0;
  font-family: var(--rml-font);
  font-size: 32px;
  line-height: 1.12;
  font-weight: 570;
  letter-spacing: 0;
  color: var(--rml-ink);
}

.rml-link-state {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  border: 1px solid rgba(79, 70, 229, 0.18);
  border-radius: 999px;
  background: var(--rml-indigo-soft);
  color: var(--rml-indigo);
  padding: 7px 10px;
  font-family: var(--rml-mono);
  font-size: 11px;
  line-height: 1;
}

.rml-plan-rows {
  display: grid;
  gap: 0;
}

.rml-plan-row {
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr);
  gap: 18px;
  padding: 18px 0;
  border-bottom: 1px solid var(--rml-line);
}

.rml-plan-row span {
  font-family: var(--rml-mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--rml-indigo);
}

.rml-plan-row p {
  margin: 0;
  font-family: var(--rml-font);
  color: var(--rml-ink);
  font-size: 15px;
  line-height: 1.55;
}

.rml-url-bar {
  display: grid;
  gap: 10px;
  padding-top: 20px;
}

.rml-url-chip {
  position: relative;
  display: inline-flex;
  width: max-content;
  max-width: 100%;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(79, 70, 229, 0.22);
  border-radius: 999px;
  background: #ffffff;
  color: var(--rml-ink);
  padding: 9px 13px;
  font-family: var(--rml-mono);
  font-size: 13px;
  line-height: 1;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  overflow: visible;
}

.rml-url-dot {
  width: 9px;
  height: 9px;
  animation: rml-url-dot-pass 2.2s cubic-bezier(0.22, 0.7, 0.2, 1) 0.18s both;
}

.rml-url-track,
.rml-url-milestone {
  position: absolute;
  pointer-events: none;
  background: var(--rml-indigo);
}

.rml-url-track {
  left: 18px;
  bottom: -10px;
  width: min(11rem, calc(100% - 36px));
  height: 1px;
  transform-origin: left center;
  transform: scaleX(0);
  opacity: 0;
  animation: rml-track-lay 760ms cubic-bezier(0.22, 0.7, 0.2, 1) 2.18s 1 forwards;
}

.rml-url-milestone {
  left: min(calc(18px + 11rem), calc(100% - 18px));
  bottom: -14px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  opacity: 0;
  transform: translateX(-50%) scale(0.3);
  animation: rml-milestone-drop 520ms cubic-bezier(0.34, 1.56, 0.64, 1) 2.82s 1 forwards;
}

@keyframes rml-source-dot {
  0%,
  12% {
    opacity: 1;
    transform: scale(1);
  }
  28% {
    opacity: 0;
    transform: scale(0.72);
  }
  100% {
    opacity: 0;
    transform: scale(0.72);
  }
}

@keyframes rml-url-dot-pass {
  0% {
    opacity: 1;
    transform: translate3d(-420px, 146px, 0) scale(1);
  }
  68% {
    opacity: 1;
    transform: translate3d(8px, 0, 0) scale(0.92);
  }
  82% {
    transform: translate3d(-2px, 0, 0) scale(1.08);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes rml-track-lay {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  16% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes rml-milestone-drop {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.3);
  }
  62% {
    opacity: 1;
    transform: translateX(-50%) scale(1.2);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

@media (max-width: 980px) {
  .rml-hero-section {
    min-height: auto;
    padding: 76px 20px 70px;
  }

  .rml-shell {
    grid-template-columns: 1fr;
    gap: 34px;
  }

  .rml-wordmark {
    font-size: 104px;
  }

  .rml-url-dot {
    animation-name: rml-url-dot-pass-mobile;
  }
}

@keyframes rml-url-dot-pass-mobile {
  0% {
    opacity: 1;
    transform: translate3d(70px, -210px, 0) scale(1);
  }
  68% {
    opacity: 1;
    transform: translate3d(8px, 0, 0) scale(0.92);
  }
  82% {
    transform: translate3d(-2px, 0, 0) scale(1.08);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@media (max-width: 620px) {
  .rml-wordmark {
    font-size: 66px;
  }

  .rml-plan-card {
    padding: 18px;
  }

  .rml-plan-head {
    display: grid;
    gap: 14px;
  }

  .rml-link-state {
    width: max-content;
  }

  .rml-plan-row {
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 16px 0;
  }

  .rml-url-chip {
    width: 100%;
    white-space: normal;
    line-height: 1.35;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rml-word-dot,
  .rml-url-dot,
  .rml-url-track,
  .rml-url-milestone {
    animation: none !important;
  }

  .rml-word-dot {
    opacity: 0;
  }

  .rml-url-dot {
    opacity: 1;
    transform: none;
  }

  .rml-url-track {
    opacity: 1;
    transform: scaleX(1);
  }

  .rml-url-milestone {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}
`;
