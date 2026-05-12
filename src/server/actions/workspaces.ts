"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { requireUser } from "@/server/auth";
import {
  createWorkspace,
  createProject,
  getWorkspace,
  upsertProjectSource,
  upsertParsedItems,
  getProjectsForWorkspace,
  seedWorkspaceFromTemplate,
} from "@/server/db/queries";
import { isValidSlug, slugify } from "@/lib/reserved-slugs";
import { parseMarkdown } from "@/server/parser/parse-markdown";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getSyncedTemplateRoadmap } from "@/lib/templates.generated";

/**
 * Pull the user's display name + primary email from Clerk for
 * attribution + reply gesture on the public guest view (Sprint 2
 * cycles 10.2 + 10.3). Best-effort: any failure returns nulls so
 * workspace creation never blocks on Clerk.
 *
 * Cached together because both come from the same Clerk.users.getUser
 * call. Owner email powers the mailto reply on /[workspaceSlug]/update.
 */
async function resolveOwnerIdentity(
  userId: string,
): Promise<{ name: string | null; email: string | null }> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress ?? null;
    const full = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (full) return { name: full, email };
    if (user.username) return { name: user.username, email };
    if (email) return { name: email.split("@")[0], email };
    return { name: null, email };
  } catch {
    return { name: null, email: null };
  }
}

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
  const fromTemplate =
    (formData.get("fromTemplate") as string | null)?.trim() || null;

  if (!name) return { error: "Workspace name is required." };
  if (!slug) return { error: "Slug is required." };
  if (!isValidSlug(slug)) {
    return {
      error:
        "Slug must be 3–32 characters, lowercase letters, numbers, and hyphens only. No reserved words.",
    };
  }

  // Resolve template up front so we don't create a workspace then fail
  // on the seed step.
  const template = fromTemplate ? getSyncedTemplateRoadmap(fromTemplate) : null;
  if (fromTemplate && !template) {
    return { error: `Unknown template id: ${fromTemplate}` };
  }

  // Uniqueness check
  const existing = await getWorkspace(slug);
  if (existing) {
    return { error: "That slug is already taken. Try another." };
  }

  const owner = await resolveOwnerIdentity(userId);

  await createWorkspace({
    slug,
    name,
    ownerUserId: userId,
    ownerName: owner.name,
    ownerEmail: owner.email,
    templateId: template?.id ?? null,
  });

  if (template) {
    await seedWorkspaceFromTemplate({ workspaceSlug: slug, template });
  }

  revalidatePath("/app");
  redirect(template ? `/${slug}` : "/app");
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
// Comments removed 2026-05-12 — Suite Review T3 decision. The locked
// refusal on comment threading is now honored at the architecture layer,
// not just at the render gate. Schema column `comments` is preserved
// against any existing owner-side data; the query (getCommentsForTask)
// and the queries-layer addComment helper were also removed. Anything
// reaching for an owner-only annotation surface should ship a private
// description field on the task, not a panel.
