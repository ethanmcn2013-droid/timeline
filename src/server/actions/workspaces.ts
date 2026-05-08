"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth";
import {
  createWorkspace,
  createProject,
  getWorkspace,
  upsertProjectSource,
  upsertParsedItems,
  getProjectsForWorkspace,
  addComment,
} from "@/server/db/queries";
import { isValidSlug, slugify } from "@/lib/reserved-slugs";
import { parseMarkdown } from "@/server/parser/parse-markdown";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Workspace creation
// ---------------------------------------------------------------------------

export type CreateWorkspaceResult =
  | { ok: true }
  | { error: string };

export async function createWorkspaceAction(
  formData: FormData,
): Promise<CreateWorkspaceResult> {
  const userId = await requireUser();

  // Rate limit: 5 workspace creations per IP per hour
  const ip = getClientIp();
  const allowed = await checkRateLimit("create-workspace", ip, 5, 3600);
  if (!allowed) return { error: "Too many requests. Try again later." };

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const slug = (formData.get("slug") as string | null)?.trim() ?? "";

  if (!name) return { error: "Workspace name is required." };
  if (!slug) return { error: "Slug is required." };
  if (!isValidSlug(slug)) {
    return {
      error:
        "Slug must be 3–32 characters, lowercase letters, numbers, and hyphens only. No reserved words.",
    };
  }

  // Uniqueness check
  const existing = await getWorkspace(slug);
  if (existing) {
    return { error: "That slug is already taken. Try another." };
  }

  await createWorkspace({ slug, name, ownerUserId: userId });

  revalidatePath("/app");
  redirect("/app");
}

// ---------------------------------------------------------------------------
// Project creation
// ---------------------------------------------------------------------------

export type CreateProjectResult =
  | { ok: true; slug: string }
  | { error: string };

export async function createProjectAction(
  workspaceSlug: string,
  formData: FormData,
): Promise<CreateProjectResult> {
  const userId = await requireUser();

  // Verify user owns this workspace
  const workspace = await getWorkspace(workspaceSlug);
  if (!workspace || workspace.ownerUserId !== userId) {
    return { error: "Workspace not found." };
  }

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const rawSlug = (formData.get("slug") as string | null)?.trim() ?? "";
  const slug = rawSlug || slugify(name);

  if (!name) return { error: "Project name is required." };
  if (!isValidSlug(slug)) {
    return {
      error:
        "Slug must be 3–32 characters, lowercase letters, numbers, and hyphens only.",
    };
  }

  // Check slug uniqueness within workspace
  const projects = await getProjectsForWorkspace(workspaceSlug);
  if (projects.some((p) => p.slug === slug)) {
    return { error: "A project with that slug already exists in this workspace." };
  }

  await createProject({ slug, name, workspaceSlug });

  revalidatePath("/app");
  return { ok: true, slug };
}

// ---------------------------------------------------------------------------
// Markdown source upsert
// ---------------------------------------------------------------------------

export type SaveSourceResult =
  | { ok: true; count: number; lastParsedAt: string }
  | { error: string };

export async function saveProjectSourceAction(
  projectSlug: string,
  workspaceSlug: string,
  rawMarkdown: string,
): Promise<SaveSourceResult> {
  const userId = await requireUser();

  // Rate limit: 30 source saves per IP per 10 minutes (generous for iterating)
  const ip = getClientIp();
  const allowed = await checkRateLimit("save-source", ip, 30, 600);
  if (!allowed) return { error: "Too many requests. Try again in a few minutes." };

  // Verify ownership
  const workspace = await getWorkspace(workspaceSlug);
  if (!workspace || workspace.ownerUserId !== userId) {
    return { error: "Workspace not found." };
  }

  if (!rawMarkdown?.trim()) {
    return { error: "Nothing to save — paste some markdown first." };
  }

  // Parse markdown → roadmap items
  let parsed: ReturnType<typeof parseMarkdown>;
  try {
    parsed = parseMarkdown({ rawMarkdown, workspaceSlug, projectSlug });
  } catch (e) {
    // Parser shouldn't throw, but defense in depth
    await upsertProjectSource({
      projectSlug,
      workspaceSlug,
      rawMarkdown,
      parseError: String(e),
      lastParsedAt: null,
    });
    return { error: "Parse failed." };
  }

  if (parsed.parseError) {
    await upsertProjectSource({
      projectSlug,
      workspaceSlug,
      rawMarkdown,
      parseError: parsed.parseError,
      lastParsedAt: null,
    });
    return { error: `Parse error: ${parsed.parseError}` };
  }

  // Upsert items (parser status wins — markdown is source of truth)
  await upsertParsedItems(parsed.items);

  // Persist source with parse metadata
  const lastParsedAt = new Date();
  await upsertProjectSource({
    projectSlug,
    workspaceSlug,
    rawMarkdown,
    parseError: null,
    lastParsedAt,
  });

  revalidatePath(`/app/source/${projectSlug}`);
  return { ok: true, count: parsed.items.length, lastParsedAt: lastParsedAt.toISOString() };
}

// ---------------------------------------------------------------------------
// Comment creation — auth-gated
// ---------------------------------------------------------------------------

export type AddCommentResult =
  | { ok: true }
  | { error: string };

export async function addCommentAction(
  taskId: string,
  workspaceSlug: string,
  body: string,
): Promise<AddCommentResult> {
  // Auth gate — throws/redirects if not signed in
  await requireUser();

  // Rate limit: 20 comments per IP per 10 minutes
  const ip = getClientIp();
  const allowed = await checkRateLimit("add-comment", ip, 20, 600);
  if (!allowed) return { error: "Too many requests. Try again in a few minutes." };

  const trimmed = body?.trim();
  if (!trimmed) return { error: "Comment body cannot be empty." };
  if (trimmed.length > 2000) return { error: "Comment is too long (max 2000 chars)." };

  await addComment({ taskId, workspaceSlug, body: trimmed });

  revalidatePath(`/`);
  return { ok: true };
}
