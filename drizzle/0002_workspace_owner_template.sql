-- Sprint 2 cycles 10.2 / 10.3 + Templates T-2.1 added three new
-- columns to workspaces in code (`ownerName`, `ownerEmail`, `templateId`)
-- but no migration was committed at the time — prod was kept in sync
-- via `pnpm db:push --force`. This file is the retroactive migration
-- so the journal matches the schema.
--
-- STATE OF PROD (verified 2026-05-13 via `PRAGMA table_info(workspaces)`):
-- The three columns ALREADY EXIST on ethanmcnamara-roadmap. Re-running
-- this script will error with "duplicate column name" — that's the
-- expected behaviour and indicates prod is at parity. Do NOT attempt
-- a workaround; the error is the signal.
--
-- For a FRESH environment, run via:
--   turso db shell <new-db> < drizzle/0002_workspace_owner_template.sql
--
-- All columns are nullable text — pure additive, safe on a populated table.

-- Add `owner_name` (Sprint 2 cycle 10.2 — public guest views render
-- "Shared by ${ownerName}"). Captured from Clerk at workspace-creation.
ALTER TABLE workspaces ADD COLUMN owner_name text;

-- Add `owner_email` (Sprint 2 cycle 10.3 — mailto reply gesture on
-- shared update page). Also captured from Clerk at creation.
ALTER TABLE workspaces ADD COLUMN owner_email text;

-- Add `template_id` (Templates T-2.1 — canonical workspace template
-- this workspace was remixed from). Used by Notes/Roadmap/Analytics
-- to lazily seed per-layer slices on first visit.
ALTER TABLE workspaces ADD COLUMN template_id text;

-- Verify with:
-- PRAGMA table_info(workspaces);
