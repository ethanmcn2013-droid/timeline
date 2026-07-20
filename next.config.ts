import type { NextConfig } from "next";

/**
 * ── Security headers (Phase 6.1) ───────────────────────────────────
 * Suite-wide security baseline — matches Studio/Tasks/Analytics pattern
 * (Plan 4.1). Two policy sets:
 *   1. Standard headers (HSTS, X-Content-Type-Options, etc.) in enforce
 *      mode — safe, no flow breakage.
 *   2. Content-Security-Policy in Report-Only mode — logs violations
 *      without enforcing. Promote to enforce (`Content-Security-Policy`)
 *      once verified clean in prod.
 *
 * Roadmap-specific additions vs Studio CSP:
 *   - clerk.accounts.dev + accounts.clerk.com for Clerk auth flows
 *   - Clerk's hosted UI JS
 */

const isDev = process.env.NODE_ENV === "development";
const enforceCsp = process.env.SIGNAL_ENFORCE_CSP === "true";

// CSP allowlists mirrored from notes/next.config.ts (suite-locked enforce model). Report-Only until cross-suite verification — see audit/ISSUES.md suite-01.
// Aligned 2026-06-06 — roadmap was previously excluded from the day-6
// sweep during Upstash provisioning, which had no CSP implications.
// Clerk's prod Frontend API is a CNAME under our own domain, so the
// wildcard `https://*.signalstudio.ie` covers whatever label Clerk
// uses without a deploy-time guess. *.clerk.com + clerk-telemetry.com
// cover Clerk infra/telemetry; Turnstile bot-protection on Cloudflare.
const clerkHosts =
  "https://*.signalstudio.ie https://*.clerk.accounts.dev https://*.clerk.com https://clerk-telemetry.com";
const turnstile = "https://challenges.cloudflare.com";

const googleTag = "https://www.googletagmanager.com";
const googleAnalytics =
  "https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com";

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com ${clerkHosts} ${turnstile} https://clerk.accounts.dev ${googleTag}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  `connect-src 'self' https://va.vercel-scripts.com ${clerkHosts} https://accounts.clerk.com ${googleTag} ${googleAnalytics}`,
  `frame-src 'self' ${turnstile} https://*.clerk.accounts.dev`,
  `worker-src 'self' blob:`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  // CSP violation reporting — collected at /api/csp-report so we can verify
  // the policy is clean before promoting Report-Only → enforce.
  `report-uri /api/csp-report`,
  `report-to csp`,
].join("; ");

const securityHeaders = [
  { key: enforceCsp ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only", value: csp },
  { key: "Reporting-Endpoints", value: 'csp="/api/csp-report"' },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  experimental: {
    // Tree-shake barrel imports — motion + Clerk are the heaviest
    // client deps and only a subset of each is used per route.
    optimizePackageImports: ["motion", "@clerk/nextjs"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Audience links carry a bearer token in the path. They are resolved
        // dynamically on every request and must not leak through referrers,
        // indexing, shared caches, or embedding.
        source: "/s/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
