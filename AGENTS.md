<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# End-of-cycle ritual

## Suite contract

This repo is **Signal Roadmap**, the direction-clarity product in the
Signal Studio suite.

Before copy or product changes, read `docs/PRODUCT.md`. The short version:

- Use the full name `Signal Roadmap` in marketing and cross-product surfaces.
- The category is operational clarity, not project management.
- The canonical public URL is `roadmap.signalstudio.ie`.
- The canonical contact address is `hello@signalstudio.ie`.
- Public copy must avoid PM vocabulary unless naming a refusal. Prefer plain
  language such as "plan", "decision", "held up", "public link", and
  "plain English".
- Locked refusals: no private workspaces, no team tier, no comment threading,
  no public directory, no demo-vs-reality gap.

If the repo does not contain a capability, do not market it as shipped.

## Signal HQ sync

Signal HQ lives in the Studio repo at `ethanmcn2013-droid/studio` and is the internal source of truth for product, launch, growth, decisions, risks, metrics, and next actions.

When a change in Roadmap affects product state, roadmap, launch readiness, GTM, messaging, campaigns, demos, templates, outreach, pilots, metrics, decisions, risks, or strategic learning, update Signal HQ before the task is complete.

Before invite, sharing, guest access, public roadmap, stakeholder update, or source-tracking work, read `docs/COLLABORATION_LOOP.md`. Roadmap owns the direction and shareable-output moment in the collaboration loop.

In practice, open or update a Studio PR that changes:

- `src/lib/hq/data.ts`
- `src/lib/hq/signals.ts` if derived signal logic changes
- relevant files under `signal-growth/`
- `CHANGELOG.md` for meaningful operator-visible changes

Also bump `seedHqData.updatedAt` so `/hq` can detect newer repo-backed data.

After a cycle ships in Roadmap (Vercel deploy succeeded, phase.md bumped), log the cycle from the Tasks repo:

```bash
cd ~/Projects/personal/tasks && npx tsx scripts/log-cycle.ts \
  --project roadmap \
  --cycle <N> \
  --title "<one-line headline>" \
  --date YYYY-MM-DD \
  --description "<one-paragraph what-and-why>"
```

This pushes a row into the shared Turso DB so `ethanmcnamara.com/roadmap` stays accurate across all products.

`npx tsx scripts/check-cycles.ts` (from Tasks) prints max-cycle-per-project — run it any time you suspect drift between phase.md and the live DB.

The Turso URL + token come from `.env.local` in the Tasks repo. The script writes straight to prod; there is no staging.
