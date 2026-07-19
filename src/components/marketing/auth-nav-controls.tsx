"use client";

/**
 * Auth-aware nav controls (Layer 3, seamless-ecosystem-2026-05-18).
 *
 * When authed:
 *   - No "Sign in", replaced by UserButton (Clerk avatar).
 *   - Account menu carries "View public site" / "Exit preview" escape hatch
 *     per DESIGN.md §14. Sets `signal_preview_public=1` (24h, SameSite=Strict).
 *
 * When unauthed:
 *   - Pre-access (waitlist) mode: the only auth control is the "Join the
 *     waitlist" CTA -> /waitlist. No "Sign in" on marketing surfaces; the
 *     app is access-gated, so a marketing sign-in link is a false door.
 *     Enforced by scripts/check-marketing-waitlist-contract.mjs.
 *
 * Escape hatch implementation (§14 canonical):
 *   Cookie name: `signal_preview_public` (suite-wide; not repo-local).
 *   Expiry: `max-age=86400` (24h). SameSite=Strict.
 *   Also accepts `?preview=public` query param (proxy.ts reads it server-side).
 *   "Exit preview" clears the cookie and reloads.
 */

import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { isDemoMode, isUxAssuranceMode } from "@/lib/access-mode";

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

export function AuthNavControls() {
  if (isDemoMode() || isUxAssuranceMode()) {
    return <SignedOutControl />;
  }

  return <ClerkAuthNavControls />;
}

function ClerkAuthNavControls() {
  const { isSignedIn, isLoaded } = useUser();

  // SSR / loading state: render the unauthed control as default.
  // Once Clerk loads on the client, the correct branch renders.
  // The mobile nav menu is owned by SuiteHeader; this is only the auth slot.
  if (!isLoaded || !isSignedIn) {
    return <SignedOutControl />;
  }

  // Authed state: account menu only. No upper CTA.
  return (
    <div className="flex items-center gap-3">
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action
            label="View public site"
            labelIcon={<ArrowIcon />}
            onClick={() => {
              // §14: 24h cookie, SameSite=Strict.
              document.cookie =
                "signal_preview_public=1; path=/; max-age=86400; SameSite=Strict";
              window.location.href = "/";
            }}
          />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
}

function SignedOutControl() {
  return (
    <Link
      href="/waitlist?source=header&product=timeline"
      className="inline-flex min-h-8 items-center rounded-full px-3.5 text-[13px] font-medium text-white transition-transform hover:-translate-y-px"
      style={{ background: "var(--ink)" }}
    >
      Join the waitlist
    </Link>
  );
}
