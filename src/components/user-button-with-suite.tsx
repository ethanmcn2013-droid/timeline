"use client";

import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import {
  SIGNAL_URL,
  NOTES_URL,
  TIMELINE_URL,
  TASKS_URL,
} from "@/lib/product-urls";
import { isDemoMode } from "@/lib/access-mode";

type ProductSlug = "tasks" | "roadmap" | "notes" | "analytics";

/**
 * Product entries, always deep-link to /app (authed surface only).
 * §1G canonical labels (lowercase product noun). Product order (operator-directed 2026-05-18): notes → tasks → roadmap → analytics.
 * roadmap is excluded at render time (current product filter).
 */
const PRODUCTS: { slug: ProductSlug; label: string; url: string }[] = [
  { slug: "notes",     label: "Open notes",     url: `${NOTES_URL}/app`     },
  { slug: "tasks",     label: "Open tasks",     url: `${TASKS_URL}/app`     },
  { slug: "roadmap",   label: "Open timeline",   url: `${TIMELINE_URL}/app`   },
  { slug: "analytics", label: "Open signal", url: `${SIGNAL_URL}/app` },
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

function CameraIcon() {
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
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

/**
 * Roadmap-flavoured Clerk UserButton with:
 *   - Sibling product "Open X" deep-links to /app (not marketing).
 *   - "View public site" / "Exit preview" escape hatch, §14 canonical.
 *     Sets `signal_preview_public=1; max-age=86400; SameSite=Strict` (24h)
 *     so the M→app redirect is suppressed while the owner demos the
 *     marketing surface while logged in. "Exit preview" clears the cookie.
 */
export function UserButtonWithSuite({ current }: { current: ProductSlug }) {
  if (isDemoMode()) {
    return (
      <span
        className="inline-flex min-h-8 items-center rounded-full border border-line-soft px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint"
        aria-label="Demo account"
      >
        Demo
      </span>
    );
  }

  return <ClerkUserButtonWithSuite current={current} />;
}

function ClerkUserButtonWithSuite({ current }: { current: ProductSlug }) {
  // Escape hatch state: check if the preview cookie is currently active.
  // Reading document.cookie is synchronous and safe in a client component.
  const isPreviewActive =
    typeof document !== "undefined" &&
    document.cookie.includes("signal_preview_public=1");

  // Item 4: detect whether the user has a custom avatar.
  // Clerk API: useUser() → user.hasImage (boolean).
  // openUserProfile() from useClerk() opens the Clerk <UserProfile> modal.
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const hasPhoto = user?.hasImage ?? true; // default true → no flicker on load

  return (
    <UserButton>
      <UserButton.MenuItems>
        {/* Item 4: surface avatar upload when user hasn't added a photo yet */}
        {!hasPhoto ? (
          <UserButton.Action
            label="Add a photo"
            labelIcon={<CameraIcon />}
            onClick={() => openUserProfile()}
          />
        ) : null}
        <UserButton.Action label="manageAccount" />
        <UserButton.Link
          label="Account settings"
          href="/app/account"
          labelIcon={
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          }
        />
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
