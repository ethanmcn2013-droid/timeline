import "server-only";
import { db } from "@/server/db";
import { eraseAccountData } from "@/server/account-erasure";

/**
 * Hard-delete the user's entire footprint in Roadmap's Turso DB.
 *
 * Called by `POST /api/account/delete` BEFORE the Clerk admin delete so
 * that if the DB purge errors we don't end up with an orphaned
 * Clerk-deleted user whose data is still here.
 *
 * The erasure itself lives in `account-erasure.ts` as a db-injected pure
 * function so it can be exercised end-to-end against an in-memory libSQL DB
 * (see account-erasure.test.ts). It deletes every workspace-scoped table
 * EXPLICITLY (including `comments`, which a prior version left to an
 * unreliable cascade) rather than trusting libSQL FK cascade over Turso's
 * stateless HTTP.
 *
 * Idempotent: re-running after partial failure is safe.
 */
export async function deleteAccountForUser(clerkId: string): Promise<void> {
  await eraseAccountData(db, clerkId);
}
