# Signal Timeline (roadmap) — migration workflow

**Read this before touching the database schema.**

## How this repo applies schema

> **Current contract (2026-07-12): migration-first.** New changes use reviewed,
> numbered SQL and `pnpm db:migrate`. `db:push:unsafe` exists only as a named
> local escape hatch and must never target production. The paragraphs below
> document the historical push workflow; they are not authorization to use it.
> Because the journal trails manually applied migrations, reconcile it and
> record a backup/dry-run/apply receipt before running the migrator on the
> existing production database.

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

For purely additive changes (new nullable column, new index), `pnpm db:push` is safe.
