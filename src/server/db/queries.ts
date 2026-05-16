/**
 * Workspace-scoped query module for the Roadmap product.
 *
 * INVARIANT: every query that touches tenant data MUST filter by workspaceSlug.
 * No exceptions. Leaking rows across tenants is the worst possible failure mode.
 *
 * Cycle 3 — initial query surface: workspace CRUD + workspace-scoped
 * projects/tasks/counts. Foundational queries only — build on this in Cycle 4+.
 */

import { cache } from "react";
import { eq, and, asc, desc, lte, gte, ne, sql } from "drizzle-orm";
import { db } from "./index";
import {
  workspaces,
  projects,
  projectSources,
  tasks,
  activity,
} from "./schema";
import type { Workspace, Project, ProjectSource, Task, Activity } from "./schema";
import type { ParsedItem } from "@/server/parser/parse-markdown";

// ---------------------------------------------------------------------------
// Workspace queries
// ---------------------------------------------------------------------------

/** Resolve one workspace by slug. Returns null if not found.
 *  Wrapped in React cache() so generateMetadata + the page body
 *  share one query per request instead of round-tripping Turso twice. */
export const getWorkspace = cache(async (
  slug: string,
): Promise<Workspace | null> => {
  const [row] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);
  return row ?? null;
});

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

/** Create a new workspace. Slug must be unique (PK). Throws on conflict.
 *  When `templateId` is set, the workspace records which canonical
 *  template seeded it (see studio/docs/TEMPLATES_STRATEGY.md). The
 *  actual project + item seeding happens via `seedWorkspaceFromTemplate`. */
export async function createWorkspace({
  slug,
  name,
  ownerUserId,
  ownerName = null,
  ownerEmail = null,
  plan = "free",
  templateId = null,
}: {
  slug: string;
  name: string;
  ownerUserId: string;
  ownerName?: string | null;
  ownerEmail?: string | null;
  plan?: "free" | "pro" | "studio";
  templateId?: string | null;
}): Promise<Workspace> {
  await db.insert(workspaces).values({
    slug,
    name,
    ownerUserId,
    ownerName,
    ownerEmail,
    plan,
    templateId,
  });
  const row = await getWorkspace(slug);
  if (!row) throw new Error(`createWorkspace: insert succeeded but row not found for slug="${slug}"`);
  return row;
}

/**
 * Seed a workspace with the projects + items from a canonical workspace
 * template (T-2.1b). Called from `createWorkspaceAction` after the
 * workspace row has been inserted. Synced template data comes from
 * `src/lib/templates.generated.ts` (refreshed via `pnpm sync:templates`).
 *
 * Idempotent enough for re-runs: project + item ids include the workspace
 * slug so re-seeding the same workspace would just INSERT-or-fail on PK.
 * In practice this is only called once per workspace (right after create).
 */
