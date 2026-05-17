"use client";

/**
 * Auth-aware nav controls (Layer 3 — seamless-ecosystem-2026-05-18).
 *
 * When authed:
 *   - No "Sign in" / "Start for free" — replaced by UserButton (Clerk avatar).
 *   - Account menu carries "View public site" escape hatch which sets a
 *     short-lived cookie suppressing the M→app redirect for that tab.
 *     This lets the owner demo the marketing site while logged in.
 *
 * When unauthed:
 *   - Original "Sign in" + "Start for free" CTAs render unchanged.
 *
 * Escape hatch implementation:
 *   Sets a session cookie `roadmap_demo_mode=1` (no expiry = session cookie)
 *   then navigates to the marketing root. The proxy.ts middleware reads this
 *   cookie and skips the M→app redirect while it's present. The cookie is
 *   cleared on next /app navigation or on tab close.
 */

import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

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

function EscapeHatchButton() {
  function enableDemoMode() {
    // Session cookie — no expiry so it clears on tab close.
    document.cookie = "roadmap_demo_mode=1; path=/; SameSite=Lax";
    // Force a full navigation so the middleware re-evaluates without the
    // M→app redirect in effect.
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={enableDemoMode}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        fontSize: 13,
        color: "var(--ink-soft)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        borderRadius: 6,
        transition: "background 120ms",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--ink) 5%, transparent)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      View public site
    </button>
  );
}

export function AuthNavControls({
  nav,
}: {
  nav: { href: string; label: string; external?: boolean }[];
}) {
  const { isSignedIn, isLoaded } = useUser();

  // SSR / loading state: render the unauthed controls as default.
  // Once Clerk loads on the client, the correct branch renders.
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/demo"
          className="hidden rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink-soft hover:text-ink md:inline-flex"
          style={{ transition: "color var(--motion-fast) var(--ease-standard)" }}
        >
          See it live
        </Link>
        <Link
          href="/sign-in"
          className="hidden rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink-soft hover:text-ink md:inline-flex"
          style={{ transition: "color var(--motion-fast) var(--ease-standard)" }}
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-white shadow-sm hover:-translate-y-px hover:shadow-md"
          style={{ transition: "transform var(--motion-fast) var(--ease-standard), box-shadow var(--motion-fast) var(--ease-standard)" }}
        >
          Start for free
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
        {/* Mobile menu — unauthed */}
        <details className="relative md:hidden">
          <summary
            className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border text-ink-soft transition-colors hover:text-ink"
            style={{ borderColor: "var(--border)" }}
            aria-label="Open menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <div
            className="absolute right-0 top-11 w-56 rounded-xl border p-3 shadow-lg"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
          >
            <ul className="flex flex-col gap-1 text-[13px]">
              {nav.map((item) => (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg px-3 py-2 text-ink-soft hover:bg-ink/5 hover:text-ink"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="block rounded-lg px-3 py-2 text-ink-soft hover:bg-ink/5 hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
              <li className="my-1 h-px" style={{ background: "var(--border)" }} aria-hidden />
              <li>
                <Link
                  href="/sign-in"
                  className="block rounded-lg px-3 py-2 text-ink-soft hover:bg-ink/5 hover:text-ink"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </details>
      </div>
    );
  }

  // Authed state: account menu only. No "Sign in", no "Start for free".
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/app"
        className="hidden rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink-soft hover:text-ink md:inline-flex"
        style={{ transition: "color var(--motion-fast) var(--ease-standard)" }}
      >
        Go to app
      </Link>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action
            label="View public site"
            labelIcon={<ArrowIcon />}
            onClick={() => {
              document.cookie = "roadmap_demo_mode=1; path=/; SameSite=Lax";
              window.location.href = "/";
            }}
          />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
}
