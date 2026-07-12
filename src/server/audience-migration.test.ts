import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createClient } from "@libsql/client";

test("0007 is additive over realistic legacy workspace and project rows", async () => {
  const client = createClient({ url: ":memory:" });
  try {
    await client.executeMultiple(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE workspaces (
        slug TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        owner_user_id TEXT NOT NULL
      );
      CREATE TABLE projects (
        workspace_slug TEXT NOT NULL,
        slug TEXT NOT NULL,
        name TEXT NOT NULL,
        PRIMARY KEY (workspace_slug, slug)
      );
      INSERT INTO workspaces (slug, name, owner_user_id)
        VALUES ('teaching-2025', 'Teaching 2025', 'user-1');
      INSERT INTO projects (workspace_slug, slug, name)
        VALUES ('teaching-2025', 'history', 'History');
    `);
    const migration = readFileSync(
      new URL("../../drizzle/0007_audience_timeline_publications.sql", import.meta.url),
      "utf8",
    );
    await client.executeMultiple(migration);

    const workspace = await client.execute(
      "SELECT slug, name, owner_user_id, suite_workspace_id FROM workspaces",
    );
    assert.deepEqual(
      [...workspace.rows].map((row) => ({
        slug: String(row.slug),
        name: String(row.name),
        owner: String(row.owner_user_id),
        suiteWorkspaceId: row.suite_workspace_id,
      })),
      [
        {
          slug: "teaching-2025",
          name: "Teaching 2025",
          owner: "user-1",
          suiteWorkspaceId: null,
        },
      ],
    );
    const project = await client.execute("SELECT workspace_slug, slug, name FROM projects");
    assert.equal(project.rows.length, 1);
    assert.equal(project.rows[0]!.slug, "history");

    for (const table of [
      "timeline_publications",
      "timeline_publication_items",
      "audience_shares",
    ]) {
      const count = await client.execute(`SELECT COUNT(*) AS count FROM ${table}`);
      assert.equal(Number(count.rows[0]!.count), 0);
    }
    const foreignKeys = await client.execute("PRAGMA foreign_key_check");
    assert.equal(foreignKeys.rows.length, 0);
  } finally {
    client.close();
  }
});
