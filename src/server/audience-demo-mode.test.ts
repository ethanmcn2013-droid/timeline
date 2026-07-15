import assert from "node:assert/strict";
import test from "node:test";

test("audience demo routes resolve without rate-limit or database infrastructure", async () => {
  const original = { ...process.env };

  try {
    process.env.SIGNAL_ACCESS_MODE = "demo";
    process.env.VERCEL_ENV = "preview";
    process.env.TURSO_DATABASE_URL = "file::memory:";
    delete process.env.NEXT_PUBLIC_SIGNAL_ACCESS_MODE;
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
    delete process.env.DEMO_MODE;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const audience = await import("./audience-timeline");

    assert.equal(audience.audienceTimelineEnabled(), true);
    assert.match(audience.DEMO_AUDIENCE_TOKEN, /^[A-Za-z0-9_-]{43}$/);
    assert.equal(
      (await audience.getOwnerAudiencePublications("tasks")).length,
      1,
    );
    assert.deepEqual(
      await audience.getOwnerAudiencePublications("unknown-workspace"),
      [],
    );

    const result = await audience.resolveAudienceTimeline(
      audience.DEMO_AUDIENCE_TOKEN,
    );
    assert.equal(result.kind, "ok");
    if (result.kind === "ok") {
      assert.equal(result.dto.publicationId, "demo-audience-publication");
      assert.equal(result.dto.today, "2026-07-15");
      assert.equal(
        result.dto.sections.flatMap((section) => section.items).length,
        4,
      );
      const serialized = JSON.stringify(result.dto);
      assert.doesNotMatch(
        serialized,
        /workspaceSlug|workspaceId|ownerEmail|sourceRelation|sourceDigest/,
      );
    }

    assert.deepEqual(
      await audience.resolveAudienceTimeline(
        "InvalidAudienceTimelineToken000000000000000",
      ),
      { kind: "invalid" },
    );

  } finally {
    for (const key of Object.keys(process.env)) {
      if (!(key in original)) delete process.env[key];
    }
    Object.assign(process.env, original);
  }
});
