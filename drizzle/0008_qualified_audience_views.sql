-- Migration 0008: qualified Audience Timeline views
-- Reviewed, additive-only follow-up to 0007_audience_timeline_publications.sql.
-- Apply to a restored production snapshot first. Do not use schema push.

ALTER TABLE timeline_publications
  ADD COLUMN qualified_view_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE timeline_publications
  ADD COLUMN last_qualified_view_at INTEGER;

CREATE TABLE audience_view_receipts (
  publication_id TEXT NOT NULL REFERENCES timeline_publications(id) ON DELETE CASCADE,
  session_hash TEXT NOT NULL
    CHECK (length(session_hash) = 64 AND session_hash NOT GLOB '*[^0-9a-f]*'),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (publication_id, session_hash)
) WITHOUT ROWID;

CREATE INDEX idx_audience_view_receipts_expiry
  ON audience_view_receipts (expires_at);

-- Restored-snapshot verification:
-- SELECT COUNT(*) FROM pragma_table_info('timeline_publications')
--   WHERE name IN ('qualified_view_count', 'last_qualified_view_at');
-- SELECT COUNT(*) FROM pragma_table_info('audience_view_receipts');
-- SELECT COUNT(*) FROM pragma_index_list('audience_view_receipts')
--   WHERE name = 'idx_audience_view_receipts_expiry';
-- SELECT COUNT(*) FROM timeline_publications WHERE qualified_view_count < 0;
-- PRAGMA foreign_key_check;
