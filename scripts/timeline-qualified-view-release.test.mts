import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { after, test } from "node:test";
import { createClient } from "@libsql/client";
import {
  createLogicalSnapshot,
  dryRunQualifiedViewMigration,
  verifyMigrations0000Through0007,
} from "./timeline-qualified-view-release.mjs";

const temporaryPrefix = "timeline-qualified-view-release-";
for (const entry of readdirSync(tmpdir(), { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name.startsWith(temporaryPrefix)) {
    try {
      rmSync(join(tmpdir(), entry.name), { recursive: true, force: true });
    } catch {
      // A concurrently running test owns this directory.
    }
  }
}

const temporaryRoot = mkdtempSync(join(tmpdir(), temporaryPrefix));

after(() => {
  try {
    rmSync(temporaryRoot, { recursive: true, force: true });
  } catch {
    // The Windows libSQL binding can retain file handles until process exit;
    // the next run removes this uniquely prefixed directory before testing.
  }
});

function migrationSql(index: number): string {
  const prefix = String(index).padStart(4, "0");
  const filenames = [
    "0000_parallel_pestilence.sql",
    "0001_drop_isPublic_shareToken.sql",
    "0002_workspace_owner_template.sql",
    "0003_workspace_is_demo.sql",
    "0004_add_published_at.sql",
    "0005_add_nodeOverlays_sourceTasksWorkspaceId.sql",
    "0006_rename_status_blocked_to_waiting.sql",
    "0007_audience_timeline_publications.sql",
  ];
  const filename = filenames.find((candidate) => candidate.startsWith(prefix));
  assert.ok(filename);
  return readFileSync(new URL(`../drizzle/${filename}`, import.meta.url), "utf8");
}

test("operator snapshot, dry-run, proofs, and ledger adoption never mutate the source", async () => {
  const sourcePath = join(temporaryRoot, "source.sqlite");
  const snapshotPath = join(temporaryRoot, "pre-0008.sqlite");
  const source = createClient({
    url: pathToFileURL(sourcePath).href,
    intMode: "bigint",
  });

  try {
    await source.execute("PRAGMA foreign_keys = ON");
    for (let index = 0; index <= 7; index += 1) {
      await source.executeMultiple(migrationSql(index));
    }
    await source.executeMultiple(`
      INSERT INTO workspaces (
        slug, name, owner_user_id, is_demo, suite_workspace_id
      ) VALUES (
        'tasks', 'Timeline fixture', 'owner-1', 1, 'suite-workspace-1'
      );
      INSERT INTO projects (
        workspace_slug, slug, name, one_liner, accent, sort_order,
        published_at, source_tasks_workspace_id
      ) VALUES (
        'tasks', 'wedding', 'Mara and Finn', 'Wedding timeline', '#c98765',
        0, 1700000000, 'suite-workspace-1'
      );
      INSERT INTO tasks (
        id, project_slug, workspace_slug, title, description, status
      ) VALUES (
        'task-1', 'wedding', 'tasks', 'Visit venue', 'Meet the manager', 'blocked'
      );
      INSERT INTO node_overlays (
        workspace_slug, node_id, manual_status
      ) VALUES (
        'tasks', 'overlay-1', 'blocked'
      );
      INSERT INTO timeline_publications (
        id, workspace_slug, source_workspace_id, source_digest, label,
        audience_kind, timezone, state
      ) VALUES (
        'publication-1', 'tasks', 'suite-workspace-1', 'digest-1',
        'Mara and Finn', 'couple', 'Europe/Dublin', 'published'
      );
      INSERT INTO timeline_publication_items (
        public_id, publication_id, title, state, source_relation, source_digest
      ) VALUES (
        'item-1', 'publication-1', 'Visit venue', 'next', 'task-1', 'digest-2'
      );
      INSERT INTO audience_shares (
        id, publication_id, token_hash, state
      ) VALUES (
        'share-1', 'publication-1', '${"f".repeat(64)}', 'active'
      );
    `);

    await assert.rejects(() => verifyMigrations0000Through0007(source));

    const snapshot = await createLogicalSnapshot(source, snapshotPath);
    assert.equal(existsSync(snapshot.path), true);
    assert.equal(existsSync(snapshot.manifestPath), true);
    assert.equal(
      readdirSync(temporaryRoot).some((name) => name.includes(".partial-")),
      false,
    );
    await assert.rejects(
      () => createLogicalSnapshot(source, snapshotPath),
      /already exists/,
    );
    assert.equal(snapshot.manifest.migration0008State, "pending");
    assert.deepEqual(snapshot.manifest.pendingStatusReconciliation, {
      tasks: 1,
      nodeOverlays: 1,
    });
    assert.equal(
      snapshot.manifest.tableCounts.some(
        (table) => table.table === "audience_shares" && table.rows === 1,
      ),
      true,
    );

    const dryRun = await dryRunQualifiedViewMigration(snapshot.path);
    assert.equal(dryRun.report.ledgerEntries, 9);
    assert.deepEqual(dryRun.report.statusReconciliation, {
      tasksUpdated: 1,
      nodeOverlaysUpdated: 1,
    });
    assert.equal(dryRun.report.proofResults.every((proof) => proof.actual === proof.expected), true);
    assert.equal(
      JSON.stringify({ manifest: snapshot.manifest, report: dryRun.report }).includes(
        "f".repeat(64),
      ),
      false,
    );

    const dryRunClient = createClient({
      url: pathToFileURL(dryRun.path).href,
      intMode: "bigint",
    });
    try {
      assert.equal(
        Number(
          (
            await dryRunClient.execute(
              "SELECT COUNT(*) AS value FROM pragma_table_info('timeline_publications') WHERE name IN ('qualified_view_count','last_qualified_view_at')",
            )
          ).rows[0]?.value,
        ),
        2,
      );
      assert.equal(
        Number(
          (
            await dryRunClient.execute(
              "SELECT COUNT(*) AS value FROM __drizzle_migrations",
            )
          ).rows[0]?.value,
        ),
        9,
      );
      assert.equal(
        Number(
          (
            await dryRunClient.execute(
              "SELECT created_at AS value FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 1",
            )
          ).rows[0]?.value,
        ),
        1784721600000,
      );
      assert.equal((await dryRunClient.execute("PRAGMA foreign_key_check")).rows.length, 0);
      assert.equal(
        Number(
          (
            await dryRunClient.execute(
              "SELECT COUNT(*) AS value FROM tasks WHERE status = 'blocked'",
            )
          ).rows[0]?.value,
        ),
        0,
      );
    } finally {
      dryRunClient.close();
    }

    assert.equal(
      Number(
        (
          await source.execute(
            "SELECT COUNT(*) AS value FROM pragma_table_info('timeline_publications') WHERE name IN ('qualified_view_count','last_qualified_view_at')",
          )
        ).rows[0]?.value,
      ),
      0,
    );
    assert.equal(
      Number(
        (
          await source.execute(
            "SELECT COUNT(*) AS value FROM tasks WHERE status = 'blocked'",
          )
        ).rows[0]?.value,
      ),
      1,
    );
    assert.equal(
      Number(
        (
          await source.execute(
            "SELECT COUNT(*) AS value FROM sqlite_schema WHERE name = '__drizzle_migrations'",
          )
        ).rows[0]?.value,
      ),
      0,
    );
  } finally {
    source.close();
  }
});
