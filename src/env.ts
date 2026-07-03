import "server-only";
import { isDemoMode } from "@/lib/access-mode";

/**
 * Boot-time environment validation for Signal Timeline (roadmap).
 *
 * Same pattern as the rest of the suite. Note the public-by-default shape:
 * Timeline serves public timelines, which read from the database, so the
 * Turso DB is REQUIRED. Clerk is only needed for workspace owners signing in
 * to edit, so it is RECOMMENDED (public reads work without it).
 *
 * Enforces in REAL production only (skips demo/review/dev). Dependency-free;
 * called once from instrumentation.ts `register()`.
 */

// Public timelines read from the DB, Timeline cannot serve without it.
const REQUIRED_IN_PRODUCTION: ReadonlyArray<readonly [string, string]> = [
  ["TURSO_DATABASE_URL", "timeline database"],
  ["TURSO_AUTH_TOKEN", "timeline database auth token"],
];

// Owner sign-in + tier enforcement break without these, but public timelines
// (the core product) still render.
const RECOMMENDED_IN_PRODUCTION: ReadonlyArray<readonly [string, string]> = [
  ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "Clerk auth for workspace owners (browser)"],
  ["CLERK_SECRET_KEY", "Clerk auth for workspace owners (server)"],
  ["TURSO_ENTITLEMENTS_DATABASE_URL", "shared tier entitlements"],
];

let validated = false;

export function validateEnv(): void {
  if (validated) return;
  validated = true;

  const isProd = process.env.NODE_ENV === "production";
  if (!isProd || isDemoMode()) return; // dev / demo / review: nothing to enforce

  const missingRecommended = RECOMMENDED_IN_PRODUCTION.filter(
    ([key]) => !process.env[key],
  );
  if (missingRecommended.length > 0) {
    console.warn(
      "[env] missing recommended production variables (features degraded):\n" +
        missingRecommended.map(([k, why]) => `  - ${k}, ${why}`).join("\n"),
    );
  }

  const missingRequired = REQUIRED_IN_PRODUCTION.filter(
    ([key]) => !process.env[key],
  );
  if (missingRequired.length > 0) {
    const detail = missingRequired
      .map(([k, why]) => `  - ${k}, ${why}`)
      .join("\n");
    throw new Error(
      `[env] FATAL: missing required production environment variables:\n${detail}\n\n` +
        "Set them in the Vercel project (or run in demo/review mode). Refusing to " +
        "boot a half-configured production environment, this would otherwise 500 " +
        "every request that touches the database instead of failing here, visibly.",
    );
  }
}
