import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_LAB_CONFIG,
  parseLabConfig,
  serializeLabAttribution,
  serializeLabConfig,
} from "./query";
import type { LabConfig } from "./types";

test("query configuration round-trips every bounded selector", () => {
  const expected: LabConfig = {
    option: "c",
    surface: "detail",
    dataset: "edge-cases",
    density: "dense",
    scenario: "recently-changed",
    viewport: "wide",
    preview: "published",
    item: "edge-refused-two",
  };
  const serialized = serializeLabConfig(expected);
  assert.equal(
    serialized,
    "option=c&surface=detail&dataset=edge-cases&density=dense&state=recently-changed&viewport=wide&preview=published&item=edge-refused-two",
  );
  assert.deepEqual(parseLabConfig(serialized), expected);
});

test("unknown and unsafe query values fall back without escaping the contract", () => {
  const parsed = parseLabConfig(
    "option=z&surface=admin&dataset=production&density=tiny&state=deleted&viewport=cinema&preview=database&item=..%2Fprivate%20record",
  );
  assert.deepEqual(parsed, DEFAULT_LAB_CONFIG);
});

test("record arrays are bounded, dataset aliases normalize, and tracking source stays independent", () => {
  assert.deepEqual(
    parseLabConfig({
      dataset: ["edge", "wedding"],
      scenario: "unpublished",
      source: "published",
      item: "EDGE-LONG-TITLE",
    }),
    {
      ...DEFAULT_LAB_CONFIG,
      dataset: "edge-cases",
      scenario: "unpublished",
      item: "edge-long-title",
    },
  );

  assert.equal(parseLabConfig({ preview: "published", source: "newsletter" }).preview, "published");
});

test("shareable item URLs keep bounded attribution separate from preview state", () => {
  assert.equal(
    serializeLabAttribution({
      source: "signal",
      campaign: "direction-review",
      preview: "published",
      unsafe: "ignored",
    }),
    "source=signal&campaign=direction-review",
  );
  assert.equal(serializeLabAttribution({ source: "../private", campaign: "x".repeat(81) }), "");
});
