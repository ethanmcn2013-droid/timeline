/**
 * DERIVED — schema mirrored from
 * ~/Projects/personal/tasks/src/server/roadmap-db/schema.ts.
 * Source of truth lives in Tasks. Edit there, then sync here.
 *
 * Cycle 3 — schema gained workspaceSlug + workspaces + project_sources
 * for multi-tenant Roadmap product (Deliverable 3 of Roadmap brief).
 */

/**
 * Canonical roadmap schema — SQLite via libSQL / Turso.
 * Lifted from portfolio repo in Cycle 46 (Phase B).
 * Canonicalized here in Cycle 48 (Phase D) — Tasks is now
 * the source of truth for this schema.
 *
 * Cycle 50 — gained workspace multi-tenancy:
 *   - nullable workspaceSlug column on projects/tasks/subtasks/activity/comments
 *   - new workspaces table (slug PK, ownerUserId, plan)
 *   - new project_sources table (composite PK, raw markdown source storage)
 * Migration is additive — legacy rows keep workspaceSlug=null and remain
 * visible to the portfolio home page. Roadmap product queries scope by
 * workspaceSlug so legacy rows are invisible to multi-tenant surfaces.
 *
 * Cycle 7 (Roadmap) — composite PK + hardening:
 *   - projects.slug promoted from sole PK → composite PK (workspaceSlug, slug)
 *   - workspaceSlug made NOT NULL on projects/tasks/subtasks/activity/comments
 *   - workspaces gained nullable description column
 *   - Legacy null-workspace project rows: backfill to "legacy" workspace
 *     or delete (see production runbook). No legacy rows expected in prod.
 */

import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

/**
 * Roadmap PM schema — public-facing internal project management
 * surface for the personal portfolio. Mirrors the cycle vocabulary
 * the practice already uses: projects, tasks, subtasks, with
 * status/assignee/phase/tier as first-class fields.
 *
 * SQLite via libSQL — works locally as a file (libsql:./roadmap.db)
 * and on Turso in production with the same client, no code changes.
 */

/** Projects in the personal portfolio. Tasks, Luminary Studio,
 *  and the wrapper project ("portfolio"). Multi-tenant projects have
 *  workspaceSlug set; legacy global projects leave it null.
 *
 *  Composite PK on (workspaceSlug, slug) — two tenants can each have
 *  a project named "blog" without collision. workspaceSlug is NOT NULL
 *  for all new rows; legacy null rows from the personal-portfolio era
 *  were backfilled to workspace "legacy" or deleted (see runbook). */
export const projects = sqliteTable(
  "projects",
  {
    /** Workspace this project belongs to. Part of composite PK. */
    workspaceSlug: text("workspace_slug").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    oneLiner: text("one_liner").notNull(),
    accent: text("accent").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    /** Public-share token. When set, `/r/[slug]?t=<token>` and
     *  `/api/[slug]/roadmap.ics?t=<token>` resolve. Token-only access
     *  unless `isPublic=true` (below) — closes the previous open-door
     *  default flagged in the security audit. */
    shareToken: text("share_token"),
    /** Explicit public-read flag. Defaults to true for the personal-
     *  portfolio context (everything is public anyway). Set false to
     *  require a token for share/iCal access. */
    isPublic: integer("is_public", { mode: "boolean" })
      .notNull()
      .default(true),
  },
  (t) => [
    primaryKey({ columns: [t.workspaceSlug, t.slug] }),
  ],
);

/**
 * Statuses follow the cycle vocabulary. Order matters for UI
 * grouping: in-flight first, then next, then shipped, refused at
 * the bottom (because what we won't do is part of the roadmap).
 */
export type Status =
  | "in-flight"
  | "next"
  | "shipped"
  | "refused"
  | "blocked";

/** Phases anchor every task to the 12-month plan. */
export type Phase = "A" | "B" | "C" | "D";

/** Tiers within a phase — must / should / nice. */
export type Tier = "1" | "2" | "3";

/**
 * Assignees. Two shapes:
 *   - "ethan" — human action required (purchasing, posting, outreach)
 *   - role personas (creative-director, senior-engineer, qa, pm,
 *     architect, tech-writer, researcher, program-manager) — agent
 *     shapes the work; Claude Code does the lifting under that role
 *   - "claude-code" — generic agent ownership when no specific
 *     persona fits
 */
export type AssigneeKind =
  | "ethan"
  | "creative-director"
  | "senior-engineer"
  | "qa"
  | "pm"
  | "architect"
  | "tech-writer"
  | "researcher"
  | "program-manager"
  | "claude-code";

