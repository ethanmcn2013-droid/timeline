import "server-only";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

/**
 * Operator log-cycle endpoint (2026-07-17).
 *
 * The shared roadmap Turso credentials are sensitive-only in Vercel, so
 * the tasks/notes/signal repos' local `log-cycle` scripts cannot run
 * without the founder's keys. This route performs the identical insert
 * inside the deployed Timeline app, which holds TURSO_DATABASE_URL /
 * TURSO_AUTH_TOKEN at runtime. Logic mirrors tasks/scripts/log-cycle.ts
 * exactly (idempotent portfolio workspace, collision-safe id, cycle task
 * row + activity row).
 *
 *   curl -X POST https://timeline.signalstudio.ie/api/internal/log-cycle \
 *        -H "Authorization: Bearer $TIMELINE_OPS_SECRET" \
 *        -H "Content-Type: application/json" \
 *        -d '{"project":"tasks","cycle":93,"title":"…","date":"2026-07-17","description":"…"}'
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PORTFOLIO_WORKSPACE_SLUG = "portfolio";
const STATUSES = new Set(["shipped", "in-flight", "next", "blocked", "refused"]);

function authOk(req: Request): boolean {
  const expected = process.env.TIMELINE_OPS_SECRET;
  if (!expected) return false;
  const presented = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!authOk(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: {
    project?: string;
    cycle?: number;
    title?: string;
    date?: string;
    status?: string;
    description?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { project, title, date } = body;
  const cycle = body.cycle;
  const status = body.status ?? "shipped";
  if (
    !project ||
    typeof project !== "string" ||
    typeof cycle !== "number" ||
    !Number.isInteger(cycle) ||
    !title ||
    typeof title !== "string" ||
    !date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(String(date)) ||
    !STATUSES.has(status)
  ) {
    return NextResponse.json(
      { error: "project, integer cycle, title, YYYY-MM-DD date required" },
      { status: 400 },
    );
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    return NextResponse.json({ error: "TURSO_DATABASE_URL unset" }, { status: 500 });
  }

  try {
    const db = createClient({ url, authToken });
    const portfolioOwnerId = process.env.PORTFOLIO_OWNER_USER_ID ?? "portfolio";
    await db.execute({
      sql: `INSERT OR IGNORE INTO workspaces
              (slug, name, owner_user_id, plan, created_at, updated_at)
            VALUES (?, 'Portfolio', ?, 'free', unixepoch(), unixepoch())`,
      args: [PORTFOLIO_WORKSPACE_SLUG, portfolioOwnerId],
    });

    const baseId = `${project}-c${cycle}`;
    let id = baseId;
    let suffix = 2;
    for (;;) {
      const existing = await db.execute({
        sql: `SELECT id FROM tasks WHERE id = ? LIMIT 1`,
        args: [id],
      });
      if (existing.rows.length === 0) break;
      id = `${baseId}-${suffix}`;
      suffix++;
    }

    const cycleLabel = `Cycle ${cycle}`;
    const nowMs = Date.now();
    const completedAt = status === "shipped" ? nowMs : null;

    await db.execute({
      sql: `INSERT INTO tasks (
              id, project_slug, workspace_slug, title, description, status,
              kind, cycle_label, target_date, sort_order, assignee, is_launch,
              created_at, updated_at, completed_at
            )
            VALUES (?, ?, ?, ?, ?, ?, 'cycle', ?, ?, ?, 'claude-code', 0, ?, ?, ?)`,
      args: [
        id,
        project,
        PORTFOLIO_WORKSPACE_SLUG,
        `${cycleLabel} — ${title}`,
        body.description ?? title,
        status,
        cycleLabel,
        date,
        cycle * 10,
        nowMs,
        nowMs,
        completedAt,
      ],
    });

    await db.execute({
      sql: `INSERT INTO activity (
              id, workspace_slug, entity_kind, entity_id, action, payload, created_at
            )
            VALUES (?, ?, 'task', ?, 'cycle-logged', ?, ?)`,
      args: [
        `act-${id}-${nowMs}`,
        PORTFOLIO_WORKSPACE_SLUG,
        id,
        JSON.stringify({ cycleLabel, status, date }),
        nowMs,
      ],
    });

    return NextResponse.json({ ok: true, id, cycleLabel, status, date });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}
