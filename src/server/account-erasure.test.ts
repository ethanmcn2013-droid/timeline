/**
 * Account-erasure integration test — Signal Timeline (roadmap). GDPR
 * right-to-erasure / App Store 5.1.1(v) guard.
 *
 * Runs the REAL `eraseAccountData` against a real in-memory libSQL DB with
 * `PRAGMA foreign_keys = OFF`, so only the EXPLICIT deletes can pass — a
 * cascade can't hide a missing delete. Seeds an owner workspace plus a
 * bystander workspace owned by a different user. The load-bearing assertion
 * is that `comments` (previously left to an unreliable FK cascade) is
 * cleared for the deleted user and untouched for the bystander.
 *
 * Run: tsx --test src/server/account-erasure.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./db/schema";
import { eraseAccountData } from "./account-erasure";

async function freshDb() {
  const client = createClient({ url: ":memory:" });
  await client.execute("PRAGMA foreign_keys = OFF");
  await client.executeMultiple(`
    CREATE TABLE workspaces (
      slug text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      description text,
      owner_user_id text NOT NULL,
      owner_name text, owner_email text,
      plan text NOT NULL DEFAULT 'free',
      template_id text,
      is_demo integer NOT NULL DEFAULT 0,
      created_at integer NOT NULL DEFAULT (unixepoch()),
      updated_at integer NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE projects (
      workspace_slug text NOT NULL,
      slug text NOT NULL,
      name text NOT NULL,
      one_liner text NOT NULL,
      accent text NOT NULL,
      sort_order integer NOT NULL DEFAULT 0,
      published_at integer,
      source_tasks_workspace_id text,
      PRIMARY KEY (workspace_slug, slug)
    );
    CREATE TABLE tasks (
      id text PRIMARY KEY NOT NULL,
      project_slug text NOT NULL,
      workspace_slug text NOT NULL,
      title text NOT NULL,
      description text NOT NULL,
      status text NOT NULL DEFAULT 'next',
      phase text, tier text,
      assignee text NOT NULL DEFAULT 'claude-code',
      cycle_label text, target_date text,
      sort_order integer NOT NULL DEFAULT 0,
      kind text NOT NULL DEFAULT 'cycle',
      category text
    );
    CREATE TABLE subtasks (
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
      completed_at integer
    );
    CREATE TABLE activity (
      id text PRIMARY KEY NOT NULL,
      workspace_slug text NOT NULL,
      entity_kind text NOT NULL,
      entity_id text NOT NULL,
      action text NOT NULL,
      payload text NOT NULL DEFAULT '{}',
      created_at integer NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE comments (
      id text PRIMARY KEY NOT NULL,
      task_id text NOT NULL,
      workspace_slug text NOT NULL,
      body text NOT NULL,
      author text NOT NULL DEFAULT 'Ethan',
      created_at integer NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE project_sources (
      project_slug text NOT NULL,
      workspace_slug text NOT NULL,
      raw_markdown text NOT NULL,
      last_parsed_at integer,
      parse_error text,
      PRIMARY KEY (project_slug, workspace_slug)
    );
    CREATE TABLE node_overlays (
      workspace_slug text NOT NULL,
      node_id text NOT NULL,
      hidden integer NOT NULL DEFAULT 0,
      label_override text, lane_override text, date_override text,
      sort_override integer,
      source text NOT NULL DEFAULT 'synced',
      manual_title text, manual_status text, manual_target_date text,
      created_at integer NOT NULL DEFAULT (unixepoch()),
      updated_at integer NOT NULL DEFAULT (unixepoch())
    );
  `);
  const db = drizzle(client, { schema });
  return { client, db };
}

async function count(client: Client, where: string): Promise<number> {
  const rs = await client.execute(`SELECT COUNT(*) AS c FROM ${where}`);
  return Number(rs.rows[0]!.c);
}

async function seed(client: Client) {
  await client.executeMultiple(`
    INSERT INTO workspaces (slug, name, owner_user_id) VALUES
      ('ws-a','A','u-target'), ('ws-b','B','u-bystander');
    INSERT INTO projects (workspace_slug, slug, name, one_liner, accent) VALUES
      ('ws-a','p1','P1','one','#111'), ('ws-b','p9','P9','nine','#999');
    INSERT INTO tasks (id, project_slug, workspace_slug, title, description) VALUES
      ('t-a1','p1','ws-a','A task','d'), ('t-b1','p9','ws-b','B task','d');
    INSERT INTO subtasks (id, task_id, workspace_slug, title) VALUES
      ('s-a1','t-a1','ws-a','sub a'), ('s-b1','t-b1','ws-b','sub b');
    INSERT INTO activity (id, workspace_slug, entity_kind, entity_id, action) VALUES
      ('act-a','ws-a','task','t-a1','created'), ('act-b','ws-b','task','t-b1','created');
    INSERT INTO comments (id, task_id, workspace_slug, body) VALUES
      ('c-a1','t-a1','ws-a','hi a'), ('c-b1','t-b1','ws-b','hi b');
    INSERT INTO project_sources (project_slug, workspace_slug, raw_markdown) VALUES
      ('p1','ws-a','# a'), ('p9','ws-b','# b');
    INSERT INTO node_overlays (workspace_slug, node_id) VALUES
      ('ws-a','n-a'), ('ws-b','n-b');
  `);
}

test("erasure clears every workspace-scoped table incl. comments; bystander intact", async () => {
  const { client, db } = await freshDb();
  try {
    await seed(client);

    await eraseAccountData(db, "u-target");

    for (const where of [
      "workspaces WHERE owner_user_id='u-target'",
      "projects WHERE workspace_slug='ws-a'",
      "tasks WHERE workspace_slug='ws-a'",
      "subtasks WHERE workspace_slug='ws-a'",
      "activity WHERE workspace_slug='ws-a'",
      "comments WHERE workspace_slug='ws-a'",
      "project_sources WHERE workspace_slug='ws-a'",
      "node_overlays WHERE workspace_slug='ws-a'",
    ]) {
      assert.equal(await count(client, where), 0, `residual rows in ${where}`);
    }

    // Bystander fully intact (1 row each).
    for (const table of [
      "workspaces", "projects", "tasks", "subtasks",
      "activity", "comments", "project_sources", "node_overlays",
    ]) {
      assert.equal(await count(client, table), 1, `bystander row lost in ${table}`);
    }

    // Idempotent.
    await eraseAccountData(db, "u-target");
    assert.equal(await count(client, "comments"), 1);
  } finally {
    client.close();
  }
});

test("erasing a user who owns no workspace is a no-op", async () => {
  const { client, db } = await freshDb();
  try {
    await seed(client);
    await eraseAccountData(db, "u-nobody");
    assert.equal(await count(client, "workspaces"), 2);
    assert.equal(await count(client, "comments"), 2);
  } finally {
    client.close();
  }
});
