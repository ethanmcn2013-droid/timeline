import type { Config } from "drizzle-kit";

/**
 * Drizzle config for the Roadmap repo.
 *
 * READ-ONLY CONVENTION: The Roadmap repo does NOT push schema changes.
 * Tasks is the canonical schema owner. Only Tasks pushes via
 * `drizzle.roadmap.config.ts`. This config exists so `npx drizzle-kit studio`
 * works locally for DB inspection.
 *
 * To inspect:
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx drizzle-kit studio
 *
 * To push schema (from Tasks repo only):
 *   cd ~/Projects/personal/tasks
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... \
 *   npx drizzle-kit push --config drizzle.roadmap.config.ts --force
 */
export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? "file:roadmap.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  verbose: false,
  strict: true,
} satisfies Config;
