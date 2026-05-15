/**
 * seed-wedding.ts — Idempotent seed for the public wedding demo workspace.
 *
 * Why this exists: the canonical public demo must speak to the 80% who don't
 * work in tech (BRAND.md §2.1/§2.2). A software product-roadmap demo tells a
 * wedding planner "this is not for you". This workspace is a real wedding
 * plan — plain English, dated across eight months, three milestones with
 * distinct progress (one fully complete, so the "settled" payoff is visible),
 * statuses spread so the board / map / schedule each render at their best.
 *
 * Usage:
 *   pnpm tsx scripts/seed-wedding.ts                 (local file db)
 *   TURSO_DATABASE_URL=… TURSO_AUTH_TOKEN=… pnpm tsx scripts/seed-wedding.ts
 *
 * Safe to re-run — onConflictDoNothing for the workspace (never clobber a
 * live name), onConflictDoUpdate for items (re-seed refreshes content).
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../src/server/db/schema";

const WS = "the-wedding";
const WS_NAME = "Maya & Tom — Spring Wedding";
const WS_DESC =
  "Everything for the day, in one place the couple and every supplier can read. No jargon, no logins — just the plan.";
const PROJ = "plan";
const PROJ_NAME = "The plan";
const SEED_USER_ID = "seed-demo-user";

const url = process.env.TURSO_DATABASE_URL ?? "file:roadmap.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const db = drizzle(createClient({ url, authToken }), { schema });

type Seed = {
  n: string;
  title: string;
  description: string;
  status: schema.Status;
  kind: schema.Kind;
  targetDate: string | null;
  isLaunch?: boolean;
  done?: string; // completedAt ISO
  sort: number;
};

// A wedding ~four months out. Today is mid-May 2026.
const ITEMS: Seed[] = [
  {
    n: "001",
    title: "Book the venue and pay the deposit",
    description:
      "The barn at Hartwell is held for the date. Deposit paid, final-week walkthrough booked.",
    status: "shipped",
    kind: "cycle",
    targetDate: "2026-01-12",
    done: "2026-01-12T10:00:00Z",
    sort: 1,
  },
  {
    n: "002",
    title: "Agree the date and the guest list",
    description:
      "Saturday confirmed with both families. Guest list settled at roughly ninety, with a small evening-only group.",
    status: "shipped",
    kind: "cycle",
    targetDate: "2026-01-26",
    done: "2026-01-26T10:00:00Z",
    sort: 2,
  },
  {
    n: "003",
    title: "Send the save-the-dates",
    description:
      "Sent to every guest by post and message. Replies are tracked off this plan, not on it.",
    status: "shipped",
    kind: "cycle",
    targetDate: "2026-02-10",
    done: "2026-02-10T10:00:00Z",
    sort: 3,
  },
  {
    n: "M01",
    title: "Save-the-dates out",
    description:
      "The first real milestone — the date is public and the build-up begins.",
    status: "shipped",
    kind: "milestone",
    targetDate: "2026-02-14",
    done: "2026-02-14T10:00:00Z",
    sort: 4,
  },
  {
    n: "004",
    title: "Book the photographer",
    description:
      "Booked and deposit paid. Shot list and family-group plan to follow closer to the day.",
    status: "shipped",
    kind: "cycle",
    targetDate: "2026-03-09",
    done: "2026-03-09T10:00:00Z",
    sort: 5,
  },
  {
    n: "005",
    title: "Choose and confirm the caterer",
    description:
      "Tasting done, menu chosen. Waiting on the final quote with dietary notes before this is locked.",
    status: "in-flight",
    kind: "cycle",
    targetDate: "2026-05-22",
    sort: 6,
  },
  {
    n: "006",
    title: "Confirm final guest numbers",
    description:
      "Couple is chasing the last few replies. The venue needs the final count to set the room.",
    status: "in-flight",
    kind: "cycle",
    targetDate: "2026-06-12",
    sort: 7,
  },
  {
    n: "007",
    title: "Florist arrival time still not confirmed",
    description:
      "The florist hasn't confirmed a setup window. This is the one thing most likely to slip — it needs a call this week.",
    status: "blocked",
    kind: "cycle",
    targetDate: "2026-06-18",
    sort: 8,
  },
  {
    n: "M02",
    title: "Every supplier locked",
    description:
      "Photographer, caterer, florist, band — all confirmed with arrival times. After this, nothing major is open.",
    status: "next",
    kind: "milestone",
    targetDate: "2026-06-30",
    sort: 9,
  },
  {
    n: "008",
    title: "Order the cake",
    description:
      "Design agreed with the couple. Order goes in once the final guest number is set.",
    status: "next",
    kind: "cycle",
    targetDate: "2026-06-27",
    sort: 10,
  },
  {
    n: "009",
    title: "Send the invitations",
    description:
      "Printed and addressed. They go out eight weeks before the day with the reply card and directions.",
    status: "next",
    kind: "cycle",
    targetDate: "2026-07-18",
    sort: 11,
  },
  {
    n: "010",
    title: "Final dress fitting",
    description:
      "Last fitting and any alterations. Booked for the week the invitations land.",
    status: "next",
    kind: "cycle",
    targetDate: "2026-07-30",
    sort: 12,
  },
  {
    n: "011",
    title: "Share the day-of plan with every supplier",
    description:
      "A one-page run of the day: arrival windows, ceremony cue, meal service, band start. One link, everyone reads the same thing.",
    status: "next",
    kind: "cycle",
    targetDate: "2026-08-22",
    sort: 13,
  },
  {
    n: "012",
    title: "Confirm the wet-weather plan",
    description:
      "Indoor ceremony fallback agreed with the venue, plus a covered route for guests. Decided well before the day, not on it.",
    status: "next",
    kind: "cycle",
    targetDate: "2026-08-29",
    sort: 14,
  },
  {
    n: "013",
    title: "Rehearsal and rehearsal dinner",
    description:
      "Walk the ceremony with the officiant and the wedding party, then dinner with close family.",
    status: "next",
    kind: "cycle",
    targetDate: "2026-09-18",
    sort: 15,
  },
  {
    n: "M03",
    title: "The wedding day",
    description: "Everything in this plan has been building toward this.",
    status: "next",
    kind: "milestone",
    targetDate: "2026-09-19",
    isLaunch: true,
    sort: 16,
  },
  {
    n: "R01",
    title: "A live photo wall at the reception",
    description:
      "Decided against it. It pulls people onto their phones during the part of the day that's meant to be lived, not filmed.",
    status: "refused",
    kind: "refusal",
    targetDate: null,
    sort: 17,
  },
];

async function main() {
  console.log(`Seeding wedding demo "${WS}" → ${url}`);

  await db
    .insert(schema.workspaces)
    .values({
      slug: WS,
      name: WS_NAME,
      description: WS_DESC,
      ownerUserId: SEED_USER_ID,
      plan: "free",
    })
    .onConflictDoUpdate({
      target: schema.workspaces.slug,
      set: { name: WS_NAME, description: WS_DESC },
    });

  await db
    .insert(schema.projects)
    .values({
      workspaceSlug: WS,
      slug: PROJ,
      name: PROJ_NAME,
      oneLiner:
        "What's locked, what's moving, and what still needs a decision before the day.",
      accent: "#4f46e5",
      sortOrder: 0,
    })
    .onConflictDoUpdate({
      target: [schema.projects.workspaceSlug, schema.projects.slug],
      set: { name: PROJ_NAME },
    });

  for (const it of ITEMS) {
    const id = `${WS}-${PROJ}-${it.n}`;
    const values = {
      id,
      projectSlug: PROJ,
      workspaceSlug: WS,
      title: it.title,
      description: it.description,
      status: it.status,
      kind: it.kind,
      targetDate: it.targetDate ?? undefined,
      sortOrder: it.sort,
      assignee: "claude-code" as schema.AssigneeKind,
      isLaunch: it.isLaunch ?? false,
      completedAt: it.done ? new Date(it.done) : undefined,
    };
    await db
      .insert(schema.tasks)
      .values(values)
      .onConflictDoUpdate({ target: schema.tasks.id, set: values });
  }

  console.log(`  ${ITEMS.length} items upserted. Visit /${WS}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
