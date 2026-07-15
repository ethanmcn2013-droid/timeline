import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const actions = readFileSync("src/server/actions/workspaces.ts", "utf8");
const queries = readFileSync("src/server/db/queries.ts", "utf8");
const auth = readFileSync("src/server/auth.ts", "utf8");
const audience = readFileSync("src/server/audience-timeline.ts", "utf8");
const audienceActions = readFileSync(
  "src/server/actions/audience-timeline.ts",
  "utf8",
);

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

test("suite context resolution stays inside demo fixtures", () => {
  const start = auth.indexOf("export async function resolveTimelineContext(");
  const end = auth.indexOf("export async function requireUser()", start);
  assert.notEqual(start, -1, "resolveTimelineContext must exist");
  assert.notEqual(end, -1, "resolveTimelineContext boundary must exist");

  const body = auth.slice(start, end);
  const demoGuard = body.indexOf("if (isDemoMode())");
  const localWorkspaceRead = body.indexOf("getWorkspaceForSuiteIdForUser(");
  const tasksContextRead = body.indexOf("getCurrentTasksWorkspaceContext(");

  assert.ok(demoGuard >= 0, "suite context must have a demo-mode guard");
  assert.ok(
    localWorkspaceRead > demoGuard,
    "demo guard must run before Timeline workspace lookup",
  );
  assert.ok(
    tasksContextRead > demoGuard,
    "demo guard must run before Tasks context lookup",
  );
  assert.match(
    body,
    /workspaceId: demoWorkspace\.slug/,
    "demo context must resolve to the canonical fixture identity",
  );
});

test("audience routes resolve demo fixtures before rate limits or databases", () => {
  const ownerStart = audience.indexOf(
    "export async function getOwnerAudiencePublications(",
  );
  const ownerEnd = audience.indexOf("async function ownsPublication(", ownerStart);
  assert.notEqual(ownerStart, -1, "owner publication resolver must exist");
  assert.notEqual(ownerEnd, -1, "owner publication boundary must exist");
  const ownerBody = audience.slice(ownerStart, ownerEnd);
  assert.ok(
    ownerBody.indexOf("if (isDemoMode())") < ownerBody.indexOf("await db"),
    "owner fixture guard must run before database reads",
  );

  const publicStart = audience.indexOf(
    "export const resolveAudienceTimeline = cache(async (",
  );
  assert.notEqual(publicStart, -1, "public audience resolver must exist");
  const publicBody = audience.slice(publicStart);
  const demoGuard = publicBody.indexOf("if (isDemoMode())");
  assert.ok(demoGuard >= 0, "public audience resolver needs a demo guard");
  assert.ok(
    publicBody.indexOf("checkRateLimit(") > demoGuard,
    "public fixture guard must run before rate limiting",
  );
  assert.ok(
    publicBody.indexOf("await db") > demoGuard,
    "public fixture guard must run before database reads",
  );
});

test("audience mutations remain read-only in demo mode", () => {
  const exportedActions = [
    ...audienceActions.matchAll(/export async function (\w+Action)\(/g),
  ];
  assert.ok(exportedActions.length > 0, "Audience Timeline actions must exist");
  for (const [index, match] of exportedActions.entries()) {
    const start = match.index ?? 0;
    const end = exportedActions[index + 1]?.index ?? audienceActions.length;
    const body = audienceActions.slice(start, end);
    assert.match(
      body,
      /const demoState = demoReadOnlyState\(formData\);\s*if \(demoState\) return demoState;/,
      `${match[1]} must return the shared demo receipt before auth or writes`,
    );
  }
  assert.ok(
    audienceActions.indexOf("function demoReadOnlyState()") <
      audienceActions.indexOf("export async function connectSuiteWorkspaceAction("),
    "the shared demo receipt must be defined before mutation handlers",
  );
});
