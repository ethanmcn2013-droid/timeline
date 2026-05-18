-- Migration 0005: RW-2/RW-3c additions
-- (1) sourceTasksWorkspaceId on projects — nullable, additive
ALTER TABLE projects ADD COLUMN source_tasks_workspace_id TEXT;

-- (2) node_overlays — curation sidecar (ARCH_SPEC §1.5)
CREATE TABLE IF NOT EXISTS node_overlays (
  workspace_slug      TEXT NOT NULL,
  node_id             TEXT NOT NULL,
  hidden              INTEGER NOT NULL DEFAULT 0,
  label_override      TEXT,
  lane_override       TEXT,
  date_override       TEXT,
  sort_override       INTEGER,
  source              TEXT NOT NULL DEFAULT 'synced',
  manual_title        TEXT,
  manual_status       TEXT,
  manual_target_date  TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (workspace_slug, node_id)
);
CREATE INDEX IF NOT EXISTS idx_node_overlays_workspace ON node_overlays (workspace_slug);
