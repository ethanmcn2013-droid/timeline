import "server-only";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkspacesForUser } from "@/server/db/queries";
import type { Workspace } from "@/server/db/schema";
import { isDemoMode } from "@/lib/access-mode";
import { DEMO_USER_ID, demoWorkspace } from "@/lib/roadmap/demo-data";

/**
 * Auth resolution for the Roadmap product.
 *
 * Graceful dev bypass: when Clerk env keys are unset the layer
 * returns null so the app still renders (albeit ungated). Every
 * protected surface checks the return value and renders the
 * unauthenticated state — no hard crash.
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
): Promise<Workspace | null> {
  if (isDemoMode()) return demoWorkspace;
  const workspaces = await getWorkspacesForUser(userId);
  return workspaces[0] ?? null;
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
      // Clerk env vars dropped in prod — fail closed. Never serve /app/*
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
