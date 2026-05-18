"use client";

import { UserButton } from "@clerk/nextjs";
import {
  ANALYTICS_URL,
  NOTES_URL,
  ROADMAP_URL,
  TASKS_URL,
} from "@/lib/product-urls";

type ProductSlug = "tasks" | "roadmap" | "notes" | "analytics";

/**
 * Product entries — always deep-link to /app (this component is only shown
 * to authed users in the app chrome). Layer 3 update: app-context deep links
 * instead of marketing URLs.
 */
const PRODUCTS: { slug: ProductSlug; label: string; url: string }[] = [
  { slug: "tasks",     label: "Open Tasks",     url: `${TASKS_URL}/app`     },
  { slug: "roadmap",   label: "Open Roadmap",   url: `${ROADMAP_URL}/app`   },
  { slug: "notes",     label: "Open Notes",     url: `${NOTES_URL}/app`     },
  { slug: "analytics", label: "Open Analytics", url: `${ANALYTICS_URL}/app` },
];

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17L17 7M17 7H8M17 7v9" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/**
 * Roadmap-flavoured Clerk UserButton with:
 *   - Sibling product "Open X" deep-links to /app (not marketing).
 *   - "View public site" / "Exit preview" escape hatch — §14 canonical.
 *     Sets `signal_preview_public=1; max-age=86400; SameSite=Strict` (24h)
 *     so the M→app redirect is suppressed while the owner demos the
 *     marketing surface while logged in. "Exit preview" clears the cookie.
 */
export function UserButtonWithSuite({ current }: { current: ProductSlug }) {
  // Escape hatch state: check if the preview cookie is currently active.
  // Reading document.cookie is synchronous and safe in a client component.
  const isPreviewActive =
    typeof document !== "undefined" &&
    document.cookie.includes("signal_preview_public=1");

  return (
    <UserButton>
      <UserButton.MenuItems>
        {PRODUCTS.filter((p) => p.slug !== current).map((p) => (
          <UserButton.Link
            key={p.slug}
            label={p.label}
            href={p.url}
            labelIcon={<ArrowIcon />}
          />
        ))}
        {isPreviewActive ? (
          <UserButton.Action
            label="Exit preview"
            labelIcon={<EyeIcon />}
            onClick={() => {
              // §14: deactivation clears the cookie then reloads.
              document.cookie =
                "signal_preview_public=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
              window.location.reload();
            }}
          />
        ) : (
          <UserButton.Action
            label="View public site"
            labelIcon={<EyeIcon />}
            onClick={() => {
              // §14: 24h cookie, SameSite=Strict (perceived continuity, tab-local).
              document.cookie =
                "signal_preview_public=1; path=/; max-age=86400; SameSite=Strict";
              window.location.href = "/";
            }}
          />
        )}
      </UserButton.MenuItems>
    </UserButton>
  );
}
