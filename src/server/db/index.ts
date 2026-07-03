import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

/**
 * libSQL client for Roadmap.
 * Production reads Turso. Preview builds may not receive Turso secrets, so
 * they fall back to the local file client and keep public marketing deployable.
 * Schema canonical lives in ~/Projects/personal/tasks/src/server/roadmap-db/.
 * This is a DERIVED mirror, see schema.ts header.
 */

const url = process.env.TURSO_DATABASE_URL ?? "file:roadmap.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

// Remote Turso connections require a token. Fail loudly at startup rather
// than silently passing undefined and getting auth errors mid-request.
if (url.startsWith("libsql:") && !authToken) {
  throw new Error(
    "TURSO_AUTH_TOKEN required for remote Turso DB (url starts with libsql:). " +
    "Set the env var or switch to a local file URL for development.",
  );
}

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
export { schema };
