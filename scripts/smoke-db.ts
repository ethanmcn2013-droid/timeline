import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../src/server/db/index";
import { sql } from "drizzle-orm";

async function main() {
  const tables = await db.run(
    sql`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`,
  );
  console.log("Tables:", tables.rows.map((r) => (r as unknown as string[])[0]).join(", "));

  const workspaceCount = await db.run(
    sql`SELECT COUNT(*) as c FROM workspaces`,
  );
  console.log("Workspace count:", workspaceCount.rows[0]);

  const required = [
    "workspaces",
    "project_sources",
    "projects",
    "tasks",
    "subtasks",
    "activity",
    "comments",
  ];
  const present = tables.rows.map((r) => (r as unknown as string[])[0]);
  const missing = required.filter((t) => !present.includes(t));
  if (missing.length > 0) {
    console.error("MISSING:", missing.join(", "));
    process.exit(1);
  }

  console.log("\nSmoke test passed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .then(() => process.exit(0));
