import "server-only";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getWorkspaceForSuiteIdForUser,
  getWorkspacesForUser,
} from "@/server/db/queries";
import { getCurrentTasksWorkspaceContext } from "@/server/sync/tasks-workspace-context";
import type { Workspace } from "@/server/db/schema";
import { isDemoMode } from "@/lib/access-mode";
import { DEMO_USER_ID, demoWorkspace } from "@/lib/roadmap/demo-data";

/**
 * Auth resolution for the Roadmap product.
 *
 * Graceful dev bypass: when Clerk env keys are unset the layer
 * returns null so the app still renders (albeit ungated). Every
 * protected surface checks the return value and renders the
 * unauthenticated state, no hard crash.
 *
 * Production: Clerk userId is the tenant anchor. Every query
 * downstream MUST filter by workspaceSlug; this module supplies
 * the workspace to make that easy.
 */

function clerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
  );
}

/**
 * Returns the current Clerk userId, or null if unauthenticated /
 * Clerk not configured.
 */
export async function getCurrentUser(): Promise<{ userId: string } | null> {
  if (isDemoMode()) return { userId: DEMO_USER_ID };
  if (!clerkConfigured()) return null;

  try {
    const { userId } = await auth();
    if (!userId) return null;
    return { userId };
  } catch {
    return null;
  }
}

/**
 * Returns the first workspace owned by the current user, or null
 * if they have none yet. Used to decide whether to show the
 * create-workspace flow or the dashboard.
 */
export async function getCurrentWorkspace(
  userId: string,
  requestedSuiteWorkspaceId?: string,
): Promise<Workspace | null> {
  if (isDemoMode()) return demoWorkspace;
  if (requestedSuiteWorkspaceId) {
    const [localWorkspace, currentMembership] = await Promise.all([
      getWorkspaceForSuiteIdForUser(requestedSuiteWorkspaceId, userId),
      getCurrentTasksWorkspaceContext(userId, requestedSuiteWorkspaceId),
    ]);
    // No first-workspace fallback: a requested canonical context that cannot
    // be mapped and reauthorized is rejected.
    if (!localWorkspace || !currentMembership) return null;
    return localWorkspace;
  }
  const workspaces = await getWorkspacesForUser(userId);
  return workspaces[0] ?? null;
}

export type ResolvedTimelineContext = Readonly<{
  workspace: Workspace;
  workspaceId: string;
  planningPeriodId: string | null;
}>;

export async function resolveTimelineContext(
  userId: string,
  requestedWorkspaceId: string,
  requestedPlanningPeriodId?: string,
): Promise<ResolvedTimelineContext | null> {
  // Demo/review is a self-contained fixture boundary. Context query params
  // may still be present in copied suite links, but they must never open the
  // Tasks or Timeline databases. Only the canonical fixture slug is valid and
  // the fixture intentionally has no Planning Period identity.
  if (isDemoMode()) {
    if (
      requestedWorkspaceId.trim() !== demoWorkspace.slug ||
      requestedPlanningPeriodId?.trim()
    ) {
      return null;
    }
    return {
      workspace: demoWorkspace,
      workspaceId: demoWorkspace.slug,
      planningPeriodId: null,
    };
  }

  const [workspace, current] = await Promise.all([
    getWorkspaceForSuiteIdForUser(requestedWorkspaceId, userId),
    getCurrentTasksWorkspaceContext(userId, requestedWorkspaceId),
  ]);
  if (!workspace || !current) return null;
  if (
    requestedPlanningPeriodId &&
    current.planningPeriodId !== requestedPlanningPeriodId
  ) {
    return null;
  }
  return {
    workspace,
    workspaceId: current.workspaceId,
    planningPeriodId: current.planningPeriodId,
  };
}

/**
 * Hard guard: redirects to /sign-in if there is no authenticated
 * user. Returns the userId so callers don't need to re-check.
 * Use at the top of any /app/* server component loader.
 */
export async function requireUser(): Promise<string> {
  // Demo/Review: resolve to the synthetic demo user; the data layer serves
  // the in-memory demo workspace, so no real DB read occurs.
  if (isDemoMode()) return DEMO_USER_ID;

  if (!clerkConfigured()) {
    if (process.env.NODE_ENV === "production") {
      // Clerk env vars dropped in prod, fail closed. Never serve /app/*
      // as authenticated without real credentials.
      redirect("/sign-in");
    }
    // Dev mode: return a stub userId so the UI still renders.
    return "dev-user";
  }

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user.userId;
}
