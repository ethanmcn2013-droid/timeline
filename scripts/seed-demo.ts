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
import * as schema from "../src/server/db/schema";

const WORKSPACE_SLUG = "tasks";
const WORKSPACE_NAME = "Tasks · Product Roadmap";
const WORKSPACE_DESCRIPTION =
  "An example public roadmap, drawn from Tasks (the live task-workspace product). Plans, decisions, and changes written in plain English.";
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
    title: "Workspace onboarding — paste your markdown",
    description:
      "First-run experience for new workspaces. Paste a markdown roadmap, we parse it into structured items. Zero forms, zero dropdowns.",
    status: "in-flight" as schema.Status,
    kind: "cycle" as schema.Kind,
    targetDate: "2026-05-14",
    sortOrder: 1,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-002`,
    title: "Proof card on the marketing homepage",
    description:
      "A live screenshot of the demo workspace embedded in the homepage hero — so the product sells itself without a separate demo page. Blocked on screenshot infra.",
    status: "blocked" as schema.Status,
    kind: "cycle" as schema.Kind,
    targetDate: "2026-05-15",
    sortOrder: 2,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-003`,
    title: "Invite-only beta",
    description:
      "Gated signup behind an invite code. Small cohort, high-signal feedback. No public self-serve until the onboarding is solid.",
    status: "in-flight" as schema.Status,
    kind: "cycle" as schema.Kind,
    targetDate: "2026-05-18",
    sortOrder: 3,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-004`,
    title: "Comment threads on roadmap items",
    description:
      "Not shipping. Conversations belong in the work, not bolted onto a status page. Replying lands in your email — that's the channel.",
    status: "refused" as schema.Status,
    kind: "refusal" as schema.Kind,
    targetDate: null,
    sortOrder: 4,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-005`,
    title: "Composite-PK multi-tenancy",
    description:
      "Project slugs are now scoped per workspace — two teams can each have a project called \"blog\" without colliding. Schema migration shipped cleanly.",
    status: "shipped" as schema.Status,
    kind: "cycle" as schema.Kind,
    targetDate: "2026-05-08",
    completedAt: new Date("2026-05-08T09:00:00Z"),
    sortOrder: 5,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-006`,
    title: "studio. brand integration in nav + footer",
    description:
      "The studio. parent brand whisper is now in the nav and footer — links Tasks and Roadmap under one roof without making it a big deal.",
    status: "shipped" as schema.Status,
    kind: "cycle" as schema.Kind,
    targetDate: "2026-05-10",
    completedAt: new Date("2026-05-10T09:00:00Z"),
    sortOrder: 6,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-008`,
    title: "Public launch",
    description:
      "The day Signal Roadmap goes from invite-only beta to anyone-can-sign-up. The moment the rest of this is building toward.",
    status: "next" as schema.Status,
    kind: "milestone" as schema.Kind,
    targetDate: "2026-06-15",
    isLaunch: true,
    sortOrder: 8,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-009`,
    title: "First paying workspace",
    description:
      "First Pro-tier upgrade from a customer who isn't us. The earliest signal that Roadmap clears the bar of \"someone pays for it.\"",
    status: "next" as schema.Status,
    kind: "milestone" as schema.Kind,
    targetDate: "2026-07-01",
    isLaunch: true,
    sortOrder: 9,
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
    // onConflictDoNothing: never overwrite a live workspace's name/description
    // if the seed is accidentally run against prod. Items below keep their own
    // update semantics (re-seeding updates item content intentionally).
    .onConflictDoNothing();
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
        targetDate: "targetDate" in item ? item.targetDate : undefined,
        sortOrder: item.sortOrder,
        assignee: "claude-code",
        isLaunch: "isLaunch" in item ? item.isLaunch : false,
        completedAt: "completedAt" in item ? item.completedAt : undefined,
      })
      .onConflictDoUpdate({
        target: schema.tasks.id,
        set: {
          title: item.title,
          description: item.description,
          status: item.status,
          kind: item.kind,
          targetDate: "targetDate" in item ? item.targetDate : undefined,
          sortOrder: item.sortOrder,
          isLaunch: "isLaunch" in item ? item.isLaunch : false,
          completedAt: "completedAt" in item ? item.completedAt : undefined,
        },
      });
  }
  console.log(`  ${ITEMS.length} items upserted.`);

  console.log(`Done. Visit /${WORKSPACE_SLUG} or /${WORKSPACE_SLUG}/update to see the demo roadmap.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
