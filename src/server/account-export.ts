import { eq, inArray } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import {
  activity,
  comments,
  nodeOverlays,
  projectSources,
  projects,
  subtasks,
  tasks,
  workspaces,
} from "./db/schema";
import * as schema from "./db/schema";

export type ExportDb = LibSQLDatabase<typeof schema>;

/**
 * GDPR Art. 20 (data portability), assemble everything Roadmap holds for a
 * user. Ownership is keyed at the workspace layer (`workspaces.ownerUserId`),
 * so the export is the set of owned workspaces and all their content.
 * Counterpart to `account-erasure.ts`; same db-injection seam (testable).
 */
export async function exportAccountData(database: ExportDb, clerkId: string) {
  const ownedWorkspaces = await database
    .select()
    .from(workspaces)
    .where(eq(workspaces.ownerUserId, clerkId));

  const slugs = ownedWorkspaces.map((w) => w.slug);

  const empty = {
    product: "roadmap" as const,
    exportedAt: new Date().toISOString(),
    userId: clerkId,
    workspaces: ownedWorkspaces,
    projects: [] as (typeof projects.$inferSelect)[],
    tasks: [] as (typeof tasks.$inferSelect)[],
    subtasks: [] as (typeof subtasks.$inferSelect)[],
    activity: [] as (typeof activity.$inferSelect)[],
    comments: [] as (typeof comments.$inferSelect)[],
    projectSources: [] as (typeof projectSources.$inferSelect)[],
    nodeOverlays: [] as (typeof nodeOverlays.$inferSelect)[],
  };
  if (slugs.length === 0) return empty;

  const [projectRows, taskRows, subtaskRows, activityRows, commentRows, sourceRows, overlayRows] =
    await Promise.all([
      database.select().from(projects).where(inArray(projects.workspaceSlug, slugs)),
      database.select().from(tasks).where(inArray(tasks.workspaceSlug, slugs)),
      database.select().from(subtasks).where(inArray(subtasks.workspaceSlug, slugs)),
      database.select().from(activity).where(inArray(activity.workspaceSlug, slugs)),
      database.select().from(comments).where(inArray(comments.workspaceSlug, slugs)),
      database.select().from(projectSources).where(inArray(projectSources.workspaceSlug, slugs)),
      database.select().from(nodeOverlays).where(inArray(nodeOverlays.workspaceSlug, slugs)),
    ]);

  return {
    ...empty,
    projects: projectRows,
    tasks: taskRows,
    subtasks: subtaskRows,
    activity: activityRows,
    comments: commentRows,
    projectSources: sourceRows,
    nodeOverlays: overlayRows,
  };
}
