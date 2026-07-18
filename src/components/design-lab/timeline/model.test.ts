import assert from "node:assert/strict";
import test from "node:test";

import {
  OWNER_ONLY_SENTINEL,
  TIMELINE_FIXTURES,
  countUnpublished,
  createInitialLabState,
  groupByBucket,
  selectPlanForDensity,
  timelineLabReducer,
  toPublicPlan,
} from "./model";
import type { LabDataset } from "./types";

const DATASETS: LabDataset[] = ["wedding", "freelance", "small-business", "edge-cases"];

test("all four deterministic datasets carry a private sentinel and dense review volume", () => {
  for (const dataset of DATASETS) {
    const first = createInitialLabState(dataset);
    const second = createInitialLabState(dataset);
    assert.deepEqual(first, second);
    assert.match(JSON.stringify(first.working), new RegExp(OWNER_ONLY_SENTINEL));

    const sparse = selectPlanForDensity(first.working, "sparse");
    const normal = selectPlanForDensity(first.working, "normal");
    const dense = selectPlanForDensity(first.working, "dense");
    assert.ok(sparse.items.filter((entry) => entry.publicVisible).length <= 5);
    assert.ok(normal.items.filter((entry) => entry.publicVisible).length <= 10);
    assert.ok(dense.items.filter((entry) => entry.publicVisible).length >= 24);
  }
  assert.deepEqual(Object.keys(TIMELINE_FIXTURES).sort(), [...DATASETS].sort());
});

test("public DTO uses an exact allowlist and removes every owner-only sentinel", () => {
  for (const dataset of DATASETS) {
    const state = createInitialLabState(dataset);
    const dto = toPublicPlan(state.working);
    const serialized = JSON.stringify(dto);
    assert.doesNotMatch(serialized, new RegExp(OWNER_ONLY_SENTINEL));
    assert.doesNotMatch(serialized, /ownerNote|ownerReason|publicVisible|origin|createdAt/);
    assert.deepEqual(Object.keys(dto).sort(), [
      "author",
      "changes",
      "items",
      "publishedAt",
      "purpose",
      "revision",
      "slug",
      "title",
      "updatedAt",
    ]);
    for (const entry of dto.items) {
      assert.deepEqual(Object.keys(entry).sort(), [
        "bucket",
        "confidence",
        "decision",
        "id",
        "nextStep",
        "order",
        "project",
        "secondaryState",
        "summary",
        "timing",
        "title",
        "updatedAt",
      ]);
    }
  }
});

test("an owner-only edit creates divergence without changing the public projection", () => {
  const initial = createInitialLabState("wedding");
  const before = toPublicPlan(initial.working);
  const edited = timelineLabReducer(initial, {
    type: "edit",
    itemId: initial.selectedItemId,
    patch: { ownerNote: `${OWNER_ONLY_SENTINEL}: revised private context.` },
  });

  assert.deepEqual(toPublicPlan(edited.working), before);
  assert.ok(countUnpublished(edited) > 0);
  assert.equal(edited.working.changes.length, initial.working.changes.length);
});

test("blurring unchanged fields is a true no-op and never fabricates history", () => {
  const initial = createInitialLabState("wedding");
  const item = initial.working.items.find((entry) => entry.id === initial.selectedItemId);
  assert.ok(item);

  const afterPublicBlur = timelineLabReducer(initial, {
    type: "edit",
    itemId: item.id,
    patch: { title: `  ${item.title}  `, publicSummary: item.publicSummary },
  });
  const afterPrivateBlur = timelineLabReducer(afterPublicBlur, {
    type: "edit",
    itemId: item.id,
    patch: { ownerNote: item.ownerNote },
  });

  assert.equal(afterPublicBlur, initial);
  assert.equal(afterPrivateBlur, initial);
  assert.equal(countUnpublished(afterPrivateBlur), 0);
  assert.equal(afterPrivateBlur.working.changes.length, initial.working.changes.length);
});

test("version one remains public through an edit and publish creates version two", () => {
  const initial = createInitialLabState("wedding");
  const itemId = initial.selectedItemId;
  const publishedTitle = toPublicPlan(initial.published).items.find((entry) => entry.id === itemId)?.title;
  const edited = timelineLabReducer(initial, {
    type: "edit",
    itemId,
    patch: { title: "Confirm the final room plan" },
  });

  assert.equal(edited.working.revision, 1);
  assert.equal(edited.published.revision, 1);
  assert.equal(toPublicPlan(edited.published).items.find((entry) => entry.id === itemId)?.title, publishedTitle);
  assert.equal(toPublicPlan(edited.working).items.find((entry) => entry.id === itemId)?.title, "Confirm the final room plan");
  assert.equal(countUnpublished(edited), 1);

  const published = timelineLabReducer(edited, { type: "publish" });
  assert.equal(published.working.revision, 2);
  assert.equal(published.published.revision, 2);
  assert.equal(toPublicPlan(published.published).items.find((entry) => entry.id === itemId)?.title, "Confirm the final room plan");
  assert.equal(countUnpublished(published), 0);
});

