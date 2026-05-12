-- Migration 0001: Drop activity table + remove isPublic/shareToken from projects
--
-- Phase 10.2: activity table has zero writers. Dead infrastructure removed.
-- Phase 10.1: isPublic + shareToken removed from projects. "No private workspaces
--             in v1" is a locked product refusal. Public-by-design IS the product.
--
-- SQLite does not support DROP TABLE IF EXISTS inline in the same migration style,
-- but the syntax is standard. Run via Turso CLI:
--   turso db shell <db-name> < drizzle/0001_drop_activity_isPublic_shareToken.sql
--
-- BEFORE running: verify no rows in activity (should be empty):
--   SELECT COUNT(*) FROM activity;
-- If > 0, inspect and delete manually before dropping.
--
-- Run ONCE against production. Idempotent in the sense that dropping a
-- non-existent table will error — wrap in IF EXISTS as shown.

-- ──────────────────────────────────────────────────────────────────────────
-- STEP 1: Drop the activity table
-- ──────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS activity;

-- ──────────────────────────────────────────────────────────────────────────
-- STEP 2: Remove isPublic + shareToken from projects
--
-- SQLite does not support DROP COLUMN directly on older versions.
-- Use the recreate-copy-rename pattern for safety.
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE projects_new (
    workspace_slug text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    one_liner text NOT NULL,
    accent text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    PRIMARY KEY (workspace_slug, slug)
);

INSERT INTO projects_new (workspace_slug, slug, name, one_liner, accent, sort_order)
SELECT workspace_slug, slug, name, one_liner, accent, sort_order
FROM projects;

DROP TABLE projects;
ALTER TABLE projects_new RENAME TO projects;

-- Done. Verify with:
-- SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;
-- Confirm: no 'activity' table, projects has no share_token/is_public columns.
