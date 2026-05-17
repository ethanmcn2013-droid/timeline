/**
 * Clerk middleware for Signal Roadmap.
 *
 * Two jobs:
 * 1. Protect /app/* routes — unauthenticated users get redirected to /sign-in.
 * 2. Redirect authenticated users away from /sign-in → /app, so a logged-in
 *    user navigating into Roadmap never sees the auth gate (R5 fix).
 *
 * Public routes (no auth required): everything else — marketing, public viewer
 * [workspaceSlug]/[projectSlug], demo, pricing, about, changelog.
 *
 * Clerk v7 API: clerkMiddleware + createRouteMatcher.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAppRoute = createRouteMatcher(["/app(.*)"]);
const isSignInRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Protect /app/* — unauthenticated users get sent to sign-in
  if (isAppRoute(req) && !userId) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // R5 fix: authenticated users navigating to /sign-in or /sign-up
  // are bounced directly to /app — they should never see the auth gate.
  if (isSignInRoute(req) && userId) {
    const appUrl = new URL("/app", req.url);
    return NextResponse.redirect(appUrl);
  }

  return NextResponse.next();
});

export const config = {
  /*
   * Match all routes EXCEPT:
   * - _next/static  (Next.js static assets)
   * - _next/image   (image optimisation)
   * - favicon.ico   (browser icon request)
   * - api/          (API routes handle their own auth)
   *
   * Public roadmap viewer paths ([workspaceSlug]/[projectSlug]) are
   * not protected — public access is the core Roadmap product proposition.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
