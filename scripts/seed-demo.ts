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
const WORKSPACE_NAME = "studio. shipping log";
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
    title: "Workspace onboarding — paste your markdown",
    description:
      "First-run experience for new workspaces. Paste a markdown roadmap, we parse it into structured items. Zero forms, zero dropdowns.",
    status: "in-flight" as schema.Status,
    kind: "cycle" as schema.Kind,
    sortOrder: 1,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-002`,
    title: "Proof card on the marketing homepage",
    description:
      "A live screenshot of the demo workspace embedded in the homepage hero — so the product sells itself without a separate demo page. Blocked on screenshot infra.",
    status: "blocked" as schema.Status,
    kind: "cycle" as schema.Kind,
    sortOrder: 2,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-003`,
    title: "Invite-only beta",
    description:
      "Gated signup behind an invite code. Small cohort, high-signal feedback. No public self-serve until the onboarding is solid.",
    status: "in-flight" as schema.Status,
    kind: "cycle" as schema.Kind,
    sortOrder: 3,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-004`,
    title: "Shared comment threads on roadmap items",
    description:
      "Stakeholders can leave comments on individual roadmap items. Auth-gated for writes; public for reads. Keeps the conversation in context.",
    status: "in-flight" as schema.Status,
    kind: "cycle" as schema.Kind,
    sortOrder: 4,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-005`,
    title: "Composite-PK multi-tenancy",
    description:
      "Project slugs are now scoped per workspace — two teams can each have a project called \"blog\" without colliding. Schema migration shipped cleanly.",
    status: "shipped" as schema.Status,
    kind: "cycle" as schema.Kind,
    sortOrder: 5,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-006`,
    title: "studio. brand integration in nav + footer",
    description:
      "The studio. parent brand whisper is now in the nav and footer — links Tasks and Roadmap under one roof without making it a big deal.",
    status: "shipped" as schema.Status,
    kind: "cycle" as schema.Kind,
    sortOrder: 6,
  },
  {
    id: `${WORKSPACE_SLUG}-${PROJECT_SLUG}-007`,
    title: "AI-generated roadmap items",
    description:
      "Not this year. The product's value is structured clarity, not generated content. If we ship AI suggestions before the manual workflow is proven, we're solving the wrong problem.",
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
