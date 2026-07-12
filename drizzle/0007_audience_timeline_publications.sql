-- Migration 0007: frozen Audience Timeline publications
-- Additive only. Legacy public Timeline tables, slugs, routes, and rows remain unchanged.
-- Apply first to a restored production snapshot; never use schema push in production.

ALTER TABLE workspaces ADD COLUMN suite_workspace_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS uq_workspaces_suite_workspace_id ON workspaces (suite_workspace_id);

CREATE TABLE IF NOT EXISTS timeline_publications (
  id TEXT PRIMARY KEY NOT NULL,
  workspace_slug TEXT NOT NULL,
  source_workspace_id TEXT NOT NULL,
  source_object_id TEXT,
  source_revision INTEGER NOT NULL DEFAULT 1,
  source_digest TEXT NOT NULL,
  label TEXT NOT NULL,
  primary_date_label TEXT,
  primary_date TEXT,
  audience_kind TEXT NOT NULL CHECK (audience_kind IN ('class','module','couple')),
  timezone TEXT NOT NULL,
  owner_display_label TEXT,
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft','published','unpublished')),
  last_updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  published_at INTEGER,
  unpublished_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_timeline_publications_workspace ON timeline_publications (workspace_slug);
CREATE INDEX IF NOT EXISTS idx_timeline_publications_source_workspace ON timeline_publications (source_workspace_id);
CREATE INDEX IF NOT EXISTS idx_timeline_publications_state ON timeline_publications (state);

CREATE TABLE IF NOT EXISTS timeline_publication_items (
  public_id TEXT PRIMARY KEY NOT NULL,
  publication_id TEXT NOT NULL REFERENCES timeline_publications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  calendar_date TEXT,
  state TEXT NOT NULL CHECK (state IN ('covered','now','next','later','cancelled')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  source_relation TEXT NOT NULL,
  source_digest TEXT NOT NULL,
  copied_at INTEGER NOT NULL DEFAULT (unixepoch()),
  published_at INTEGER,
  unpublished_at INTEGER,
  diverged_at INTEGER,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_timeline_publication_items_publication ON timeline_publication_items (publication_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_timeline_publication_items_source ON timeline_publication_items (source_relation);

CREATE TABLE IF NOT EXISTS audience_shares (
  id TEXT PRIMARY KEY NOT NULL,
  publication_id TEXT NOT NULL REFERENCES timeline_publications(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'active' CHECK (state IN ('active','revoked','expired','rotated')),
  version INTEGER NOT NULL DEFAULT 1,
  expires_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  rotated_at INTEGER,
  revoked_at INTEGER,
  last_access_at INTEGER,
  visit_count INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_audience_shares_token_hash ON audience_shares (token_hash);
CREATE INDEX IF NOT EXISTS idx_audience_shares_publication ON audience_shares (publication_id, state);
CREATE INDEX IF NOT EXISTS idx_audience_shares_expiry ON audience_shares (expires_at);

-- Staging verification:
-- SELECT COUNT(*) FROM workspaces;
-- SELECT COUNT(*) FROM timeline_publications;
-- SELECT COUNT(*) FROM timeline_publication_items;
-- SELECT COUNT(*) FROM audience_shares;
-- PRAGMA foreign_key_check;
