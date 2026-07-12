import { eq, inArray } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import {
  activity,
  audienceShares,
  comments,
  nodeOverlays,
  projectSources,
  projects,
  subtasks,
  tasks,
  timelinePublicationItems,
  timelinePublications,
  workspaces,
} from "./db/schema";
import * as schema from "./db/schema";

export type ErasureDb = LibSQLDatabase<typeof schema>;

/**
 * Hard-delete a user's entire footprint in Roadmap's Turso DB.
 *
 * GDPR right-to-erasure / App Store 5.1.1(v). Roadmap keys ownership at the
 * workspace layer (`workspaces.ownerUserId` = Clerk userId): the user "is"
 * their set of owned workspaces, and every content table carries a
 * denormalized `workspace_slug`. We delete every workspace-scoped table
 * EXPLICITLY rather than trust FK cascade, `ON DELETE cascade` is not
 * reliably enforced over Turso's stateless HTTP, so a cascade we assume is
 * happening can silently not.
 *
 * ── Why this changed ──────────────────────────────────────────────────
 * The previous version explicitly deleted `subtasks` (distrusting cascade)
 * but left `comments` to `comments.taskId ON DELETE cascade`, the exact
 * reliance it avoided one line above. If that cascade no-ops, comments
 * orphan (their task is gone) and survive the user's deletion. `comments`
 * carries a denormalized `workspace_slug`, so it's now deleted explicitly
 * by workspace like every other content table.
 *
 * db-injected so it runs against the production singleton OR an in-memory
 * test DB (see account-erasure.test.ts). Idempotent.
 */
export async function eraseAccountData(
  database: ErasureDb,
  clerkId: string,
): Promise<void> {
  const ownedWorkspaces = await database
    .select({ slug: workspaces.slug })
    .from(workspaces)
    .where(eq(workspaces.ownerUserId, clerkId));

  if (ownedWorkspaces.length === 0) return;

  const slugs = ownedWorkspaces.map((w) => w.slug);

  const publicationRows = await database
    .select({ id: timelinePublications.id })
    .from(timelinePublications)
    .where(inArray(timelinePublications.workspaceSlug, slugs));
  if (publicationRows.length > 0) {
    const publicationIds = publicationRows.map((row) => row.id);
    await database
      .delete(audienceShares)
      .where(inArray(audienceShares.publicationId, publicationIds));
    await database
      .delete(timelinePublicationItems)
      .where(inArray(timelinePublicationItems.publicationId, publicationIds));
    await database
      .delete(timelinePublications)
      .where(inArray(timelinePublications.id, publicationIds));
  }

  // Collect task ids so subtasks (keyed by taskId) are swept explicitly
  // rather than via the unreliable cascade.
  const taskRows = await database
    .select({ id: tasks.id })
    .from(tasks)
    .where(inArray(tasks.workspaceSlug, slugs));
  if (taskRows.length > 0) {
    const ids = taskRows.map((t) => t.id);
    // isolation-ok: ids derive only from tasks in this user's owned
    // workspaces (selected above by ownerUserId), so the filter is
    // tenant-bounded transitively.
    await database.delete(subtasks).where(inArray(subtasks.taskId, ids));
  }

  // Every workspace-scoped content table, explicit, no cascade reliance.
  await database.delete(comments).where(inArray(comments.workspaceSlug, slugs));
  await database
    .delete(nodeOverlays)
    .where(inArray(nodeOverlays.workspaceSlug, slugs));
  await database.delete(activity).where(inArray(activity.workspaceSlug, slugs));
  await database
    .delete(projectSources)
    .where(inArray(projectSources.workspaceSlug, slugs));
  await database.delete(tasks).where(inArray(tasks.workspaceSlug, slugs));
  await database.delete(projects).where(inArray(projects.workspaceSlug, slugs));
  // isolation-ok: slugs are exactly this user's owned workspaces (selected
  // above by ownerUserId). Final step of account delete.
  await database.delete(workspaces).where(inArray(workspaces.slug, slugs));
}