/**
 * Roadmap kinds. The Tasks GTM roadmap, action-items, and blocker
 * shapes all collapse into this same tasks table; `kind` lets the
 * UI route them to the right surface (calendar row vs blocker card
 * vs checklist row).
 */
export type Kind =
  | "cycle"
  | "post"
  | "asset"
  | "press"
  | "paid"
  | "launch"
  | "kpi"
  | "milestone"
  | "action"
  | "blocker"
  | "refusal";

export type Priority = "P0" | "P1" | "P2";

/** Tasks are the unit of roadmap work. Project-scoped. */
export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    /** Project slug portion of the composite FK to projects(workspaceSlug, slug).
     *  Drizzle's .references() helper is single-column only; the cascade
     *  constraint is enforced at the query layer (all deletes go through
     *  deleteProject which cascades manually) and by the DB index. */
    projectSlug: text("project_slug").notNull(),
    /** Workspace slug. Together with projectSlug forms the logical FK to
     *  projects(workspaceSlug, slug). Denormalized for fast workspace-scoped
     *  queries without a join. */
    workspaceSlug: text("workspace_slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: text("status").$type<Status>().notNull().default("next"),
    phase: text("phase").$type<Phase>(),
    tier: text("tier").$type<Tier>(),
    assignee: text("assignee").$type<AssigneeKind>().notNull().default("claude-code"),
    cycleLabel: text("cycle_label"),
    targetDate: text("target_date"),
    sortOrder: integer("sort_order").notNull().default(0),

    /** Roadmap surface kind — drives which UI section renders this row. */
    kind: text("kind").$type<Kind>().notNull().default("cycle"),
    /** Display category (e.g. "Domain & DNS" for action items, "purchase"
     *  for blockers, "Week 1 · Foundation" for grouping). */
    category: text("category"),
    /** Priority for action-items (P0 / P1 / P2). */
    priority: text("priority").$type<Priority>(),
    /** When set, this task is gated by the referenced blocker row's id. */
    blockerId: text("blocker_id"),
    /** For blockers: count of items they gate ("affects N items"). */
    unblocks: integer("unblocks"),
    /** Week heading for GTM rows (e.g. "Week 1 · Foundation"). */
    weekHeading: text("week_heading"),
    /** Posting channel (X, Bluesky, HN, PH) for roadmap rows. */
    channel: text("channel"),
    /** Bolded launch beats from the GTM markdown. Drives the inline
     *  "launch" badge. */
    isLaunch: integer("is_launch", { mode: "boolean" })
      .notNull()
      .default(false),
    /** Day-of-week ("Mon", "Tue") for GTM calendar rows. */
    day: text("day"),
    /** Posting time ("9am", "3:01am PT"). */
    postingTime: text("posting_time"),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  (t) => [
    index("idx_tasks_project_status").on(t.projectSlug, t.status),
    index("idx_tasks_assignee").on(t.assignee),
    index("idx_tasks_phase").on(t.phase),
    index("idx_tasks_kind").on(t.kind),
    index("idx_tasks_blocker").on(t.blockerId),
    index("idx_tasks_workspace_project").on(t.workspaceSlug, t.projectSlug),
  ],
);

/**
 * Subtasks — checklist-style items under a parent task. Same shape
 * as tasks (status/assignee), but constrained to live under exactly
 * one parent task. One level of nesting only.
 */
