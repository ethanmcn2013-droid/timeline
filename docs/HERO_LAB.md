# Timeline hero lab · review and handoff

Review-only hero showroom for the Signal Timeline homepage.

- Branch: `feat/timeline-hero-lab`
- Index: `/lab`
- Robots: `noindex, nofollow`
- HQ live preview: linked from Signal HQ's Product Hero Room
- Production posture: do not promote the whole lab. Promote only a selected
  direction into the homepage hero after the review gate.

## Current decision

Two directions are operator-preferred.

1. **One Line** (`/lab/one-line`) is the flagship. The sentence's underline is
   the real timeline axis. It opens into a semantic public-plan artifact, reveals
   four dated moments in one pass, closes on one small wordmark sweep, and rests.
2. **The Line** (`/lab/the-line`) is the quieter counterpoint. The public folio
   and editorial rule stay fixed while three short sentences hand off to a single
   left-to-right read of the plan.

Three sharing-story candidates remain for comparison, not as front-runners:

- **The Open Plan** (`/lab/the-open-plan`) · the sign-in wall dissolves.
- **The Link** (`/lab/the-link`) · the URL is shown inside a browser reading room.
- **The Open Line** (`/lab/open-line`) · the URL cord feeds the timeline axis.

The registry and decision copy live in
`src/components/lab/registry.tsx`. Keys `1` through `5` switch directions and
`R` replays the current one.

## Files

- `src/app/lab/layout.tsx` · noindex metadata and lab-only chrome suppression.
- `src/app/lab/page.tsx` · showroom index.
- `src/app/lab/[slug]/page.tsx` · static option route.
- `src/components/lab/switcher.tsx` · keyboard and tab navigation.
- `src/components/lab/option-one-line.tsx` · flagship.
- `src/components/lab/option-the-line.tsx` · quiet counterpoint.
- `src/components/lab/option-the-open-plan.tsx` · candidate.
- `src/components/lab/option-the-link.tsx` · candidate.
- `src/components/lab/option-open-line.tsx` · candidate.

## Motion contract

The preferred pair follows the Signal Hero Playbook in
`../audit/HERO_COUNCIL_SPECS.md`:

- a short sentence establishes the job before the mechanism;
- the settled result is a real, useful public-plan artifact;
- default CSS is the settled result for SSR, no-JS, and reduced motion;
- the sequence plays once and becomes still;
- indigo is used only for product logic;
- animation uses transform, opacity, and clip-path;
- mobile uses a grid-aligned vertical axis and keeps due/status detail;
- calls to action point to the real wedding plan and demo routes.

One Line and The Line deliberately share content and visual grammar, but not the
same opening. One Line earns the larger transmutation. The Line stays editorial
and restrained.

## Local review

```powershell
cd C:\Users\ethan\signal-studio-workspace\roadmap
$env:SIGNAL_ACCESS_MODE = "demo"
$env:NEXT_PUBLIC_SIGNAL_ACCESS_MODE = "demo"
pnpm dev
```

Open `http://localhost:3000/lab`. Next may choose another port when 3000 is in
use; use the URL printed by Next.

The repository's headless Chrome review pattern is documented in
`../audit/HERO_ITERATION_LOG.md`. Capture at least:

- desktop intro, handoff, and rest;
- mobile intro, handoff, and rest;
- desktop and mobile with reduced motion;
- an overflow check at intermediate widths.

`lab-shots/` is gitignored. Regenerate snapshots after motion or responsive
changes; older July 5 captures predate One Line and The Open Plan.

## Verification

```powershell
pnpm typecheck
pnpm lint -- src/app/lab src/components/lab
pnpm ds:check
pnpm build
git diff --check
```

## Promotion target

When a winner clears the review gate, move only its proven structure into
`src/components/marketing/hero.tsx` and retire or reconcile the separate
`src/components/marketing/roadmap-hero-loader.tsx` opener. Keep the lab branch as
the exploration record.
