-- Production migration for Cycle 7 (Roadmap)
--
-- Applies to an existing Turso DB that was created via drizzle-kit push
-- (no prior migration history). Run this ONCE manually before deploying.
--
-- BEFORE running:
--   1. Check for legacy null-workspace rows:
--      SELECT slug, workspace_slug FROM projects WHERE workspace_slug IS NULL;
--      SELECT id, workspace_slug FROM tasks WHERE workspace_slug IS NULL;
--   2. If any exist, backfill them OR delete them (see comment below).
--   3. Run this script via turso CLI (see runbook).
--
-- DECISION on legacy null-workspace rows:
--   The production DB was created for multi-tenant use (cycles 1-6).
--   No legacy null-workspace rows are expected. If any are found:
--     - Option A (preferred): delete them — they were seeded test data.
--     - Option B: backfill workspaceSlug to 'legacy' and ensure a 'legacy'
--       workspace row exists in the workspaces table.

-- ──────────────────────────────────────────────────────────────────────────
-- STEP 1: workspaces — add description column (additive, safe)
-- ──────────────────────────────────────────────────────────────────────────
ALTER TABLE workspaces ADD COLUMN description text;

-- ──────────────────────────────────────────────────────────────────────────
-- STEP 2: projects — composite PK migration
--
-- SQLite does not support ALTER TABLE ADD PRIMARY KEY or DROP COLUMN for PK.
-- The correct approach is: create new table, copy data, drop old, rename.
-- ──────────────────────────────────────────────────────────────────────────

-- First: if any null workspace_slug rows exist, clean them up:
-- DELETE FROM tasks WHERE workspace_slug IS NULL;
-- DELETE FROM projects WHERE workspace_slug IS NULL;
-- (Uncomment the lines above if your check in STEP 0 found rows.)

-- Create the new projects table with composite PK
CREATE TABLE projects_new (
    workspace_slug text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    one_liner text NOT NULL,
    accent text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    share_token text,
    is_public integer NOT NULL DEFAULT true,
    PRIMARY KEY (workspace_slug, slug)
);

-- Copy rows where workspace_slug is not null
-- (null rows would be dropped here — intentional, per decision above)
INSERT INTO projects_new SELECT
    workspace_slug,
    slug,
    name,
    one_liner,
    accent,
    sort_order,
    share_token,
    is_public
FROM projects
WHERE workspace_slug IS NOT NULL;

-- Drop old table and rename
DROP TABLE projects;
ALTER TABLE projects_new RENAME TO projects;

-- ──────────────────────────────────────────────────────────────────────────
-- STEP 3: tasks — make workspace_slug NOT NULL
--
-- Same recreate-copy-rename pattern (SQLite limitation).
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE tasks_new (
    id text PRIMARY KEY NOT NULL,
    project_slug text NOT NULL,
    workspace_slug text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    status text NOT NULL DEFAULT 'next',
    phase text,
    tier text,
    assignee text NOT NULL DEFAULT 'claude-code',
    cycle_label text,
    target_date text,
    sort_order integer NOT NULL DEFAULT 0,
    kind text NOT NULL DEFAULT 'cycle',
    category text,
    priority text,
    blocker_id text,
    unblocks integer,
    week_heading text,
    channel text,
    is_launch integer NOT NULL DEFAULT false,
    day text,
    posting_time text,
    created_at integer NOT NULL DEFAULT (unixepoch()),
    updated_at integer NOT NULL DEFAULT (unixepoch()),
    completed_at integer
);

INSERT INTO tasks_new SELECT
    id, project_slug, workspace_slug, title, description, status,
    phase, tier, assignee, cycle_label, target_date, sort_order,
    kind, category, priority, blocker_id, unblocks, week_heading,
    channel, is_launch, day, posting_time, created_at, updated_at, completed_at
FROM tasks
WHERE workspace_slug IS NOT NULL;

DROP TABLE tasks;
ALTER TABLE tasks_new RENAME TO tasks;

-- Recreate indexes on tasks
CREATE INDEX idx_tasks_project_status ON tasks (project_slug, status);
CREATE INDEX idx_tasks_assignee ON tasks (assignee);
CREATE INDEX idx_tasks_phase ON tasks (phase);
CREATE INDEX idx_tasks_kind ON tasks (kind);
CREATE INDEX idx_tasks_blocker ON tasks (blocker_id);
CREATE INDEX idx_tasks_workspace_project ON tasks (workspace_slug, project_slug);

-- ──────────────────────────────────────────────────────────────────────────
-- STEP 4: comments — make workspace_slug NOT NULL
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE comments_new (
    id text PRIMARY KEY NOT NULL,
    task_id text NOT NULL,
    workspace_slug text NOT NULL,
    body text NOT NULL,
    author text NOT NULL DEFAULT 'Ethan',
    created_at integer NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

INSERT INTO comments_new SELECT id, task_id, workspace_slug, body, author, created_at
FROM comments WHERE workspace_slug IS NOT NULL;

DROP TABLE comments;
ALTER TABLE comments_new RENAME TO comments;
CREATE INDEX idx_comments_task ON comments (task_id);

-- ──────────────────────────────────────────────────────────────────────────
-- STEP 5: activity — make workspace_slug NOT NULL
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE activity_new (
    id text PRIMARY KEY NOT NULL,
    workspace_slug text NOT NULL,
    entity_kind text NOT NULL,
    entity_id text NOT NULL,
    action text NOT NULL,
    payload text NOT NULL DEFAULT '{}',
    created_at integer NOT NULL DEFAULT (unixepoch())
);

INSERT INTO activity_new SELECT id, workspace_slug, entity_kind, entity_id, action, payload, created_at
FROM activity WHERE workspace_slug IS NOT NULL;

DROP TABLE activity;
ALTER TABLE activity_new RENAME TO activity;
CREATE INDEX idx_activity_entity ON activity (entity_kind, entity_id);

-- ──────────────────────────────────────────────────────────────────────────
-- STEP 6: subtasks — make workspace_slug NOT NULL
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE subtasks_new (
    id text PRIMARY KEY NOT NULL,
    task_id text NOT NULL,
    workspace_slug text NOT NULL,
    title text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'next',
    assignee text NOT NULL DEFAULT 'claude-code',
    sort_order integer NOT NULL DEFAULT 0,
    created_at integer NOT NULL DEFAULT (unixepoch()),
    updated_at integer NOT NULL DEFAULT (unixepoch()),
    completed_at integer,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

INSERT INTO subtasks_new SELECT id, task_id, workspace_slug, title, description, status, assignee, sort_order, created_at, updated_at, completed_at
FROM subtasks WHERE workspace_slug IS NOT NULL;

DROP TABLE subtasks;
ALTER TABLE subtasks_new RENAME TO subtasks;
CREATE INDEX idx_subtasks_task ON subtasks (task_id);

-- Done. Verify with:
-- SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;
