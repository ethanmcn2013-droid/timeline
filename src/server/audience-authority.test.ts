import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@libsql/client";
import {
  assertAudienceSourceAuthority,
  requireFreshAudienceMutationAuthority,
  withFreshAudienceMutationAuthority,
} from "./audience-authority.js";

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

test("removed Tasks membership blocks create, publish, and rotate before any URL is returned", async () => {
  // Shared in-memory mode preserves the independent-client boundary used by
  // Tasks reauthorization without leaving libsql's embedded file handle for
  // Windows test teardown to race.
  const url = "file::memory:?cache=shared";
  const client = createClient({ url });
  const previousUrl = process.env.TASKS_DATABASE_URL;
  const previousToken = process.env.TASKS_AUTH_TOKEN;
  process.env.TASKS_DATABASE_URL = url;
  process.env.TASKS_AUTH_TOKEN = "test-read-token";

  try {
    await client.executeMultiple(`
      CREATE TABLE users (id TEXT PRIMARY KEY, clerk_id TEXT NOT NULL UNIQUE);
      CREATE TABLE workspaces (
        id TEXT PRIMARY KEY,
        planning_period_id TEXT
      );
      CREATE TABLE workspace_members (
        workspace_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        PRIMARY KEY (workspace_id, user_id)
      );
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        title TEXT NOT NULL
      );
      INSERT INTO users (id, clerk_id) VALUES ('tasks-user-1', 'clerk-user-1');
      INSERT INTO workspaces (id, planning_period_id)
        VALUES ('tasks-workspace-1', 'period-1');
      INSERT INTO workspace_members (workspace_id, user_id)
        VALUES ('tasks-workspace-1', 'tasks-user-1');
      INSERT INTO tasks (id, workspace_id, title)
        VALUES ('task-1', 'tasks-workspace-1', 'Venue walkthrough');
    `);

    const timelineState = {
      workspace: {
        slug: "venue-plan",
        ownerUserId: "clerk-user-1",
        suiteWorkspaceId: "tasks-workspace-1",
      },
      syncedRows: [{ id: "task-1", title: "Venue walkthrough" }],
      mutationCalls: [] as string[],
      activeRawUrls: [] as string[],
    };

    const current = await requireFreshAudienceMutationAuthority(
      "clerk-user-1",
      timelineState.workspace,
    );
    assert.deepEqual(current, {
      kind: "tasks",
      sourceWorkspaceId: "tasks-workspace-1",
    });

    await client.execute(
      "DELETE FROM workspace_members WHERE workspace_id = 'tasks-workspace-1' AND user_id = 'tasks-user-1'",
    );

    for (const action of ["create", "publish", "rotate"] as const) {
      await assert.rejects(
        withFreshAudienceMutationAuthority(
          "clerk-user-1",
          timelineState.workspace,
          async () => {
            timelineState.mutationCalls.push(action);
            if (action !== "create") {
              timelineState.activeRawUrls.push(`https://timeline.test/s/${action}-token`);
            }
            return action;
          },
        ),
        /could not confirm your current membership/,
      );
    }

    assert.equal(timelineState.workspace.ownerUserId, "clerk-user-1");
    assert.deepEqual(timelineState.syncedRows, [
      { id: "task-1", title: "Venue walkthrough" },
    ]);
    const remainingTasks = await client.execute(
      "SELECT id, title FROM tasks WHERE workspace_id = 'tasks-workspace-1'",
    );
    assert.equal(remainingTasks.rows.length, 1, "membership removal preserves source rows");
    assert.deepEqual(timelineState.mutationCalls, []);
    assert.deepEqual(timelineState.activeRawUrls, []);

    const manualWorkspace = {
      slug: "local-plan",
      ownerUserId: "clerk-user-1",
      suiteWorkspaceId: null,
    };
    const manualResult = await withFreshAudienceMutationAuthority(
      "clerk-user-1",
      manualWorkspace,
      async (authority) => {
        assert.deepEqual(authority, {
          kind: "manual-local",
          sourceWorkspaceId: "timeline:local-plan",
        });
        assert.doesNotThrow(() =>
          assertAudienceSourceAuthority(authority, {
            kind: "manual",
            sourceTasksWorkspaceId: null,
          }),
        );
        assert.throws(() =>
          assertAudienceSourceAuthority(authority, {
            kind: "synced",
            sourceTasksWorkspaceId: "tasks-workspace-1",
          }),
        );
        return "manual-publication-created";
      },
    );
    assert.equal(manualResult, "manual-publication-created");
  } finally {
    restoreEnv("TASKS_DATABASE_URL", previousUrl);
    restoreEnv("TASKS_AUTH_TOKEN", previousToken);
    client.close();
    await rm(directory, {
      recursive: true,
      force: true,
      // libSQL can release its Windows file handle slightly after close().
      // Keep cleanup deterministic without weakening any assertion.
      maxRetries: 20,
      retryDelay: 100,
    });  }
});
