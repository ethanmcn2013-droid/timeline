-- Migration 0004: Add published_at to projects
--
-- Operator-confirmed reversal of the "no private workspaces" locked refusal
-- (SEAMLESS_ECOSYSTEM_PLAN.md 2026-05-18). The toggle existed in Phase 1,
-- was removed in 0001_drop_isPublic_shareToken.sql, and is now reinstated
-- as a nullable timestamp on the projects table.
--
-- NULL = draft (not publicly viewable).
-- Non-null = published (no-auth public URL live).
--
-- DATA SAFETY RULE (binding per LAYER0_ROUTE_ALLOWLIST.md §Roadmap draft/publish model):
--   Every existing row MUST be backfilled to published so that live public
--   roadmaps (/the-wedding, /tasks, /portfolio, etc.) do NOT go dark.
--   The backfill uses unixepoch() (current time) because the projects table
--   has no created_at column (it was dropped in 0001). This is correct:
--   all currently-visible rows are "already published"; setting published_at
--   to now() preserves their public status. Only rows INSERTed after this
--   migration runs will default to NULL (draft).
--
-- Run via Turso CLI:
--   turso db shell ethanmcnamara-roadmap < drizzle/0004_add_published_at.sql
--
-- Verify with:
--   SELECT workspace_slug, slug, published_at FROM projects;
--   (all existing rows should show a non-null integer epoch)

-- Step 1: Add the column as nullable (default NULL = draft for new rows).
ALTER TABLE projects ADD COLUMN published_at INTEGER;

-- Step 2: DATA SAFETY BACKFILL — mark every existing project as published.
-- This is the unconditional clause that prevents live roadmaps going dark.
-- Without this, every existing /{workspaceSlug}/... URL would 404.
UPDATE projects SET published_at = unixepoch() WHERE published_at IS NULL;
