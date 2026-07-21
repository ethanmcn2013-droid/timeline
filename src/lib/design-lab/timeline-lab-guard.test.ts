import assert from "node:assert/strict";
import test from "node:test";
import { isTimelineDesignLabEnabled } from "./timeline-lab-guard";

test("timeline lab opens only for an explicit local review", () => {
  assert.equal(
    isTimelineDesignLabEnabled({
      nodeEnv: "development",
      flag: "true",
      reviewMode: true,
    }),
    true,
  );
  assert.equal(
    isTimelineDesignLabEnabled({
      nodeEnv: "development",
      flag: undefined,
      reviewMode: true,
    }),
    false,
  );
  assert.equal(
    isTimelineDesignLabEnabled({
      nodeEnv: "development",
      flag: "TRUE",
      reviewMode: true,
    }),
    false,
  );
  assert.equal(
    isTimelineDesignLabEnabled({
      nodeEnv: "development",
      flag: "true",
      reviewMode: false,
    }),
    false,
  );
});

test("timeline lab opens on a preview production build in review mode", () => {
  assert.equal(
    isTimelineDesignLabEnabled({
      nodeEnv: "production",
      vercelEnv: "preview",
      flag: "true",
      reviewMode: true,
    }),
    true,
  );
});

test("production deploys always fail closed", () => {
  assert.equal(
    isTimelineDesignLabEnabled({
      nodeEnv: "production",
      vercelEnv: "production",
      flag: "true",
      reviewMode: true,
    }),
    false,
  );
  assert.equal(
    isTimelineDesignLabEnabled({
      nodeEnv: "development",
      vercelEnv: "production",
      flag: "true",
      reviewMode: true,
    }),
    false,
  );
  assert.equal(
    isTimelineDesignLabEnabled({
      nodeEnv: "production",
      flag: "true",
      reviewMode: true,
    }),
    false,
  );
});

test("unrecognised deployment postures fail closed", () => {
  assert.equal(
    isTimelineDesignLabEnabled({
      nodeEnv: "development",
      vercelEnv: "staging",
      flag: "true",
      reviewMode: true,
    }),
    false,
  );
});
