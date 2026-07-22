# Signal Timeline (roadmap) — migration workflow

**Read this before touching the database schema.**

## How this repo applies schema

> **Current contract (2026-07-12): migration-first.** New changes use reviewed,
> numbered SQL and `pnpm db:migrate`. `db:push:unsafe` exists only as a named
> local escape hatch and must never target production. The paragraphs below
> document the historical push workflow; they are not authorization to use it.
> The journal was reconciled through 0008 during the qualified-view release.
> Production adoption completed on 2026-07-22: the live database now holds the
> verified 0000-0008 ledger, so future reviewed migrations may use the normal
> migrator after their own backup and dry-run gates.

This repo deploys schema with **`drizzle-kit push`** (`pnpm db:push` →
`drizzle-kit push --force`), which diffs `src/server/db/schema.ts` against the live
Turso DB and applies the difference directly. It does **not** run a `drizzle-kit
migrate` chain in production.

Consequence: the `.sql` files in `drizzle/` are **generated reference + history**, not
an automatically-applied migration sequence. The journal at `drizzle/meta/_journal.json`
intentionally trails the file list (it stopped tracking once the team moved to `push`).
Do not assume a numbered `.sql` file has run just because it exists — `push` is the
source of truth for what's live.

## 0007 Audience Timeline publications

`0007_audience_timeline_publications.sql` is additive. It adds a nullable,
immutable suite workspace join key and separate frozen publication, item, and
hashed-share tables. It does not alter or classify any legacy slug-based public
link. Apply it to a restored production copy first and run the row-count and
foreign-key checks at the foot of the file. The database stores only SHA-256
token digests, so raw share tokens are absent from backups and query results.

## 0008 Qualified Audience Timeline views

`0008_qualified_audience_views.sql` is an additive, reviewed migration. It
adds publication-level `qualified_view_count` and `last_qualified_view_at`
aggregates plus a short-lived `audience_view_receipts` deduplication table.
Receipts contain only a publication id, a publication-scoped session digest,
and creation/expiry times. They never store raw sessions, share tokens, IP
addresses, referrers, or user-agent strings. The review receipt is
`drizzle/receipts/qualified-audience-views-2026-07-22.json`; the sanitized
production execution receipt is
`drizzle/receipts/qualified-audience-views-2026-07-22-applied.json`.

The repository journal is contiguous from 0000 through 0008. Production must
not run that chain: 0000 through 0007 were historically applied outside the
ledger. The qualified-view operator proves the live effects of every migration,
creates a private logical SQLite snapshot with verified per-table counts,
applies the reviewed, idempotent 0006 `blocked` to `waiting` reconciliation and
0008 to a copy, runs the reviewed receipt proofs, and only then permits an
explicit production apply. The production write transaction reconciles any
remaining 0006 rows, applies 0008, and adopts all nine hashes in
`__drizzle_migrations` atomically; it never re-executes 0000 through 0005 or
0007. Exact 0006 affected-row counts are recorded in both reports.

Pull the production environment into a private dotenv file outside this
repository. It must contain `TIMELINE_DATABASE_URL` and
`TIMELINE_AUTH_TOKEN`. Credential values are never printed.

```powershell
# Read-only: proves 0000-0007 and reports 0008 + ledger state.
pnpm db:qualified-views -- --env C:\secure\timeline-production.env --inspect

# Read-only remote: creates and verifies a local backup, then dry-runs 0008.
pnpm db:qualified-views -- --env C:\secure\timeline-production.env `
  --snapshot C:\secure\backups\timeline-pre-0008.sqlite --dry-run

# The only production-write path. It requires a fresh snapshot and dry-run in
# the same invocation before --apply can open the write transaction.
pnpm db:qualified-views -- --env C:\secure\timeline-production.env `
  --snapshot C:\secure\backups\timeline-pre-0008.sqlite --dry-run --apply `
  --receipt C:\secure\backups\timeline-0008-applied.json
```

Snapshot and dry-run files contain a complete copy of database rows, including
stored token digests, so treat them as sensitive recovery artifacts and keep
them outside the repository. Reports contain only table counts, hashes, and
proof results; they never contain credential values or row values. Do not run
`pnpm db:migrate` against a database whose ledger state has not first been
verified with `--inspect`, and never use schema push for this release.
The applied receipt is created only after the remote transaction commits. It
records the snapshot manifest and dry-run report paths/hashes, applied time,
exact 0006 reconciliation counts, final ledger length, and all postconditions.
For the 2026-07-22 production application, 22/22 adoption proofs and 5/5
migration proofs passed, three historical task rows were reconciled from
`blocked` to `waiting`, the ledger reached 9/9, and foreign-key violations
remained zero. The private snapshot and execution receipt are retained through
2026-08-05.
On Windows the operator reserves the exact snapshot target with create-new
semantics and writes no rename-based temporary database. A snapshot is complete
only when its adjacent `.manifest.json` exists and matches; a database without
that manifest is an incomplete artifact and must never be used for restore or
apply.

## `migrate-prod.sql` — historical, already applied

`drizzle/migrate-prod.sql` was a **one-time, hand-written Cycle-7 migration**: it added
`workspaces.description` and tightened `workspace_slug` to `NOT NULL` across
projects/tasks/comments/activity/subtasks via the SQLite create-copy-drop-rename pattern.

It is **already reflected in the current schema** (`schema.ts` defines `workspaceSlug` as
`.notNull()` and the composite PKs) and the repo is many cycles past Cycle 7, so this
script has been applied to production. It is kept only as a record. **Do not re-run it** —
re-running the create-copy-drop-rename on the live DB would drop and rebuild tables.

The file now carries an "ALREADY APPLIED — DO NOT RUN" header to prevent it being
mistaken for a pending manual step (the drift risk the readiness audit flagged).

## Safe procedure for the next destructive change

Destructive changes (DROP, column rename, NOT-NULL tightening) recreate tables and are
unrecoverable if interrupted. Before running one:

1. **Snapshot** the prod DB (`turso db shell "$DB" ".dump" > pre-change.sql`) — see
   `studio/docs/RECOVERY.md` §5.
2. **Dry-run** the change on a restored copy (`<db>-staging`), verify row counts.
3. Apply to prod, verify against the snapshot, keep the snapshot ≥ 14 days.

Even for additive production changes, use reviewed numbered migrations and the
documented backup/dry-run/apply path. `db:push:unsafe` is local-only.
