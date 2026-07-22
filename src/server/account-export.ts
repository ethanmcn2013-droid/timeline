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

export type ExportDb = LibSQLDatabase<typeof schema>;

type AudienceShareExport = Pick<
  typeof audienceShares.$inferSelect,
  | "id"
  | "publicationId"
  | "state"
  | "version"
  | "expiresAt"
  | "createdAt"
  | "rotatedAt"
  | "revokedAt"
>;

const audienceShareExportColumns = {
  id: audienceShares.id,
  publicationId: audienceShares.publicationId,
  state: audienceShares.state,
  version: audienceShares.version,
  expiresAt: audienceShares.expiresAt,
  createdAt: audienceShares.createdAt,
  rotatedAt: audienceShares.rotatedAt,
  revokedAt: audienceShares.revokedAt,
};

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
    timelinePublications: [] as (typeof timelinePublications.$inferSelect)[],
    timelinePublicationItems: [] as (typeof timelinePublicationItems.$inferSelect)[],
    // Link lifecycle belongs in the export. Token/session digests do not.
    audienceShares: [] as AudienceShareExport[],
  };
  if (slugs.length === 0) return empty;

  const publicationRows = await database
    .select()
    .from(timelinePublications)
    .where(inArray(timelinePublications.workspaceSlug, slugs));
  const publicationIds = publicationRows.map((row) => row.id);
  const [projectRows, taskRows, subtaskRows, activityRows, commentRows, sourceRows, overlayRows, publicationItemRows, shareRows] =
    await Promise.all([
      database.select().from(projects).where(inArray(projects.workspaceSlug, slugs)),
      database.select().from(tasks).where(inArray(tasks.workspaceSlug, slugs)),
      database.select().from(subtasks).where(inArray(subtasks.workspaceSlug, slugs)),
      database.select().from(activity).where(inArray(activity.workspaceSlug, slugs)),
      database.select().from(comments).where(inArray(comments.workspaceSlug, slugs)),
      database.select().from(projectSources).where(inArray(projectSources.workspaceSlug, slugs)),
      database.select().from(nodeOverlays).where(inArray(nodeOverlays.workspaceSlug, slugs)),
      publicationIds.length > 0
        ? database.select().from(timelinePublicationItems).where(inArray(timelinePublicationItems.publicationId, publicationIds))
        : Promise.resolve([]),
      publicationIds.length > 0
        ? database
            .select(audienceShareExportColumns)
            .from(audienceShares)
            .where(inArray(audienceShares.publicationId, publicationIds))
        : Promise.resolve([]),
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
    timelinePublications: publicationRows,
    timelinePublicationItems: publicationItemRows,
    audienceShares: shareRows,
  };
}
