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
  "/:workspaceSlug/refusals",
  "/:workspaceSlug/:projectSlug",
  "/:workspaceSlug/:projectSlug/:id",
]);

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
);

export default clerkMiddleware(async (auth, req) => {
  if (!clerkConfigured) return;
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
