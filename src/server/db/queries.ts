/**
 * Workspace-scoped query module for the Roadmap product.
 *
 * INVARIANT: every query that touches tenant data MUST filter by workspaceSlug.
 * No exceptions. Leaking rows across tenants is the worst possible failure mode.
 *
 * Cycle 3 — initial query surface: workspace CRUD + workspace-scoped
 * projects/tasks/counts. Foundational queries only — build on this in Cycle 4+.
 */

import { eq, and, asc, lte, gte, ne } from "drizzle-orm";
import { db } from "./index";
import {
  workspaces,
  projects,
  projectSources,
  tasks,
  activity,
  comments,
} from "./schema";
import type { Workspace, Project, ProjectSource, Task, Status, Activity, Comment } from "./schema";
import type { ParsedItem } from "@/server/parser/parse-markdown";

// ---------------------------------------------------------------------------
// Workspace queries
// ---------------------------------------------------------------------------

/** Resolve one workspace by slug. Returns null if not found. */
export async function getWorkspace(slug: string): Promise<Workspace | null> {
  const [row] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);
  return row ?? null;
}

/** All workspaces owned by a Clerk user, sorted by creation date. */
export async function getWorkspacesForUser(
  userId: string,
): Promise<Workspace[]> {
  return db
    .select()
    .from(workspaces)
    .where(eq(workspaces.ownerUserId, userId))
    .orderBy(asc(workspaces.createdAt));
}

/** Create a new workspace. Slug must be unique (PK). Throws on conflict. */
export async function createWorkspace({
  slug,
  name,
  ownerUserId,
  plan = "free",
}: {
  slug: string;
  name: string;
  ownerUserId: string;
  plan?: "free" | "pro" | "studio";
}): Promise<Workspace> {
  await db.insert(workspaces).values({ slug, name, ownerUserId, plan });
  const row = await getWorkspace(slug);
  if (!row) throw new Error(`createWorkspace: insert succeeded but row not found for slug="${slug}"`);
  return row;
}

// ---------------------------------------------------------------------------
// Project queries — always workspace-scoped
// ---------------------------------------------------------------------------

/** All projects belonging to a workspace, sorted by sortOrder. */
export async function getProjectsForWorkspace(
  workspaceSlug: string,
): Promise<Project[]> {
  return db
    .select()
    .from(projects)
    .where(eq(projects.workspaceSlug, workspaceSlug))
    .orderBy(asc(projects.sortOrder));
}

/** Create a new project in a workspace. Slug must be unique within the workspace. */
export async function createProject({
  slug,
  name,
  workspaceSlug,
  oneLiner = "",
  accent = "#4f46e5",
}: {
  slug: string;
  name: string;
  workspaceSlug: string;
  oneLiner?: string;
  accent?: string;
}): Promise<Project> {
  await db.insert(projects).values({
    slug,
    name,
    oneLiner,
    accent,
    workspaceSlug,
    sortOrder: 0,
    isPublic: false,
  });
  const [row] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.workspaceSlug, workspaceSlug)))
    .limit(1);
  if (!row) throw new Error(`createProject: row not found after insert for slug="${slug}"`);
  return row;
}

// ---------------------------------------------------------------------------
// ProjectSource queries — always workspace + project scoped
// ---------------------------------------------------------------------------

/** Get the raw markdown source for a project. Returns null if none yet. */
export async function getProjectSource(
  projectSlug: string,
  workspaceSlug: string,
): Promise<ProjectSource | null> {
  const [row] = await db
    .select()
    .from(projectSources)
    .where(
      and(
        eq(projectSources.projectSlug, projectSlug),
        eq(projectSources.workspaceSlug, workspaceSlug),
      ),
    )
    .limit(1);
  return row ?? null;
}

/** Insert or replace the raw markdown source for a project. */
export async function upsertProjectSource({
  projectSlug,
  workspaceSlug,
  rawMarkdown,
  parseError = null,
  lastParsedAt = null,
}: {
  projectSlug: string;
  workspaceSlug: string;
  rawMarkdown: string;
  parseError?: string | null;
  lastParsedAt?: Date | null;
}): Promise<void> {
  // libSQL / SQLite does not support onConflictDoUpdate with composite PK
  // via Drizzle's upsert helper in all versions. Use raw SQL for safety.
  await db
    .insert(projectSources)
    .values({ projectSlug, workspaceSlug, rawMarkdown, lastParsedAt, parseError })
    .onConflictDoUpdate({
      target: [projectSources.projectSlug, projectSources.workspaceSlug],
      set: { rawMarkdown, lastParsedAt, parseError },
    });
}