export const subtasks = sqliteTable(
  "subtasks",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    /** Multi-tenancy: workspace this subtask belongs to. Denormalized
     *  for fast workspace-scoped queries without join. */
    workspaceSlug: text("workspace_slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").$type<Status>().notNull().default("next"),
    assignee: text("assignee").$type<AssigneeKind>().notNull().default("claude-code"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  (t) => [index("idx_subtasks_task").on(t.taskId)],
);

/**
 * Activity log — every status flip, assignee change, note addition.
 * Renders as the "what's happened recently" stream on the master
 * dashboard, and as a per-task timeline in the detail panel.
 */
export const activity = sqliteTable(
  "activity",
  {
    id: text("id").primaryKey(),
    /** Multi-tenancy: workspace this activity belongs to. */
    workspaceSlug: text("workspace_slug").notNull(),
    /** "task" or "subtask" — which entity changed. */
    entityKind: text("entity_kind").notNull(),
    entityId: text("entity_id").notNull(),
    /** Free-form action verb: "status-change", "assignee-change",
     *  "subtask-add", "subtask-toggle", "created", etc. */
    action: text("action").notNull(),
    /** JSON payload describing the change. Schema-light by design;
     *  the activity feed renders generic "X did Y to Z" copy. */
    payload: text("payload").notNull().default("{}"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("idx_activity_entity").on(t.entityKind, t.entityId)],
);

/**
 * Comments — flat thread per task. Anyone visiting the public site
 * can leave a comment (no auth, by design — the portfolio is fully
 * public). Author field is whatever the visitor types; defaults to
 * "Ethan" when authored from the editor surface.
 *
 * Immutable in v1 — no delete, no edit. If a comment turns out to
 * be wrong, leave a follow-up. The brand voice is "decisions are
 * legible if you can see the no's"; the same applies to the
 * conversation history.
 */
export const comments = sqliteTable(
  "comments",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    /** Multi-tenancy: workspace this comment belongs to. */
    workspaceSlug: text("workspace_slug").notNull(),
    body: text("body").notNull(),
    author: text("author").notNull().default("Ethan"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("idx_comments_task").on(t.taskId)],
);

/**
 * Workspaces — the multi-tenant unit of the Roadmap product.
 * Each workspace is owned by one Clerk user and contains N projects.
 * The portfolio's personal projects are NOT in workspaces (workspaceSlug=null
 * on their rows). New customer projects belong to a workspace.
 */
export const workspaces = sqliteTable(
  "workspaces",
  {
    slug: text("slug").primaryKey(),
    name: text("name").notNull(),
    /** Optional public subhead shown on the workspace hero. Falls back to
     *  "Where ${name} is going." when null. */
    description: text("description"),
    ownerUserId: text("owner_user_id").notNull(), // Clerk userId
    /** Display name of the workspace owner, surfaced on public guest views
     *  as "Shared by ${ownerName}". Captured from Clerk at workspace-
     *  creation time so the public render stays a single DB query — never
     *  a Clerk API call. Nullable: pre-Sprint-2 workspaces don't have it
     *  until the owner sets one (via a future settings cycle) or runs a
     *  backfill. When null, the public render just shows the last-updated
     *  line without an attribution. Sprint 2 cycle 10.2, 2026-05-12. */
    ownerName: text("owner_name"),
    /** Owner's email, surfaced on the shared update page as the reply-
     *  to address. Captured from Clerk at workspace-creation time
     *  alongside ownerName. The reply gesture is a mailto link — no
     *  Resend, no comment-thread infrastructure (locked refusal in
     *  PRODUCT.md). Nullable for pre-Sprint-2 workspaces; when null
     *  the invited-by bar omits the reply gesture entirely rather than
     *  faking it. Sprint 2 cycle 10.3, 2026-05-12. */
    ownerEmail: text("owner_email"),
    plan: text("plan")
      .$type<"free" | "pro" | "studio">()
      .notNull()
      .default("free"),
    /** Canonical workspace template id this workspace was created from
     *  (e.g. "wedding-planning-workspace"). Null = workspace created
     *  from scratch. Roadmap reads this on first visit to lazily seed
     *  projects and items from the canonical template slice. Strategy:
     *  studio/docs/TEMPLATES_STRATEGY.md (T-2.1). */
    templateId: text("template_id"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("idx_workspaces_owner").on(t.ownerUserId)],
);

/**
 * ProjectSources — raw markdown source for each project within a workspace.
 * Supports the "paste your markdown" onboarding flow: user supplies a .md
 * file, we parse it to tasks, and store the raw source for re-parsing.
 *
 * Composite PK on (projectSlug, workspaceSlug) — one source per project
 * per workspace. Parse errors are stored non-destructively so the user can
 * fix and re-submit.
 */
export const projectSources = sqliteTable(
  "project_sources",
  {
    projectSlug: text("project_slug").notNull(),
    workspaceSlug: text("workspace_slug").notNull(),
    rawMarkdown: text("raw_markdown").notNull(),
    lastParsedAt: integer("last_parsed_at", { mode: "timestamp" }),
    parseError: text("parse_error"),
  },
  (t) => [
    primaryKey({ columns: [t.projectSlug, t.workspaceSlug] }),
    index("idx_sources_workspace").on(t.workspaceSlug),
  ],
);

export type Project = typeof projects.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Subtask = typeof subtasks.$inferSelect;
export type Activity = typeof activity.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type ProjectSource = typeof projectSources.$inferSelect;
