import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

/**
 * libSQL client for Roadmap. Shares the same Turso DB as Tasks.
 * Schema canonical lives in ~/Projects/personal/tasks/src/server/roadmap-db/.
 * This is a DERIVED mirror — see schema.ts header.
 */
if (process.env.VERCEL === "1" && !process.env.TURSO_DATABASE_URL) {
  throw new Error("TURSO_DATABASE_URL is required in Vercel environments");
}

const url = process.env.TURSO_DATABASE_URL ?? "file:roadmap.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
export { schema };
