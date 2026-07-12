import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

function source(relative) {
  return readFileSync(new URL(relative, import.meta.url), "utf8");
}

test("schema and migration store token hashes, never raw audience tokens", () => {
  const schema = source("./db/schema.ts");
  const migration = source("../../drizzle/0007_audience_timeline_publications.sql");
  assert.match(schema, /tokenHash: text\("token_hash"\)/);
  assert.doesNotMatch(schema, /rawToken: text|raw_token/);
  assert.match(migration, /token_hash\s+TEXT NOT NULL/);
  assert.doesNotMatch(migration, /raw_token/);
});

test("public resolver uses exact safe item projection and validates before returning", () => {
  const resolver = source("./audience-timeline.ts");
  const boundary = resolver.slice(resolver.indexOf("// Public boundary:"));
  assert.match(boundary, /publicId: timelinePublicationItems\.publicId/);
  assert.match(boundary, /title: timelinePublicationItems\.title/);
  assert.match(boundary, /date: timelinePublicationItems\.calendarDate/);
  assert.match(boundary, /state: timelinePublicationItems\.state/);
  assert.match(boundary, /validateAudienceTimelineDto\(candidate\)/);
  assert.doesNotMatch(
    boundary.slice(0, boundary.indexOf("const candidate")),
    /sourceRelation:|sourceDigest:|description:|ownerEmail:|workspaceSlug:/,
  );
});

test("Audience routes are dynamic no-store, noindex, and no-referrer", () => {
  const page = source("../app/s/[token]/page.tsx");
  const projector = source("../app/s/[token]/present/page.tsx");
  const config = source("../../next.config.ts");
  for (const route of [page, projector]) {
    assert.match(route, /dynamic = "force-dynamic"/);
    assert.match(route, /revalidate = 0/);
    assert.match(route, /fetchCache = "force-no-store"/);
    assert.match(route, /robots: \{ index: false, follow: false/);
  }
  assert.match(config, /source: "\/s\/:path\*"/);
  assert.match(config, /Referrer-Policy", value: "no-referrer"/);
  assert.match(config, /Cache-Control", value: "private, no-store/);
});

test("legacy public routes remain present and separate", () => {
  for (const relative of [
    "../app/[workspaceSlug]/page.tsx",
    "../app/[workspaceSlug]/[projectSlug]/page.tsx",
    "../app/[workspaceSlug]/[projectSlug]/[id]/page.tsx",
  ]) {
    assert.equal(existsSync(new URL(relative, import.meta.url)), true, relative);
  }
  const migration = source("../../drizzle/0007_audience_timeline_publications.sql");
  assert.doesNotMatch(migration, /DROP TABLE|DELETE FROM|UPDATE projects|UPDATE tasks/i);
});

test("legacy item detail gates publication or owner before private activity", () => {
  const detail = source("../app/[workspaceSlug]/[projectSlug]/[id]/page.tsx");
  const gate = detail.indexOf("if (!published && !isOwner) return <DraftItemUnavailable />");
  const activityRead = detail.indexOf("const taskActivity = await getActivityForTask");
  assert.ok(gate >= 0, "draft gate must exist");
  assert.ok(activityRead > gate, "activity must be read only after the draft gate");
  assert.match(detail, /Gate before reading task title or description/);
});

test("milestone sync requires one explicit canonical workspace", () => {
  const sourceCode = source("./sync/tasks-milestone-source.ts");
  const action = source("./actions/workspaces.ts");
  assert.match(sourceCode, /canonicalWorkspaceId: string/);
  assert.match(sourceCode, /AND t\.workspace_id = \?/);
  assert.match(sourceCode, /wm\.workspace_id = t\.workspace_id AND wm\.user_id = \?/);
  assert.doesNotMatch(sourceCode, /t\.workspace_id IN \(/);
  assert.match(action, /targetProject\.sourceTasksWorkspaceId \?\? workspace\.suiteWorkspaceId/);
  assert.match(action, /bindProjectToTasksWorkspace/);
  assert.doesNotMatch(action, /const targetProject = ownedProjects\[0\]/);
});

test("incoming suite context is mapped and reauthorized, then emitted to siblings", () => {
  const auth = source("./auth.ts");
  const current = source("./sync/tasks-workspace-context.ts");
  const app = source("../app/app/(app)/page.tsx");
  const switcher = source("../components/suite-switcher-pills.tsx");
  assert.match(auth, /getWorkspaceForSuiteIdForUser/);
  assert.match(auth, /getCurrentTasksWorkspaceContext/);
  assert.match(auth, /requestedPlanningPeriodId/);
  assert.match(current, /workspace_members wm/);
  assert.match(current, /u\.clerk_id = \? AND w\.id = \?/);
  const connectAction = source("./actions/audience-timeline.ts");
  assert.match(connectAction, /getCurrentTasksWorkspaceContext/);
  assert.match(connectAction, /if \(!currentMembership\)/);
  assert.match(app, /if \(requestedWorkspaceId && !resolvedContext\)/);
  assert.match(switcher, /outgoing\.set\("workspaceId"/);
  assert.match(switcher, /outgoing\.set\("planningPeriodId"/);
  assert.match(switcher, /Each destination must\s+\/\/ reauthorize/);
});

test("Audience create, publish, and rotate reauthorize before their mutation sinks", () => {
  const actions = source("./actions/audience-timeline.ts");
  const cases = [
    ["createAudiencePublicationAction", "createAudiencePublication("],
    ["publishAudiencePublicationAction", "publishAudiencePublication("],
    ["rotateAudienceShareAction", "rotateAudienceShare("],
  ];

  for (const [actionName, sink] of cases) {
    const start = actions.indexOf(`export async function ${actionName}(`);
    assert.ok(start >= 0, `${actionName} must exist`);
    const nextExport = actions.indexOf("\nexport async function ", start + 1);
    const body = actions.slice(start, nextExport > start ? nextExport : undefined);
    const authorization = body.indexOf("withFreshAudienceMutationAuthority(");
    const mutation = body.indexOf(sink);
    assert.ok(authorization >= 0, `${actionName} must use the fresh membership guard`);
    assert.ok(mutation > authorization, `${actionName} must authorize before ${sink}`);
  }
});
