import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(
  new URL("../app/api/internal/notes-timeline/route.ts", import.meta.url),
  "utf8",
);
const helper = readFileSync(new URL("./audience-timeline.ts", import.meta.url), "utf8");

test("Notes Timeline receiver verifies the audience-bound assertion and replays", () => {
  assert.match(route, /signal-timeline\.note-projection/);
  assert.match(route, /claims\.workspaceId !== command\.workspaceId/);
  assert.match(route, /claims\.noteId !== command\.sourceNoteId/);
  assert.match(route, /seenJtis/);
  assert.match(route, /claims\.exp <= now/);
});

test("Notes Timeline receiver checks current Tasks membership before publishing", () => {
  assert.match(route, /getCurrentTasksWorkspaceContext/);
  assert.match(route, /getWorkspaceForSuiteIdForUser/);
  assert.match(route, /createNotesAudiencePublication/);
  assert.match(route, /private, no-store/);
});

test("Notes projection keeps the public field allowlist and freezes source data", () => {
  assert.match(route, /Object\.keys\(projection\)/);
  assert.match(route, /Object\.keys\(audience\)/);
  assert.match(helper, /sourceObjectId/);
  assert.match(helper, /state: "published"/);
  assert.match(helper, /sourceRelation: sourceObjectId/);
  assert.doesNotMatch(route, /description|attachments|comments|extractBody/);
});
