import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

/**
 * libSQL client for Roadmap.
 * Production reads Turso. Preview builds may not receive Turso secrets, so
 * they fall back to the local file client and keep public marketing deployable.
 * Schema canonical lives in ~/Projects/personal/tasks/src/server/roadmap-db/.
 * This is a DERIVED mirror — see schema.ts header.
 */

const url = process.env.TURSO_DATABASE_URL ?? "file:roadmap.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
export { schema };
