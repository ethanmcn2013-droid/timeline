import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Next.js 16 renamed middleware → proxy. File lives at src/proxy.ts
 * and the exported function must be named `proxy` (or default export).
 *
 * Layer 2 — Seamless Ecosystem (2026-05-18)
 * ==========================================
 * Route categories per LAYER0_ROUTE_ALLOWLIST.md §roadmap:
 *
 *   M (Marketing)  — authed user → 307 to /app. Explicit allowlist only.
 *   C (Content)    — NEVER redirected; reachable by everyone logged-in or not.
 *                    This is the no-auth promise that makes shared roadmap
 *                    links work. Getting this wrong detonates Roadmap's pitch.
 *   A (App)        — authed destination; never redirected.
 *   X (Excluded)   — infra; never touched.
 *
 * The M-allowlist is EXACT. Anything not on it passes through untouched.
 * We NEVER use a "any route not in M is public" heuristic — that heuristic
 * eats /{workspaceSlug}/* routes (category C) and breaks the no-auth promise.
 *
 * Escape hatch (DESIGN.md §14 canonical): the owner can activate
 * "View public site" to suppress the M→app redirect for that tab.
 * Mechanism: a short-lived cookie `signal_preview_public=1` (max-age 86400,
 * SameSite=Strict) set client-side, read here in the middleware.
 * A `?preview=public` query param is also accepted as an alternative entry
 * point (useful for screen-recording handoffs). Cookie name and param are
 * suite-wide canonical — do NOT use repo-local names.
 */

import { NextResponse } from "next/server";

// Exact M-route list. Only these routes redirect authed users to /app.
// /{workspaceSlug}/... is intentionally NOT here (it's category C).
const isMarketingRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/about",
  "/demo",
  "/changelog",
]);

// A (App) routes — already the authed destination, never redirected.
// Listed for documentation; the middleware default pass-through handles these.

// X (Excluded infra) — never redirect:
//   /api/*, /og/*, /sign-in/*, /sign-up/*, /sitemap.xml, /robots.txt,
//   /manifest.webmanifest, badge.svg, calendar.ics, /print/*
// These are handled by the default pass-through below.

// All /{workspaceSlug}/* routes (C category) fall through untouched because
// they are not in isMarketingRoute. This is the architectural guarantee.

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
);

export default clerkMiddleware(async (auth, req) => {
  if (!clerkConfigured) return;

  const { userId } = await auth();

  // R5: bounce authenticated users away from sign-in/sign-up back to app.
  if (isAuthRoute(req) && userId) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  // Layer 2: authed users on M routes → 307 to /app.
  // Escape hatch: if the request carries the demo-mode cookie, pass through
  // so the owner can view the marketing site while logged in.
  if (userId && isMarketingRoute(req)) {
    // §14 canonical escape hatch: cookie OR ?preview=public query param.
    const isPreview =
      req.cookies.get("signal_preview_public")?.value === "1" ||
      req.nextUrl.searchParams.get("preview") === "public";
    if (!isPreview) {
      return NextResponse.redirect(new URL("/app", req.url));
    }
  }

  // /app/* and everything else not in the M list — protect /app/* only.
  // All /{workspaceSlug}/* are C-category and pass through with no auth check.
  const isApp = req.nextUrl.pathname.startsWith("/app");
  if (isApp && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next internals + static assets.
    "/((?!_next|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ttf|eot|ico|css|js)$).*)",
    "/(api|trpc)(.*)",
  ],
};
