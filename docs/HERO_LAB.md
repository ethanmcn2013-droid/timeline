# Timeline hero lab — review & handoff

Local-review-only showroom of hero directions for the Signal Timeline homepage.
Branch: `feat/timeline-hero-lab`. **Not for production merge** — `/lab` is a dev
review surface and would need route-gating before any merge to `main`.

## Relaunch (to keep reviewing)

```bash
cd ~/signal-studio-workspace/roadmap    # (Windows: C:\Users\ethan\signal-studio-workspace\roadmap)
git checkout feat/timeline-hero-lab
npm run dev
```

Open **http://localhost:3000/lab** (Next may pick 3001 if 3000 is taken — check
the terminal). Keys **1–3** jump between directions, **R** replays the intro.

Static snapshots for quick review without running the app: `lab-shots/`
(gitignored, local only): `the-line-rest.png`, `the-link-rest.png`,
`open-line-rest.png`, `index.png`.

## The three directions

All are SSR-safe (the settled rest state IS the default CSS; intro motion is
gated behind `@media (prefers-reduced-motion: no-preference)`), scoped by class
prefix, on DS tokens + Geist, single-indigo (#4f46e5) discipline, on brand voice.

- **The Line** (`src/components/lab/option-the-line.tsx`, `tl1-`) — one editorial
  timeline. Folio rule with a real link chip, dated markers Now/Soon/Later/Done,
  a dated "Set aside" coda, dashed tail to `02030`. "The plan, on one line."
- **The Link** (`option-the-link.tsx`, `tl2-`) — a premium browser (tab, nav,
  favicon, path types in) opens the shared URL with no login wall; the plan reads
  as the guest sees it with a connecting spine. "Send the link. They just read it."
- **The Open Line** — HYBRID (`option-open-line.tsx`, `tlo-`) — the URL opens to
  the horizontal line; an indigo cord hangs from the highlighted `/the-wedding`
  path into the Now marker, so the link becomes the line. "One link opens the
  whole plan."

Registry + index + switcher: `src/components/lab/registry.tsx`,
`src/app/lab/page.tsx`, `src/components/lab/switcher.tsx`.

## How it was made

Two rounds of a 3-lens design panel (motion/craft · editorial/type ·
product-truth), fixes applied each round, alignment tuned by Playwright DOM
measurement. `tsc --noEmit` clean. Cut earlier this session: a "Plain English"
translation direction and a "Horizon" cinematic wildcard (in git history).

## Open questions for the next session

- Hybrid: the lower-left of the browser is quiet negative space — bring the mast
  down to meet the line, or let the line span more width?
- Motion depth: cord "pouring" into the line; hover states on markers.
- Content realism: swap the wedding sample for another audience (freelancer /
  venue) to pressure-test copy.
- Pick a front-runner and spin variants of just that one (layout, scale, motion).

Eventual promotion target (when a winner is chosen): `src/components/marketing/
hero.tsx` + `src/components/marketing/roadmap-hero-loader.tsx`.

The mock `.tlo-*`/`.tl2-*` pixel offsets (cord height, plot padding-left 288,
spine left 91) are calibrated to the review layout at 1440px width — re-measure
if the omnibox text or fonts change.
