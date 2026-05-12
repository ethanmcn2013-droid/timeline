-- Migration 0001: Remove isPublic + shareToken columns from projects
--
-- Phase 10.1 (2026-05-12): "No private workspaces in v1" is a locked product
-- refusal (memory: project_roadmap.md). The shareToken + isPublic columns were
-- dead promises with zero enforcement in any route handler. Public-by-design
-- IS the product.
--
-- NOTE: The original 2026-05-12 plan also intended to drop the `activity`
-- table (Phase 10.2). That was REVERSED before any migration ran — the table
-- is actively written by ~/Projects/personal/tasks/scripts/log-cycle.ts on
-- every cycle ship (cross-repo writer that the in-repo grep missed). The
-- table is alive; this migration leaves it intact.
--
-- Run via Turso CLI:
--   turso db shell <db-name> < drizzle/0001_drop_isPublic_shareToken.sql
--
-- Run ONCE against production.

-- ──────────────────────────────────────────────────────────────────────────
-- Remove isPublic + shareToken from projects
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
-- Confirm: `activity` table still present (do NOT drop — log-cycle.ts writes here)
-- Confirm: projects has no share_token/is_public columns
