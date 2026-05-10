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