export async function seedWorkspaceFromTemplate({
  workspaceSlug,
  template,
}: {
  workspaceSlug: string;
  template: {
    roadmap: {
      projects: Array<{ slug: string; name: string; oneLiner: string; accent?: string }>;
      items: Array<{
        projectSlug: string;
        title: string;
        description: string;
        status: "shipped" | "in-flight" | "next" | "blocked" | "refused";
        targetDate?: string;
      }>;
    };
  };
}): Promise<{ projectCount: number; itemCount: number }> {
  // Wrap in a transaction so a partial failure leaves the workspace
  // un-seeded for a clean retry rather than half-populated.
  await db.transaction(async (tx) => {
    // Single batched INSERT per table — avoids one Turso WAN round trip
    // per row. Template sizes are bounded (5 anchor templates, O(10–50)
    // items each), so a single VALUES(...),(...)  statement is safe.
    if (template.roadmap.projects.length > 0) {
      await tx.insert(projects).values(
        template.roadmap.projects.map((p, i) => ({
          slug: p.slug,
          name: p.name,
          oneLiner: p.oneLiner,
          accent: p.accent ?? "#4f46e5",
          workspaceSlug,
          sortOrder: i,
        })),
      );
    }

    if (template.roadmap.items.length > 0) {
      await tx.insert(tasks).values(
        template.roadmap.items.map((it, i) => ({
          id: `${workspaceSlug}-${it.projectSlug}-${String(i + 1).padStart(3, "0")}`,
          projectSlug: it.projectSlug,
          workspaceSlug,
          title: it.title,
          description: it.description,
          status: it.status,
          sortOrder: i,
          targetDate: it.targetDate,
        })),
      );
    }
  });

  return {
    projectCount: template.roadmap.projects.length,
    itemCount: template.roadmap.items.length,
  };
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

/**
 * Latest task.updatedAt across a workspace. Returns null when the
 * workspace has no items (no activity to surface). Cheap single-row
 * MAX query — used by the public guest view to render
 * "Last updated X" without sending the full task list (Sprint 2
 * cycle 10.2, 2026-05-12).
 */
export async function getLastUpdatedForWorkspace(
  workspaceSlug: string,
): Promise<Date | null> {
  const rows = await db
    .select({ updatedAt: tasks.updatedAt })
    .from(tasks)
    .where(eq(tasks.workspaceSlug, workspaceSlug))
    .orderBy(desc(tasks.updatedAt))
    .limit(1);
  return rows[0]?.updatedAt ?? null;
}

// ---------------------------------------------------------------------------
// Parsed-item writes — parser-driven
//
// Workspace status counts are derived in the page render from the task
// list it already fetches (see app/[workspaceSlug]/page.tsx) rather than
// a second full-table read. The standalone getCountsForWorkspace +
// unused upsertParsedItems were removed 2026-05-15.
// ---------------------------------------------------------------------------

/**
 * Atomic write of parsed items + project source row. Prevents the failure
 * mode where items land in the tasks table but the source row's
 * lastParsedAt is never updated (editor renders "never parsed" while the
 * public viewer renders fresh items).
 */
export async function saveSourceAndItems(input: {
  projectSlug: string;
  workspaceSlug: string;
  rawMarkdown: string;
  parseError?: string | null;
  lastParsedAt?: Date | null;
  items: ParsedItem[];
}): Promise<void> {
  await db.transaction(async (tx) => {
    // Single batched INSERT … ON CONFLICT DO UPDATE instead of one
    // round trip per item. Conflicting rows take the incoming values
    // via excluded.* — keeps markdown-as-source-of-truth semantics
    // while collapsing N Turso WAN round trips into one statement.
    if (input.items.length > 0) {
      await tx
        .insert(tasks)
        .values(
          input.items.map((item) => ({
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
            assignee: "claude-code" as const,
          })),
        )
        .onConflictDoUpdate({
          target: tasks.id,
          set: {
            title: sql`excluded.title`,
            description: sql`excluded.description`,
            status: sql`excluded.status`,
            kind: sql`excluded.kind`,
            targetDate: sql`excluded.target_date`,
            weekHeading: sql`excluded.week_heading`,
            category: sql`excluded.category`,
            sortOrder: sql`excluded.sort_order`,
            isLaunch: sql`excluded.is_launch`,
          },
        });
    }
    await tx
      .insert(projectSources)
      .values({
        projectSlug: input.projectSlug,
        workspaceSlug: input.workspaceSlug,
        rawMarkdown: input.rawMarkdown,
        lastParsedAt: input.lastParsedAt ?? null,
        parseError: input.parseError ?? null,
      })
      .onConflictDoUpdate({
        target: [projectSources.projectSlug, projectSources.workspaceSlug],
        set: {
          rawMarkdown: input.rawMarkdown,
          lastParsedAt: input.lastParsedAt ?? null,
          parseError: input.parseError ?? null,
        },
      });
  });
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
export const getTask = cache(async (
  workspaceSlug: string,
  projectSlug: string,
  taskId: string,
): Promise<Task | null> => {
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
});

/**
 * Single project lookup, workspace scoped.
 * Returns null if the project doesn't belong to that workspace.
 */
export const getProject = cache(async (
  workspaceSlug: string,
  projectSlug: string,
): Promise<Project | null> => {
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
});

// getCommentsForTask + addComment removed 2026-05-12 — Suite Review T3
// decision. Comment threading is a locked refusal; the helpers were the
// last live consumers of the comments table. The schema column itself is
// preserved against any pre-existing owner data, but no code path reads
// or writes through it.

/**
 * Activity feed for a single task, workspace-scoped.
 *
 * Phase 1.2 fix (2026-05-12): workspaceSlug is REQUIRED. Task IDs are
 * deterministic strings; without workspace scoping, an attacker who
 * guesses or enumerates can read other tenants' activity history.
 * The file's INVARIANT (see top) is that every query filters by workspaceSlug.
 */
export async function getActivityForTask(
  workspaceSlug: string,
  taskId: string,
  limit = 20,
): Promise<Activity[]> {
  // Most-recent-first so the activity panel shows the latest 20
  // events, not the oldest 20 (which would never grow past day-one
  // history once a task accumulates events).
  const rows = await db
    .select()
    .from(activity)
    .where(
      and(
        eq(activity.workspaceSlug, workspaceSlug),
        eq(activity.entityKind, "task"),
        eq(activity.entityId, taskId),
      ),
    )
    .orderBy(desc(activity.createdAt))
    .limit(limit);
  // Renderer expects chronological order; reverse after the limit.
  return rows.reverse();
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

// Cross-tenant count aggregates (getTotalWorkspaceCount /
// getTotalWorkspaceProjectCount / getTotalShippedCount) were removed
// 2026-05-15 — no callers anywhere in the suite, and they did
// full-table fetches to count rows in JS. Reintroduce with a SQL
// count(*) if a public vital-sign surface ever needs them.
