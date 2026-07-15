import assert from "node:assert/strict";
import test from "node:test";

test("demo/review reads resolve fixtures without database tables", async () => {
  const original = { ...process.env };

  try {
    process.env.SIGNAL_ACCESS_MODE = "demo";
    process.env.VERCEL_ENV = "preview";
    process.env.TURSO_DATABASE_URL = "file::memory:";
    delete process.env.NEXT_PUBLIC_SIGNAL_ACCESS_MODE;
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
    delete process.env.DEMO_MODE;

    // Import only after the environment is fixed. The in-memory database has
    // no schema; any accidental fall-through to SQL fails this test.
    const queries = await import("./queries");

    const tasksWorkspace = await queries.getWorkspace("tasks");
    assert.equal(tasksWorkspace?.slug, "tasks");
    assert.equal(tasksWorkspace?.suiteWorkspaceId, "tasks");
    assert.equal(
      (await queries.getWorkspace("wedding-planning"))?.slug,
      "wedding-planning",
    );
    assert.equal(await queries.getWorkspace("unknown-workspace"), null);

    assert.deepEqual(
      (await queries.getWorkspacesForUser("seed-demo-user")).map(
        (workspace) => workspace.slug,
      ),
      ["tasks"],
    );
    assert.deepEqual(await queries.getWorkspacesForUser("unknown-user"), []);

    assert.deepEqual(
      (await queries.getProjectsForWorkspace("tasks")).map(
        (project) => project.slug,
      ),
      ["product"],
    );
    assert.equal(
      (await queries.getProjectsForWorkspace("tasks"))[0]
        ?.sourceTasksWorkspaceId,
      "tasks",
    );
    assert.deepEqual(
      await queries.getProjectsForWorkspace("unknown-workspace"),
      [],
    );
    assert.equal(await queries.isWorkspacePublished("tasks"), true);
    assert.equal(
      await queries.isWorkspacePublished("unknown-workspace"),
      false,
    );

    assert.equal((await queries.getTasksForWorkspace("tasks")).length, 7);
    assert.deepEqual(
      await queries.getTasksForWorkspace("unknown-workspace"),
      [],
    );
    assert.equal(
      (await queries.getLastUpdatedForWorkspace("tasks"))?.toISOString(),
      "2026-05-11T07:00:00.000Z",
    );
    assert.equal(
      await queries.getLastUpdatedForWorkspace("unknown-workspace"),
      null,
    );
    assert.deepEqual(
      (await queries.getRefusedTasks("tasks")).map((task) => task.id),
      ["tasks-product-004", "tasks-product-007"],
    );
    assert.equal((await queries.getUpcomingTasks("tasks", 1)).length, 3);

    assert.equal(
      (await queries.getTask("tasks", "product", "tasks-product-001"))
        ?.title,
      "Workspace onboarding, first-run experience",
    );
    assert.equal(
      await queries.getTask("tasks", "product", "missing-task"),
      null,
    );
    assert.equal(
      (await queries.getProject("tasks", "product"))?.name,
      "Product Roadmap",
    );
    assert.equal(await queries.getProject("tasks", "missing-project"), null);
    assert.deepEqual(
      await queries.getActivityForTask("tasks", "tasks-product-001"),
      [],
    );
    assert.equal(
      (await queries.getTasksForProject("tasks", "product")).length,
      7,
    );
    assert.deepEqual(
      await queries.getTasksForProject("tasks", "missing-project"),
      [],
    );
    assert.equal(
      (await queries.getEffectiveNodesForWorkspace("tasks")).length,
      7,
    );
    assert.deepEqual(
      await queries.getEffectiveNodesForWorkspace("unknown-workspace"),
      [],
    );
  } finally {
    for (const key of Object.keys(process.env)) {
      if (!(key in original)) delete process.env[key];
    }
    Object.assign(process.env, original);
  }
});
