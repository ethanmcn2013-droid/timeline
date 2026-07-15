import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const actions = readFileSync("src/server/actions/workspaces.ts", "utf8");
const queries = readFileSync("src/server/db/queries.ts", "utf8");

test("autosync exits through deterministic fixtures before auth or databases", () => {
  const start = actions.indexOf("export async function syncMilestonesAction(");
  const end = actions.indexOf("// Curation overlay upsert", start);
  assert.notEqual(start, -1, "syncMilestonesAction must exist");
  assert.notEqual(end, -1, "syncMilestonesAction boundary must exist");

  const body = actions.slice(start, end);
  const demoGuard = body.indexOf("if (isDemoMode())");
  const authRead = body.indexOf("const userId = await requireUser()");
  const tasksSource = body.indexOf("makeMilestoneSyncSource");

  assert.ok(demoGuard >= 0, "autosync must have a demo-mode guard");
  assert.ok(authRead > demoGuard, "demo guard must run before auth resolution");
  assert.ok(tasksSource > demoGuard, "demo guard must run before Tasks DB setup");
  assert.match(
    body,
    /count: demoEffectiveNodes\(workspaceSlug\)\.length/,
    "autosync must return a deterministic fixture count",
  );
});

test("all public demo route reads have fixture short-circuits", () => {
  const requiredGuards = [
    "getDemoWorkspaceFixture(slug)",
    "getDemoProjectsFixture(workspaceSlug)",
    "getDemoTasksFixture(workspaceSlug)",
    "getDemoSharedUpdateDataset(workspaceSlug)?.upcoming",
    "getDemoTaskFixture(workspaceSlug, projectSlug, taskId)",
    "getDemoProjectFixture(workspaceSlug, projectSlug)",
    "demoEffectiveNodes(workspaceSlug)",
  ];

  for (const guard of requiredGuards) {
    assert.ok(queries.includes(guard), `missing demo query boundary: ${guard}`);
  }
});
