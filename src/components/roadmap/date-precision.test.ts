import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  DatePrecisionChip,
  type DatePrecision,
} from "./date-precision";

const PRECISIONS: DatePrecision[] = [
  { kind: "exact", value: "Sat 2026-06-06" },
  { kind: "window", value: "late May" },
  { kind: "pending" },
];

test("default date precision tone uses the stronger surface foreground", () => {
  for (const precision of PRECISIONS) {
    const markup = renderToStaticMarkup(
      DatePrecisionChip({ precision, tone: "default" }),
    );

    assert.match(markup, /color:var\(--ink-soft\)/);
    assert.doesNotMatch(markup, /color:var\(--ink-quiet\)/);
  }
});

test("quiet date precision tone remains available on plain paper", () => {
  for (const precision of PRECISIONS) {
    const markup = renderToStaticMarkup(
      DatePrecisionChip({ precision, tone: "quiet" }),
    );

    assert.match(markup, /color:var\(--ink-quiet\)/);
  }
});
