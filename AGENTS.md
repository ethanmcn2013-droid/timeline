<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# End-of-cycle ritual

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
