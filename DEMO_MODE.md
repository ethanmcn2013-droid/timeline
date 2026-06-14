# Demo / Review Mode — Signal Timeline

Timeline ships the suite-wide **access-mode** layer so the authenticated
dashboard can be reviewed during development without weakening production auth.
Suite-level rationale: `studio/docs/DEMO_REVIEW_MODE.md`.

## Four modes

`SIGNAL_ACCESS_MODE` (server) + `NEXT_PUBLIC_SIGNAL_ACCESS_MODE` (client):

| Mode | Auth | Data |
|------|------|------|
| `production` | Real Clerk session required | Real Turso DB, per-workspace |
| `development` | Keyless dev bypass (existing) | Real DB / `dev-user` |
| `demo` | **No login wall on /app** | **In-memory demo workspace** |
| `review` | Same as demo | Same as demo |

Default when unset: `production` under `NODE_ENV=production`, else `development`.

## Safety invariant

Demo/review never query the real DB. `requireUser`/`getCurrentUser`/
`getCurrentWorkspace` resolve to the synthetic demo identity + `demoWorkspace`,
and the read queries (`getProjectsForWorkspace`, `isWorkspacePublished`,
`getEffectiveNodesForWorkspace`) short-circuit to `src/lib/roadmap/demo-data.ts`
before any `db` call. No real tenant data is reachable on the demo path.

Note: Timeline's public roadmap (`/{workspaceSlug}`, `/demo`) was already
no-auth by design — demo mode additionally unblocks the authenticated `/app`
dashboard + plan editor.

## Enable / disable

```bash
cp .env.example .env.local   # set both vars to demo (or review)
npm run dev
```
Preview deploy: set both env vars to `demo`/`review`. Keep the Clerk keys
present (Clerk's middleware needs them); demo requires no valid session and no
Turso/Upstash DB to render `/app`. Restore production auth by setting both back to
`production` (or unsetting — production is the default in a prod build).

## Review routes

- `/app` — workspace dashboard (seeded projects)
- `/app/plan/product` — plan curation surface (seeded nodes)
- `/demo` — public roadmap demo (already public)
- `/` marketing homepage

Suite hub: `https://signalstudio.ie/review`.

## Remaining technical debt

- Write/mutation actions (create workspace/project, publish, curate) still
  target the DB. In demo the dashboard is read-focused; interactive demo writes
  are out of scope for review cycles.
