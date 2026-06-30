<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all
differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md - Signal Timeline

This repo is Signal Timeline, the direction-clarity product in the Signal Studio
suite.

Before copy or product changes, read `docs/PRODUCT.md`. The short version:

- Use the full name `Signal Timeline` in marketing and cross-product surfaces.
- The category is operational clarity, not project management.
- The canonical public URL is `timeline.signalstudio.ie`.
- The canonical contact address is `hello@signalstudio.ie`.
- Public copy must avoid PM vocabulary unless naming a refusal. Prefer plain
  language such as "plan", "decision", "held up", "public link", and
  "plain English".
- Locked refusals: no private workspaces, no team tier, no comment threading,
  no public directory, no demo-vs-reality gap.

If the repo does not contain a capability, do not market it as shipped.

## Signal HQ Sync

Signal HQ lives in the Studio repo and is the internal source of truth for
product, launch, growth, decisions, risks, metrics, and next actions.

When a change in Timeline affects product state, launch readiness, GTM,
messaging, campaigns, demos, templates, outreach, pilots, metrics, decisions,
risks, or strategic learning, update Signal HQ before the task is complete.

Before invite, sharing, guest access, public Timeline, collaborator update, or
source-tracking work, read `docs/COLLABORATION_LOOP.md`. Timeline owns the
direction and shareable-output moment in the collaboration loop.

Open or update a Studio PR that changes the canonical source file:

- feature scope, status, or impact: `content/hq/features/<id>.md`
- risk surfaced or mitigation changed: `content/hq/risks/<id>.md`
- decision affecting pricing, brand, GTM, or product: `content/hq/decisions/<id>.md`
- campaign goal, blocker, or progress: `content/hq/campaigns/<id>.md`
- cross-product flow, data shape, or cron schedule: `content/atlas/<slug>.md`
- growth learning: relevant files under `signal-growth/`
- shipped operator-visible change: `CHANGELOG.md`

Do not update `src/lib/hq/data.ts` unless the live Studio code path still reads
from it. The markdown and typed source files above are canonical for migrated HQ
sections.

## End-Of-Cycle Ritual

After a cycle ships in Timeline, meaning Vercel deploy succeeded, dispatch entry
was written in `CHANGELOG.md`, and `phase.md` was bumped, log the cycle from the
Tasks repo:

```bash
cd ~/Projects/personal/tasks && npx tsx scripts/log-cycle.ts \
  --project roadmap \
  --cycle <N> \
  --title "<one-line headline>" \
  --date YYYY-MM-DD \
  --description "<one-paragraph what-and-why>"
```

This pushes a row into the shared Turso DB so `ethanmcnamara.com/roadmap` stays
accurate across all products.

`npx tsx scripts/check-cycles.ts` from Tasks prints max-cycle-per-project. Run it
when you suspect drift between `phase.md` and the live DB.

The Turso URL and token come from `.env.local` in the Tasks repo. The script
writes straight to prod; there is no staging.
