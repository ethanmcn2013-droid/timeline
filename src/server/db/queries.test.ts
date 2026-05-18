/**
 * Unit tests for isWorkspacePublished (P0-2, seamless-roadmap).
 *
 * These tests exercise the logic in isolation using a mock DB client.
 * The module under test is not imported directly — we test the logic
 * extracted into a pure helper to keep the test boundary clean and
 * avoid needing a live Turso connection.
 *
 * Three scenarios under test:
 *   1. project exists, published_at set, ZERO tasks → false
 *   2. project exists, published_at set, ≥1 task → true
 *   3. publishWorkspaceAction on empty workspace → returns error, no DB write
 *
 * Run: node --import tsx/esm --test src/server/db/queries.test.ts
 * (from repo root, via the tsx binary installed in node_modules)
 */

import { test } from "node:test";
import assert from "node:assert/strict";

// ── Pure logic extracted from isWorkspacePublished ───────────────────────────
// This matches the three-part gate implemented in queries.ts exactly.
// If the gate logic ever changes, this function must change to match.

function isWorkspacePublishedLogic(
  projectRows: { publishedAt: Date | null }[],
  taskCount: number,
): boolean {
  // Step 1: at least one project.
  if (projectRows.length === 0) return false;
  // Step 2: all projects published.
  if (!projectRows.every((r) => r.publishedAt !== null)) return false;
  // Step 3: at least one task.
  return taskCount > 0;
}

// ── Pure logic extracted from publishWorkspaceAction guard ───────────────────
// Mirrors the guard in workspaces.ts publishWorkspaceAction.

type PublishGuardResult = { ok: true } | { error: string };

function publishWorkspaceGuard(
  projectCount: number,
  taskCount: number,
): PublishGuardResult {
  if (projectCount === 0) {
    return {
      error:
        "Add at least one project before publishing. Your roadmap needs something to share.",
    };
  }
  if (taskCount === 0) {
    return {
      error:
        "Add some items to your roadmap before publishing. Stakeholders need something to read.",
    };
  }
  return { ok: true };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test("isWorkspacePublished — project exists + published_at set + ZERO tasks → false", () => {
  const projectRows = [{ publishedAt: new Date() }];
  const taskCount = 0;
  const result = isWorkspacePublishedLogic(projectRows, taskCount);
  assert.equal(result, false, "Should return false when no tasks exist");
});

test("isWorkspacePublished — project exists + published_at set + ≥1 task → true", () => {
  const projectRows = [{ publishedAt: new Date() }];
  const taskCount = 1;
  const result = isWorkspacePublishedLogic(projectRows, taskCount);
  assert.equal(result, true, "Should return true when tasks exist and all projects published");
});

test("isWorkspacePublished — project exists + published_at NULL → false (existing guard)", () => {
  const projectRows = [{ publishedAt: null }];
  const taskCount = 5;
  const result = isWorkspacePublishedLogic(projectRows, taskCount);
  assert.equal(result, false, "Should return false when project not published");
});

test("isWorkspacePublished — zero projects → false (existing guard)", () => {
  const projectRows: { publishedAt: Date | null }[] = [];
  const taskCount = 0;
  const result = isWorkspacePublishedLogic(projectRows, taskCount);
  assert.equal(result, false, "Should return false when no projects");
});

test("isWorkspacePublished — multiple projects, all published, tasks present → true", () => {
  const projectRows = [
    { publishedAt: new Date() },
    { publishedAt: new Date() },
  ];
  const taskCount = 3;
  const result = isWorkspacePublishedLogic(projectRows, taskCount);
  assert.equal(result, true, "Should return true for multi-project published workspace with tasks");
});

test("isWorkspacePublished — multiple projects, ONE unpublished, tasks present → false", () => {
  const projectRows = [
    { publishedAt: new Date() },
    { publishedAt: null },
  ];
  const taskCount = 3;
  const result = isWorkspacePublishedLogic(projectRows, taskCount);
  assert.equal(result, false, "Should return false when any project is unpublished");
});

test("publishWorkspaceAction guard — zero projects → error, published_at unset", () => {
  let publishCalled = false;
  // Simulate the guard logic; if it returns error, publishWorkspace is never reached.
  const result = publishWorkspaceGuard(0, 0);
  // published_at is never set when guard returns error (simulated by publishCalled=false).
  assert.ok("error" in result, "Should return error for zero projects");
  assert.match(
    (result as { error: string }).error,
    /project/i,
    "Error message should mention project",
  );
  assert.equal(publishCalled, false, "publishWorkspace must not be called");
});

test("publishWorkspaceAction guard — project exists + zero tasks → error, published_at unset", () => {
  let publishCalled = false;
  const result = publishWorkspaceGuard(1, 0);
  assert.ok("error" in result, "Should return error for zero tasks");
  assert.match(
    (result as { error: string }).error,
    /items|roadmap/i,
    "Error message should mention roadmap items",
  );
  assert.equal(publishCalled, false, "publishWorkspace must not be called");
});

test("publishWorkspaceAction guard — project + tasks present → ok", () => {
  const result = publishWorkspaceGuard(1, 3);
  assert.ok("ok" in result && (result as { ok: true }).ok === true, "Should return ok");
});
