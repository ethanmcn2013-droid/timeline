/**
 * Account-export integration test · Signal Timeline (roadmap). GDPR Art. 20.
 *
 * In-memory libSQL with an owner + a bystander workspace; asserts the export
 * contains exactly the caller's workspaces and their content, never the
 * bystander's.
 *
 * Run: tsx --test src/server/account-export.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./db/schema";
import { exportAccountData } from "./account-export";

async function freshDb() {
  const client = createClient({ url: ":memory:" });
  await client.executeMultiple(`
    CREATE TABLE workspaces (
      slug text PRIMARY KEY NOT NULL, name text NOT NULL, description text,
      owner_user_id text NOT NULL, owner_name text, owner_email text,
      plan text NOT NULL DEFAULT 'free', template_id text,
      is_demo integer NOT NULL DEFAULT 0,
      created_at integer NOT NULL DEFAULT (unixepoch()),
      updated_at integer NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE projects (
      workspace_slug text NOT NULL, slug text NOT NULL, name text NOT NULL,
      one_liner text NOT NULL, accent text NOT NULL,
      sort_order integer NOT NULL DEFAULT 0, published_at integer,
      source_tasks_workspace_id text, PRIMARY KEY (workspace_slug, slug)
    );
    CREATE TABLE tasks (
      id text PRIMARY KEY NOT NULL, project_slug text NOT NULL, workspace_slug text NOT NULL,
      title text NOT NULL, description text NOT NULL, status text NOT NULL DEFAULT 'next',
      phase text, tier text, assignee text NOT NULL DEFAULT 'claude-code',
      cycle_label text, target_date text, sort_order integer NOT NULL DEFAULT 0,
      kind text NOT NULL DEFAULT 'cycle', category text,
      priority text, blocker_id text, unblocks integer, week_heading text, channel text,
      is_launch integer NOT NULL DEFAULT 0, day text, posting_time text,
      created_at integer NOT NULL DEFAULT (unixepoch()),
      updated_at integer NOT NULL DEFAULT (unixepoch()), completed_at integer
    );
    CREATE TABLE subtasks (
      id text PRIMARY KEY NOT NULL, task_id text NOT NULL, workspace_slug text NOT NULL,
      title text NOT NULL, description text, status text NOT NULL DEFAULT 'next',
      assignee text NOT NULL DEFAULT 'claude-code', sort_order integer NOT NULL DEFAULT 0,
      created_at integer NOT NULL DEFAULT (unixepoch()),
      updated_at integer NOT NULL DEFAULT (unixepoch()), completed_at integer
    );
    CREATE TABLE activity (
      id text PRIMARY KEY NOT NULL, workspace_slug text NOT NULL, entity_kind text NOT NULL,
      entity_id text NOT NULL, action text NOT NULL, payload text NOT NULL DEFAULT '{}',
      created_at integer NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE comments (
      id text PRIMARY KEY NOT NULL, task_id text NOT NULL, workspace_slug text NOT NULL,
      body text NOT NULL, author text NOT NULL DEFAULT 'Ethan',
      created_at integer NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE project_sources (
      project_slug text NOT NULL, workspace_slug text NOT NULL, raw_markdown text NOT NULL,
      last_parsed_at integer, parse_error text, PRIMARY KEY (project_slug, workspace_slug)
    );
    CREATE TABLE node_overlays (
      workspace_slug text NOT NULL, node_id text NOT NULL, hidden integer NOT NULL DEFAULT 0,
      label_override text, lane_override text, date_override text, sort_override integer,
      source text NOT NULL DEFAULT 'synced', manual_title text, manual_status text,
      manual_target_date text, created_at integer NOT NULL DEFAULT (unixepoch()),
      updated_at integer NOT NULL DEFAULT (unixepoch())
    );
    INSERT INTO workspaces (slug, name, owner_user_id) VALUES
      ('ws-a','A','u-target'), ('ws-b','B','u-bystander');
    INSERT INTO projects (workspace_slug, slug, name, one_liner, accent) VALUES
      ('ws-a','p1','P1','one','#111'), ('ws-b','p9','P9','nine','#999');
    INSERT INTO tasks (id, project_slug, workspace_slug, title, description) VALUES
      ('t-a1','p1','ws-a','A task','d'), ('t-b1','p9','ws-b','B task','d');
    INSERT INTO comments (id, task_id, workspace_slug, body) VALUES
      ('c-a1','t-a1','ws-a','hi a'), ('c-b1','t-b1','ws-b','hi b');
  `);
  return { client, db: drizzle(client, { schema }) };
}

test("export contains only the caller's owned workspaces and content", async () => {
  const { client, db } = await freshDb();
  try {
    const data = await exportAccountData(db, "u-target");
    assert.equal(data.workspaces.length, 1);
    assert.equal(data.workspaces[0]!.slug, "ws-a");
    assert.equal(data.projects.length, 1);
    assert.equal(data.tasks.length, 1);
    assert.equal(data.comments.length, 1);
    assert.equal(data.comments[0]!.body, "hi a");
    assert.ok(!JSON.stringify(data).includes("ws-b"), "bystander workspace leaked");
  } finally {
    (client as Client).close();
  }
});

test("export of a user who owns no workspace is empty", async () => {
  const { client, db } = await freshDb();
  try {
    const data = await exportAccountData(db, "u-nobody");
    assert.equal(data.workspaces.length, 0);
    assert.equal(data.tasks.length, 0);
  } finally {
    (client as Client).close();
  }
});
