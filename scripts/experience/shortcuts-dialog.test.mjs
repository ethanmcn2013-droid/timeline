import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../../src/components/roadmap/shortcuts-overlay.tsx", import.meta.url),
  "utf8",
);

test("shortcuts overlay exposes modal dialog semantics", () => {
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-labelledby=\{titleId\}/);
  assert.match(source, /aria-describedby=\{descriptionId\}/);
  assert.match(source, /aria-label="Close keyboard shortcuts"/);
});

test("shortcuts overlay contains focus and keyboard lifecycle contracts", () => {
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /event\.key !== "Tab"/);
  assert.match(source, /closeButtonRef\.current\?\.focus/);
  assert.match(source, /returnTarget\?\.isConnected/);
  assert.match(source, /returnTarget\.focus/);
  assert.match(source, /document\.body\.style\.overflow = "hidden"/);
});

test("backdrop closes only when the backdrop itself is targeted", () => {
  assert.match(source, /event\.target === event\.currentTarget/);
  assert.match(source, /event\.preventDefault\(\)/);
});