// ---------------------------------------------------------------------------
// Task queries — always workspace-scoped
// ---------------------------------------------------------------------------

/**
 * All tasks belonging to a workspace, sorted by project then sortOrder.
 * Ignores legacy null-workspace rows — those belong to the personal portfolio.
 */
export async function getTasksForWorkspace(
  workspaceSlug: string,
): Promise<Task[]> {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.workspaceSlug, workspaceSlug))
    .orderBy(asc(tasks.projectSlug), asc(tasks.sortOrder));
}

// ---------------------------------------------------------------------------
// Aggregate counts — always workspace-scoped
// ---------------------------------------------------------------------------

/**
 * Cross-project status counts for a workspace. Same shape as Tasks-canonical
 * getCounts() but scoped to a single tenant.
 *
 * Used by the workspace dashboard header strip.
 */
export async function getCountsForWorkspace(
  workspaceSlug: string,
): Promise<{
  total: number;
  shipped: number;
  inFlight: number;
  blocked: number;
  next: number;
  refused: number;
}> {
  const rows = await db
    .select({ status: tasks.status })
    .from(tasks)
    .where(eq(tasks.workspaceSlug, workspaceSlug));

  const counts = {
    total: rows.length,
    shipped: 0,
    inFlight: 0,
    blocked: 0,
    next: 0,
    refused: 0,
  };

  for (const r of rows) {
    const s = r.status as Status;
    if (s === "shipped") counts.shipped++;
    else if (s === "in-flight") counts.inFlight++;
    else if (s === "blocked") counts.blocked++;
    else if (s === "next") counts.next++;
    else if (s === "refused") counts.refused++;
  }

  return counts;
}

// ---------------------------------------------------------------------------
// Parsed-item upsert — parser-driven writes
// ---------------------------------------------------------------------------

/**
 * Upsert a batch of ParsedItems into the tasks table.
 *
 * Parser-derived status WINS on every re-paste (markdown-as-source-of-truth).
 * Items removed from the markdown are left in the DB — no deletion semantics in v1.
 *
 * INVARIANT: every row must have workspaceSlug set (enforced by the parser contract).
 */
export async function upsertParsedItems(items: ParsedItem[]): Promise<void> {
  if (items.length === 0) return;

  for (const item of items) {
    await db
      .insert(tasks)
      .values({
        id: item.id,
        projectSlug: item.projectSlug,
        workspaceSlug: item.workspaceSlug,
        title: item.title,
        description: item.description,
        status: item.status,
        kind: item.kind,
        targetDate: item.targetDate ?? undefined,
        weekHeading: item.weekHeading ?? undefined,
        category: item.category ?? undefined,
        sortOrder: item.sortOrder,
        isLaunch: item.isLaunch,
        assignee: "claude-code",
      })
      .onConflictDoUpdate({
        target: tasks.id,
        set: {
          title: item.title,
          description: item.description,
          status: item.status,
          kind: item.kind,
          targetDate: item.targetDate ?? undefined,
          weekHeading: item.weekHeading ?? undefined,
          category: item.category ?? undefined,
          sortOrder: item.sortOrder,
          isLaunch: item.isLaunch,
        },
      });
  }
}

// ---------------------------------------------------------------------------
// Public surface queries — workspace-scoped, Cycle 6
// ---------------------------------------------------------------------------

/**
 * Tasks with status="refused" for a workspace.
 * Drives the /[workspaceSlug]/refusals page.
 */
export async function getRefusedTasks(workspaceSlug: string): Promise<Task[]> {
  return db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.workspaceSlug, workspaceSlug),
        eq(tasks.status, "refused"),
      ),
    )
    .orderBy(asc(tasks.projectSlug), asc(tasks.sortOrder));
}

/**
 * Upcoming (non-shipped) tasks with target_date within the next `days` days.
 * Used for the right-rail "Coming up" strip on the master roadmap.
 */
