/**
 * seed-demo.ts — Idempotent seed for the "tasks" demo workspace.
 *
 * Usage (local):
 *   pnpm seed:demo
 *
 * Usage (against production Turso):
 *   TURSO_DATABASE_URL=<url> TURSO_AUTH_TOKEN=<token> pnpm seed:demo
 *
 * What it creates:
 *   - workspace: slug="tasks", name="Tasks", description="What we're building next, written in plain English."
 *   - 1 project: slug="product", name="Product Roadmap"
 *   - 7 roadmap items derived from Tasks' actual changelog/roadmap
 *
 * Safe to re-run — uses INSERT OR IGNORE / onConflictDoNothing.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import * as schema from "../src/server/db/schema";

const WORKSPACE_SLUG = "tasks";
const WORKSPACE_NAME = "Tasks";
const WORKSPACE_DESCRIPTION =
  "What we're building next, written in plain English.";
const PROJECT_SLUG = "product";
const PROJECT_NAME = "Product Roadmap";

// Seed user — a dedicated demo owner so the workspace doesn't need a
// real Clerk user attached (public roadmap surface is auth-free for reads).
const SEED_USER_ID = "seed-demo-user";

const url = process.env.TURSO_DATABASE_URL ?? "file:roadmap.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

// ---------------------------------------------------------------------------
// Seed data — representative slice of Tasks' actual roadmap
// Derived from CHANGELOG.md cycles 34-38 and the /roadmap page items.
// ---------------------------------------------------------------------------

const ITEMS = [
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-001`,
    title: "Realtime sync across tabs",
    description:
      "Board, list, timeline, and calendar all reflect changes instantly — no page refresh needed. Built on server-sent events.",
    status: "shipped" as schema.Status,
    kind: "cycle" as schema.Kind,
    sortOrder: 1,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-002`,
    title: "Magic link sign-in",
    description:
      "Passwordless auth via Clerk magic links. One email, one click, straight into the workspace.",
    status: "shipped" as schema.Status,
    kind: "cycle" as schema.Kind,
    sortOrder: 2,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-003`,
    title: "Calendar ICS feed",
    description:
      "Subscribe to any workspace in Apple Calendar, Google Calendar, or Outlook. Tasks with due dates appear automatically.",
    status: "shipped" as schema.Status,
    kind: "cycle" as schema.Kind,
    sortOrder: 3,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-004`,
    title: "Public roadmap surface",
    description:
      "Share a public URL for your roadmap — no login required for readers. Shows what you're building, what shipped, and what you said no to.",
    status: "shipped" as schema.Status,
    kind: "cycle" as schema.Kind,
    sortOrder: 4,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-005`,
    title: "Cinematic demo mode",
    description:
      "Auto-running showcase that walks visitors through every view — board, list, timeline, calendar — with a live task being created and moved.",
    status: "in-flight" as schema.Status,
    kind: "cycle" as schema.Kind,
    sortOrder: 5,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-006`,
    title: "Mobile app",
    description:
      "Native iOS + Android. Blocked by: the web product needs to ship and find product-market fit first. Building mobile before we know what matters would be expensive guessing.",
    status: "refused" as schema.Status,
    kind: "refusal" as schema.Kind,
    sortOrder: 6,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-007`,
    title: "AI task suggestions",
    description:
      "Refused: not in year one. Tasks is for non-tech teams who want clarity, not automation. AI suggestions risk making the product feel like every other productivity app.",
    status: "refused" as schema.Status,
    kind: "refusal" as schema.Kind,
    sortOrder: 7,
  },
] as const;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Seeding demo workspace "${WORKSPACE_SLUG}"…`);
  console.log(`  DB: ${url}`);

  // 1. Upsert workspace
  await db
    .insert(schema.workspaces)
    .values({
      slug: WORKSPACE_SLUG,
      name: WORKSPACE_NAME,
      description: WORKSPACE_DESCRIPTION,
      ownerUserId: SEED_USER_ID,
      plan: "free",
    })
    .onConflictDoUpdate({
      target: schema.workspaces.slug,
      set: {
        name: WORKSPACE_NAME,
        description: WORKSPACE_DESCRIPTION,
        updatedAt: sql`(unixepoch())`,
      },
    });
  console.log(`  workspace "${WORKSPACE_SLUG}" upserted.`);

  // 2. Upsert project
  await db
    .insert(schema.projects)
    .values({
      workspaceSlug: WORKSPACE_SLUG,
      slug: PROJECT_SLUG,
      name: PROJECT_NAME,
      oneLiner: "What we're building — and what we said no to.",
      accent: "#4f46e5",
      sortOrder: 0,
      isPublic: true,
    })
    .onConflictDoUpdate({
      target: [schema.projects.workspaceSlug, schema.projects.slug],
      set: {
        name: PROJECT_NAME,
      },
    });
  console.log(`  project "${PROJECT_SLUG}" upserted.`);

  // 3. Upsert tasks
  for (const item of ITEMS) {
    await db
      .insert(schema.tasks)
      .values({
        id: item.id,
        projectSlug: PROJECT_SLUG,
        workspaceSlug: WORKSPACE_SLUG,
        title: item.title,
        description: item.description,
        status: item.status,
        kind: item.kind,
        sortOrder: item.sortOrder,
        assignee: "claude-code",
        isLaunch: false,
      })
      .onConflictDoUpdate({
        target: schema.tasks.id,
        set: {
          title: item.title,
          description: item.description,
          status: item.status,
          kind: item.kind,
          sortOrder: item.sortOrder,
        },
      });
  }
  console.log(`  ${ITEMS.length} items upserted.`);

  console.log(`Done. Visit /${WORKSPACE_SLUG} to see the demo roadmap.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
