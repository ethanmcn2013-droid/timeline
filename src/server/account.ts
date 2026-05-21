import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import {
  activity,
  nodeOverlays,
  projectSources,
  projects,
  subtasks,
  tasks,
  workspaces,
} from "@/server/db/schema";

/**
 * Hard-delete the user's entire footprint in Roadmap's Turso DB.
 *
 * Called by `POST /api/account/delete` BEFORE the Clerk admin delete
 * so that if the DB purge errors we don't end up with an orphaned
 * Clerk-deleted user whose data is still here.
 *
 * Roadmap's schema keys ownership at the workspace layer
 * (`workspaces.ownerUserId` = Clerk userId). The user "is" their set
 * of owned workspaces; comments are public-anyone (no userId) so
 * there's nothing user-keyed outside workspaces to clean up.
 *
 * Cascade chain inside each workspace:
 *   - tasks cascades subtasks + comments + activity on task delete
 *     (subtasks.taskId has ON DELETE CASCADE; comments.taskId same)
 *   - projects, projectSources, activity, nodeOverlays do NOT cascade
 *     and need explicit deletes per workspace
 *
 * Idempotent: re-running after partial failure is safe.
 */
export async function deleteAccountForUser(clerkId: string): Promise<void> {
  const ownedWorkspaces = await db
    .select({ slug: workspaces.slug })
    .from(workspaces)
    .where(eq(workspaces.ownerUserId, clerkId));

  if (ownedWorkspaces.length === 0) return;

  const slugs = ownedWorkspaces.map((w) => w.slug);

  // Collect task IDs for explicit subtask sweep (subtasks cascade on
  // task delete via FK, but doing it explicitly here keeps the order
  // predictable across libSQL versions where cascade timing varies.)
  const taskIds = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(inArray(tasks.workspaceSlug, slugs));

  if (taskIds.length > 0) {
    const ids = taskIds.map((t) => t.id);
    await db.delete(subtasks).where(inArray(subtasks.taskId, ids));
  }

  await db.delete(nodeOverlays).where(inArray(nodeOverlays.workspaceSlug, slugs));
  await db.delete(activity).where(inArray(activity.workspaceSlug, slugs));
  await db.delete(projectSources).where(inArray(projectSources.workspaceSlug, slugs));
  await db.delete(tasks).where(inArray(tasks.workspaceSlug, slugs));
  await db.delete(projects).where(inArray(projects.workspaceSlug, slugs));
  await db.delete(workspaces).where(inArray(workspaces.slug, slugs));
}