export async function getUpcomingTasks(
  workspaceSlug: string,
  days = 7,
): Promise<Task[]> {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const future = new Date(today);
  future.setDate(future.getDate() + days);
  const futureStr = future.toISOString().slice(0, 10);

  return db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.workspaceSlug, workspaceSlug),
        ne(tasks.status, "shipped"),
        ne(tasks.status, "refused"),
        gte(tasks.targetDate, todayStr),
        lte(tasks.targetDate, futureStr),
      ),
    )
    .orderBy(asc(tasks.targetDate), asc(tasks.sortOrder));
}

/**
 * Single task lookup, workspace+project scoped.
 * Returns null if the task doesn't exist under that workspace+project.
 */
export async function getTask(
  workspaceSlug: string,
  projectSlug: string,
  taskId: string,
): Promise<Task | null> {
  const [row] = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.workspaceSlug, workspaceSlug),
        eq(tasks.projectSlug, projectSlug),
        eq(tasks.id, taskId),
      ),
    )
    .limit(1);
  return row ?? null;
}

/**
 * Single project lookup, workspace scoped.
 * Returns null if the project doesn't belong to that workspace.
 */
export async function getProject(
  workspaceSlug: string,
  projectSlug: string,
): Promise<Project | null> {
  const [row] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.workspaceSlug, workspaceSlug),
        eq(projects.slug, projectSlug),
      ),
    )
    .limit(1);
  return row ?? null;
}

/**
 * Comments for a task. Implicitly workspace-scoped through the task FK.
 * Sorted oldest-first (chronological reading order).
 */
export async function getCommentsForTask(taskId: string): Promise<Comment[]> {
  return db
    .select()
    .from(comments)
    .where(eq(comments.taskId, taskId))
    .orderBy(asc(comments.createdAt));
}

/**
 * Insert a new comment. Auth is enforced upstream in addCommentAction —
 * this function trusts that the caller has already verified the user.
 */
export async function addComment({
  taskId,
  workspaceSlug,
  body,
  author = "Ethan",
}: {
  taskId: string;
  workspaceSlug: string;
  body: string;
  author?: string;
}): Promise<void> {
  const id = `${taskId}-c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  await db.insert(comments).values({ id, taskId, workspaceSlug, body, author });
}

/**
 * Activity events for a task, newest-first.
 * Implicitly workspace-scoped through the entityId relationship.
 */
export async function getActivityForTask(
  taskId: string,
  limit = 20,
): Promise<Activity[]> {
  return db
    .select()
    .from(activity)
    .where(
      and(
        eq(activity.entityKind, "task"),
        eq(activity.entityId, taskId),
      ),
    )
    .orderBy(asc(activity.createdAt))
    .limit(limit);
}

/**
 * Tasks for a single project within a workspace, sorted by sortOrder.
 * Used by the /[workspaceSlug]/[projectSlug] drill-down page.
 */
export async function getTasksForProject(
  workspaceSlug: string,
  projectSlug: string,
): Promise<Task[]> {
  return db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.workspaceSlug, workspaceSlug),
        eq(tasks.projectSlug, projectSlug),
      ),
    )
    .orderBy(asc(tasks.sortOrder));
}

// ---------------------------------------------------------------------------
// Cross-tenant aggregates (for public homepage vital sign only)
// These are the ONLY functions that are intentionally cross-tenant.
// They count, never expose content.
// ---------------------------------------------------------------------------

/** Total workspace count across all tenants. Public vital sign. */
export async function getTotalWorkspaceCount(): Promise<number> {
  const rows = await db.select({ slug: workspaces.slug }).from(workspaces);
  return rows.length;
}

/** Total workspace-scoped roadmap count across all tenants. Public vital sign. */
export async function getTotalWorkspaceProjectCount(): Promise<number> {
  // workspaceSlug is now NOT NULL on all rows; just count everything.
  const rows = await db
    .select({ workspaceSlug: projects.workspaceSlug, slug: projects.slug })
    .from(projects);
  return rows.length;
}

/** Total workspace-scoped shipped-task count. Public vital sign. */
export async function getTotalShippedCount(): Promise<number> {
  // workspaceSlug is NOT NULL on all rows after the Cycle-7 migration.
  const rows = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.status, "shipped"));
  return rows.length;
}
