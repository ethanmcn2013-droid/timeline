import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../../src/lib/reserved-slugs.ts", import.meta.url),
  "utf8",
);

test("static Timeline routes are protected from user-created slug collisions", () => {
  for (const slug of ["lab", "waitlist", "the-wedding"]) {
    assert.match(source, new RegExp(`^[ \\t]+["']${slug}["'],`, "m"));
  }
});
