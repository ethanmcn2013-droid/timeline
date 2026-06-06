-- Migration 0006: Rename status enum value `blocked` → `waiting`
--
-- Closes the calm-status-vocabulary thread (R·19 display swap, R·20
-- KIND/attention layer). R·21 aligns the persisted token so the word a
-- stakeholder reads ("Waiting") is the same word stored in the database.
--
-- The Status TypeScript union is enforced at the application layer, not by
-- a CHECK constraint or DB-level enum. The migration is therefore a pure
-- data UPDATE: rewrite every existing row to the new value. Two tables
-- carry the Status enum:
--   - tasks.status (NOT NULL, default 'next')
--   - node_overlays.manual_status (NULL allowed; only set for manual nodes)
--
-- DATA SAFETY:
--   No row is dropped. Every `blocked` row becomes `waiting` in place.
--   No downstream code reads the literal "blocked" after this migration
--   ships (verified by typecheck — the Status union no longer admits it).
--
-- Run via Turso CLI:
--   turso db shell ethanmcnamara-roadmap < drizzle/0006_rename_status_blocked_to_waiting.sql
--
-- Verify with:
--   SELECT status, COUNT(*) FROM tasks GROUP BY status;
--   SELECT manual_status, COUNT(*) FROM node_overlays WHERE manual_status IS NOT NULL GROUP BY manual_status;
--   (no rows should show status='blocked' after the migration)

UPDATE tasks SET status = 'waiting' WHERE status = 'blocked';
UPDATE node_overlays SET manual_status = 'waiting' WHERE manual_status = 'blocked';
