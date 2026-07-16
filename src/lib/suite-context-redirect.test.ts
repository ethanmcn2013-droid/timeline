import assert from "node:assert/strict";
import test from "node:test";

import { timelineProjectContextRedirect } from "./suite-context-redirect";

test("maps an allowlisted project hint to Timeline's authorized project route", () => {
  const destination = timelineProjectContextRedirect(
    new URL(
      "https://timeline.signalstudio.ie/app?sourceProduct=signal&contextVersion=2&workspaceId=workspace-1&planningPeriodId=period_1&projectId=launch&secret=drop-me",
    ),
  );

  assert.equal(
    destination?.toString(),
    "https://timeline.signalstudio.ie/app/plan/launch?workspaceId=workspace-1&planningPeriodId=period_1&sourceProduct=signal&contextVersion=2",
  );
});

test("rejects malformed or non-entry-route project hints", () => {
  assert.equal(
    timelineProjectContextRedirect(
      new URL("https://timeline.signalstudio.ie/app?projectId=../../private"),
    ),
    null,
  );
  assert.equal(
    timelineProjectContextRedirect(
      new URL("https://timeline.signalstudio.ie/app/audience?projectId=launch"),
    ),
    null,
  );
});
