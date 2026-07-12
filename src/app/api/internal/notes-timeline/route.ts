import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getWorkspaceForSuiteIdForUser } from "@/server/db/queries";
import { getCurrentTasksWorkspaceContext } from "@/server/sync/tasks-workspace-context";
import { createNotesAudiencePublication } from "@/server/audience-timeline";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { TIMELINE_URL } from "@/lib/product-urls";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const seenJtis = new Map<string, number>();

type Claims = {
  v?: number;
  iss?: string;
  aud?: string;
  sub?: string;
  workspaceId?: string;
  noteId?: string;
  iat?: number;
  exp?: number;
  jti?: string;
};

function response(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
    },
  });
}

function cleanText(value: unknown, field: string, max: number): string {
  if (typeof value !== "string") throw new TypeError(`${field} is required`);
  const result = value.trim();
  if (!result || result.length > max) throw new TypeError(`${field} is invalid`);
  return result;
}

function cleanDate(value: unknown): string {
  const date = cleanText(value, "date", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new TypeError("date is invalid");
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new TypeError("date is invalid");
  }
  return date;
}

function verifyAssertion(value: string, secret: string): Claims {
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) throw new Error("invalid assertion");
  const expected = createHmac("sha256", secret).update(encoded).digest();
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(expected, received)) {
    throw new Error("invalid assertion");
  }
  const claims = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Claims;
  const now = Math.floor(Date.now() / 1000);
  if (
    claims.v !== 1 ||
    claims.iss !== "signal-notes" ||
    claims.aud !== "signal-timeline.note-projection" ||
    typeof claims.sub !== "string" ||
    typeof claims.workspaceId !== "string" ||
    typeof claims.noteId !== "string" ||
    typeof claims.iat !== "number" ||
    typeof claims.exp !== "number" ||
    typeof claims.jti !== "string" ||
    claims.exp <= now ||
    claims.iat > now + 30 ||
    claims.exp - claims.iat > 120
  ) {
    throw new Error("invalid assertion");
  }
  for (const [jti, expiry] of seenJtis) {
    if (expiry <= now) seenJtis.delete(jti);
  }
  if (seenJtis.has(claims.jti)) throw new Error("replayed assertion");
  seenJtis.set(claims.jti, claims.exp);
  return claims;
}

function validateCommand(value: unknown): {
  workspaceId: string;
  sourceNoteId: string;
  title: string;
  date: string;
  completion: number;
  audienceLabel: string;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("invalid command");
  }
  const raw = value as Record<string, unknown>;
  const topKeys = Object.keys(raw).sort().join(",");
  if (topKeys !== "audience,projection,source,version,workspaceId") {
    throw new TypeError("invalid command shape");
  }
  if (raw.version !== 1 || !raw.source || !raw.projection || !raw.audience) {
    throw new TypeError("invalid command version");
  }
  const source = raw.source as Record<string, unknown>;
  const projection = raw.projection as Record<string, unknown>;
  const audience = raw.audience as Record<string, unknown>;
  if (Object.keys(source).sort().join(",") !== "noteId,product" || source.product !== "notes") {
    throw new TypeError("invalid source");
  }
  if (Object.keys(projection).sort().join(",") !== "completion,date,title") {
    throw new TypeError("invalid projection");
  }
  if (Object.keys(audience).sort().join(",") !== "kind,label" || audience.kind !== "named") {
    throw new TypeError("invalid audience");
  }
  if (!Number.isInteger(projection.completion) || Number(projection.completion) < 0 || Number(projection.completion) > 100) {
    throw new TypeError("completion is invalid");
  }
  return {
    workspaceId: cleanText(raw.workspaceId, "workspaceId", 128),
    sourceNoteId: cleanText(source.noteId, "noteId", 128),
    title: cleanText(projection.title, "title", 180),
    date: cleanDate(projection.date),
    completion: Number(projection.completion),
    audienceLabel: cleanText(audience.label, "audience label", 80),
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.NOTES_TO_TIMELINE_SECRET?.trim();
  if (!secret) return response({ error: "unavailable" }, 503);

  const rate = await checkRateLimit("notes-timeline-receiver", await getClientIp(), 20, 60);
  if (!rate.allowed) return response({ error: "rate_limited" }, 429);

  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return response({ error: "unauthorized" }, 401);

  let claims: Claims;
  let command: ReturnType<typeof validateCommand>;
  try {
    claims = verifyAssertion(authorization.slice(7).trim(), secret);
    command = validateCommand(await request.json());
  } catch {
    return response({ error: "unauthorized" }, 401);
  }
  if (claims.workspaceId !== command.workspaceId || claims.noteId !== command.sourceNoteId) {
    return response({ error: "unauthorized" }, 401);
  }

  const currentTasks = await getCurrentTasksWorkspaceContext(claims.sub!, command.workspaceId);
  if (!currentTasks || currentTasks.workspaceId !== command.workspaceId) {
    return response({ error: "workspace_unavailable" }, 403);
  }
  const workspace = await getWorkspaceForSuiteIdForUser(command.workspaceId, claims.sub!);
  if (!workspace) return response({ error: "workspace_unavailable" }, 403);

  try {
    const result = await createNotesAudiencePublication({
      ownerUserId: claims.sub!,
      workspaceSlug: workspace.slug,
      sourceTasksWorkspaceId: command.workspaceId,
      sourceNoteId: command.sourceNoteId,
      title: command.title,
      date: command.date,
      completion: command.completion,
      audienceLabel: command.audienceLabel,
    });
    const base = (process.env.NEXT_PUBLIC_SITE_URL ?? TIMELINE_URL).replace(/\/$/, "");
    return response({
      publicationId: result.publicationId,
      url: `${base}/s/${result.rawToken}`,
    });
  } catch (error) {
    return response(
      { error: error instanceof TypeError ? error.message : "publication_failed" },
      error instanceof TypeError ? 409 : 500,
    );
  }
}
