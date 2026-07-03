/**
 * Tests for the milestone-card pure helpers.
 *
 * Run: npx tsx --test src/components/roadmap/milestone-card.test.ts
 *
 * Covers the discriminator (`isManualMilestoneId`) and anchor-id construction
 * (`milestoneAnchorId`) used by:
 *   - MilestoneCard's title rendering (anchor for manual, Link for synced)
 *   - The parent overview's right-rail upcoming list (same)
 *   - The `[projectSlug]/[id]` route's graceful-redirect fallback
 *   - The `[projectSlug]/[id]` route's metadata `noindex` for manual ids
 *
 * The discriminator is the load-bearing contract, getting it wrong in either
 * direction (false positive on a synced id, false negative on a manual id)
 * resurfaces the original 404 bug or breaks the synced-milestone deep link.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { isManualMilestoneId, milestoneAnchorId } from "./milestone-card";

test("isManualMilestoneId, manual ids match", () => {
  assert.equal(isManualMilestoneId("ms-manual-1700000000000"), true);
  assert.equal(isManualMilestoneId("ms-manual-0"), true);
});

test("isManualMilestoneId, synced task ids do not match", () => {
  assert.equal(isManualMilestoneId("wedding-2026-001"), false);
  assert.equal(isManualMilestoneId("ms-tasks-ws123-task456"), false);
  assert.equal(isManualMilestoneId("manual-something-else"), false);
  assert.equal(isManualMilestoneId(""), false);
});

test("milestoneAnchorId, produces a stable HTML id from a milestone id", () => {
  assert.equal(
    milestoneAnchorId("ms-manual-1700000000000"),
    "milestone-ms-manual-1700000000000",
  );
  assert.equal(
    milestoneAnchorId("wedding-2026-001"),
    "milestone-wedding-2026-001",
  );
});

test("milestoneAnchorId, round-trips inside a URL fragment", () => {
  const id = "ms-manual-1700000000000";
  const anchor = milestoneAnchorId(id);
  // Anchor ids must be safe for `<a href="#...">` without escaping.
  assert.match(anchor, /^[A-Za-z0-9-_]+$/);
  // And must remain extractable from the URL hash for any future client-side
  // consumer (smooth-scroll polyfill, scroll-restoration, etc.).
  const url = new URL(`https://x/${anchor}#${anchor}`);
  assert.equal(url.hash, `#${anchor}`);
});
