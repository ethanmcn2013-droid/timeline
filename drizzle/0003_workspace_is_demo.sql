-- Migration: 0003_workspace_is_demo.sql
-- Adds is_demo boolean column to workspaces.
-- Replaces the reserved-slug check (slug = 'tasks') used in the public
-- viewer — an explicit flag is less fragile than coupling demo detection
-- to a slug value that could change. Default false for all existing rows.

ALTER TABLE workspaces ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 0;

-- Mark the seeded demo workspace. If the seed has not been run yet this
-- is a no-op (0 rows updated), which is safe — the seed script also sets
-- the flag directly.
UPDATE workspaces SET is_demo = 1 WHERE slug = 'tasks';
