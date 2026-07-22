import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createClient } from "@libsql/client";

function canonicalSha256(value: string): string {
  return createHash("sha256")
    .update(value.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n"))
    .digest("hex");
}

test("0008 adds a minimal expiring dedupe model without changing existing rows", async () => {
  const client = createClient({ url: ":memory:" });
  try {
    await client.executeMultiple(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE workspaces (
        slug TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        owner_user_id TEXT NOT NULL
      );
      INSERT INTO workspaces (slug, name, owner_user_id)
        VALUES ('mara-finn', 'Mara and Finn', 'owner-1');
    `);
    const audienceMigration = readFileSync(
      new URL("../../drizzle/0007_audience_timeline_publications.sql", import.meta.url),
      "utf8",
    );
    const qualifiedViewMigration = readFileSync(
      new URL("../../drizzle/0008_qualified_audience_views.sql", import.meta.url),
      "utf8",
    );
    await client.executeMultiple(audienceMigration);
    await client.executeMultiple(`
      INSERT INTO timeline_publications (
        id, workspace_slug, source_workspace_id, source_digest, label,
        audience_kind, timezone, state
      ) VALUES (
        'publication-1', 'mara-finn', 'tasks-workspace-1', 'digest',
        'Mara and Finn', 'couple', 'Europe/Dublin', 'published'
      );
    `);
    await client.executeMultiple(qualifiedViewMigration);

    const publication = await client.execute(
      "SELECT label, qualified_view_count, last_qualified_view_at FROM timeline_publications WHERE id='publication-1'",
    );
    assert.deepEqual(publication.rows[0], {
      label: "Mara and Finn",
      qualified_view_count: 0,
      last_qualified_view_at: null,
    });

    const columns = await client.execute("PRAGMA table_info('audience_view_receipts')");
    assert.deepEqual(
      columns.rows.map((row) => String(row.name)),
      ["publication_id", "session_hash", "created_at", "expires_at"],
    );
    const sensitive = ["ip", "referrer", "agent", "token", "raw"];
    assert.equal(
      columns.rows.some((row) =>
        sensitive.some((term) => String(row.name).toLowerCase().includes(term)),
      ),
      false,
    );

    const sessionHash = "a".repeat(64);
    await client.execute({
      sql: "INSERT INTO audience_view_receipts (publication_id, session_hash, created_at, expires_at) VALUES (?, ?, ?, ?)",
      args: ["publication-1", sessionHash, 1_000, 2_000],
    });
    await assert.rejects(() =>
      client.execute({
        sql: "INSERT INTO audience_view_receipts (publication_id, session_hash, created_at, expires_at) VALUES (?, ?, ?, ?)",
        args: ["publication-1", sessionHash, 1_001, 2_001],
      }),
    );
    await assert.rejects(() =>
      client.execute({
        sql: "INSERT INTO audience_view_receipts (publication_id, session_hash, created_at, expires_at) VALUES (?, ?, ?, ?)",
        args: ["publication-1", "not-a-digest", 1_001, 2_001],
      }),
    );
    assert.equal((await client.execute("PRAGMA foreign_key_check")).rows.length, 0);
  } finally {
    client.close();
  }
});

test("0008 has a matching reviewed receipt and contains no destructive SQL", () => {
  const migration = readFileSync(
    new URL("../../drizzle/0008_qualified_audience_views.sql", import.meta.url),
    "utf8",
  );
  const receipt = JSON.parse(
    readFileSync(
      new URL(
        "../../drizzle/receipts/qualified-audience-views-2026-07-22.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  assert.equal(receipt.schemaVersion, "timeline-migration-receipt/1");
  assert.equal(receipt.migrations.length, 1);
  assert.equal(receipt.migrations[0].id, "0008_qualified_audience_views");
  assert.equal(receipt.migrations[0].sha256, canonicalSha256(migration));
  assert.equal(receipt.migrations[0].proofs.length >= 4, true);
  const executableSql = migration.replace(/^--.*$/gm, "");
  assert.doesNotMatch(
    executableSql,
    /(?:^|;)\s*(?:DROP|DELETE|UPDATE)\b/i,
  );
});
