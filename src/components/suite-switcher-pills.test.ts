import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildContextSuffix } from "./suite-switcher-pills";

describe("Timeline suite context", () => {
  it("carries the authorized workspace and selected project into Signal", () => {
    const suffix = buildContextSuffix(
      "/app/plan/launch",
      new URLSearchParams({
        workspaceId: "workspace-1",
        planningPeriodId: "period-1",
      }),
    );
    const params = new URLSearchParams(suffix);

    assert.equal(params.get("sourceProduct"), "timeline");
    assert.equal(params.get("workspaceId"), "workspace-1");
    assert.equal(params.get("planningPeriodId"), "period-1");
    assert.equal(params.get("projectId"), "launch");
  });

  it("drops malformed context identifiers", () => {
    const params = new URLSearchParams(
      buildContextSuffix("/app/plan/%0Aunsafe", new URLSearchParams()),
    );

    assert.equal(params.get("sourceProduct"), "timeline");
    assert.equal(params.has("projectId"), false);
  });
});