test("hiding removes direct item and change visibility from working public output", () => {
  const initial = createInitialLabState("freelance");
  const itemId = initial.selectedItemId;
  assert.ok(toPublicPlan(initial.working).items.some((entry) => entry.id === itemId));

  const hidden = timelineLabReducer(initial, { type: "hide", itemId });
  const workingPublic = toPublicPlan(hidden.working);
  assert.equal(workingPublic.items.find((entry) => entry.id === itemId), undefined);
  assert.equal(workingPublic.changes.find((entry) => entry.itemId === itemId), undefined);
  assert.ok(toPublicPlan(hidden.published).items.some((entry) => entry.id === itemId));
});

test("refusal requires a public reason and valid fixed decision date", () => {
  const initial = createInitialLabState("wedding");
  const itemId = initial.selectedItemId;
  const before = initial.working.items.find((entry) => entry.id === itemId);
  assert.ok(before);

  const missingReason = timelineLabReducer(initial, {
    type: "move",
    itemId,
    to: "refused",
    reason: "",
    date: "2026-07-18",
  });
  assert.equal(missingReason.working.items.find((entry) => entry.id === itemId)?.bucket, before.bucket);

  const invalidDate = timelineLabReducer(initial, {
    type: "move",
    itemId,
    to: "refused",
    reason: "It no longer supports the agreed direction.",
    date: "2026-02-30",
  });
  assert.equal(invalidDate.working.items.find((entry) => entry.id === itemId)?.bucket, before.bucket);

  const refused = timelineLabReducer(initial, {
    type: "move",
    itemId,
    to: "refused",
    reason: "It no longer supports the agreed direction.",
    date: "2026-07-18",
  });
  const refusedItem = refused.working.items.find((entry) => entry.id === itemId);
  assert.equal(refusedItem?.bucket, "refused");
  assert.deepEqual(refusedItem?.decision, {
    date: "2026-07-18",
    publicReason: "It no longer supports the agreed direction.",
    ownerReason: undefined,
  });
  assert.deepEqual(toPublicPlan(refused.working).items.find((entry) => entry.id === itemId)?.decision, {
    date: "2026-07-18",
    reason: "It no longer supports the agreed direction.",
  });
});

test("an ordinary forward move may use the calm default receipt", () => {
  const initial = createInitialLabState("wedding");
  const moved = timelineLabReducer(initial, {
    type: "move",
    itemId: "wed-menu",
    to: "now",
    reason: "",
  });

  assert.equal(moved.working.items.find((entry) => entry.id === "wed-menu")?.bucket, "now");
  assert.match(moved.working.changes.at(-1)?.publicReason ?? "", /clear enough/);
});

test("reorder changes only the order inside the current bucket", () => {
  const initial = createInitialLabState("wedding");
  const before = groupByBucket(initial.working.items);
  assert.ok(before.now.length >= 2);
  const movingId = before.now[0].id;
  const otherBucketOrders = new Map(
    initial.working.items
      .filter((entry) => entry.bucket !== "now")
      .map((entry) => [entry.id, entry.order]),
  );

  const reordered = timelineLabReducer(initial, {
    type: "reorder",
    itemId: movingId,
    direction: "down",
  });
  const after = groupByBucket(reordered.working.items);
  assert.equal(after.now[1].id, movingId);
  assert.equal(after.now[0].id, before.now[1].id);
  for (const entry of reordered.working.items.filter((candidate) => candidate.bucket !== "now")) {
    assert.equal(entry.order, otherBucketOrders.get(entry.id));
  }
  assert.equal(reordered.working.changes.length, initial.working.changes.length);
  assert.match(reordered.announcement, /position 2 of/);
});

test("manual create, safe delete, and undo remain reversible while synced work is protected", () => {
  const initial = createInitialLabState("wedding");
  const added = timelineLabReducer(initial, { type: "add", title: "Confirm the accessibility walk-through" });
  const manualId = added.selectedItemId;
  assert.ok(added.working.items.some((entry) => entry.id === manualId && entry.origin === "manual"));

  const deleted = timelineLabReducer(added, { type: "delete", itemId: manualId });
  assert.equal(deleted.working.items.some((entry) => entry.id === manualId), false);
  assert.equal(deleted.deleted?.item.id, manualId);

  const restored = timelineLabReducer(deleted, { type: "undo-delete" });
  assert.ok(restored.working.items.some((entry) => entry.id === manualId));
  assert.equal(restored.deleted, undefined);

  const syncedId = restored.working.items.find((entry) => entry.origin === "tasks")?.id;
  assert.ok(syncedId);
  const protectedState = timelineLabReducer(restored, { type: "delete", itemId: syncedId });
  assert.ok(protectedState.working.items.some((entry) => entry.id === syncedId));
  assert.match(protectedState.announcement, /cannot be deleted here/);
});
