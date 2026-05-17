import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Next.js 16 renamed middleware → proxy. File lives at src/proxy.ts
 * and the exported function must be named `proxy` (or default export).
 *
 * Public surface: marketing pages + sign-in/sign-up + webhooks.
 * Everything under /app requires a real Clerk session.
 *
 * Graceful dev bypass: when Clerk env keys are unset the handler
 * returns early so the app runs before keys are provisioned. The
 * /app surfaces call requireUser() themselves and render accordingly.
 */

import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/pricing",
  "/demo",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/opengraph-image",
  "/opengraph-image/(.*)",
  "/manifest.webmanifest",
  // Public workspace roadmap surface — readable by anyone
  "/:workspaceSlug",
  "/:workspaceSlug/update",
  "/:workspaceSlug/refusals",
  "/:workspaceSlug/:projectSlug",
  "/:workspaceSlug/:projectSlug/:id",
]);

// R5 fix: authenticated users navigating to /sign-in or /sign-up are
// redirected directly to /app — they must never see the auth gate.
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
);

export default clerkMiddleware(async (auth, req) => {
  if (!clerkConfigured) return;

  const { userId } = await auth();

  // R5: bounce authenticated users away from sign-in/sign-up back to app
  if (isAuthRoute(req) && userId) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  if (!isPublicRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: new URL("/sign-in", req.url).toString(),
    });
  }
});

export const config = {
  matcher: [
    // Skip Next internals + static assets.
    "/((?!_next|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ttf|eot|ico|css|js)$).*)",
    "/(api|trpc)(.*)",
  ],
};
