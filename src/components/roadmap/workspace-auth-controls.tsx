"use client";

/**
 * Auth-aware controls for the public workspace header (Layer 4).
 *
 * When the owner is viewing their own roadmap while logged in, show:
 *   - "Edit" link to /app (owner shortcut)
 *   - Account button (UserButton from Clerk)
 *
 * When logged out (normal visitor), render nothing — the workspace header
 * is intentionally minimal for guests; no "Sign in" CTA here.
 *
 * This is a thin client island — the WorkspaceHeader server component
 * stays static, this island hydrates independently.
 */

import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

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

function PencilIcon() {
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function WorkspaceAuthControls({
  ownerUserId,
}: {
  ownerUserId: string;
}) {
  const { isSignedIn, user } = useUser();

  // Not signed in — render nothing (guest experience is minimal by design).
  if (!isSignedIn || !user) return null;

  const isOwner = user.id === ownerUserId;

  return (
    <div className="flex items-center gap-3">
      {isOwner ? (
        <a
          href="/app"
          className="hidden items-center gap-1.5 text-[12px] font-medium sm:flex"
          style={{
            color: "var(--brand)",
            textDecoration: "none",
            transition: "opacity 150ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <PencilIcon />
          Edit
        </a>
      ) : null}
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action
            label="View public site"
            labelIcon={<EyeIcon />}
            onClick={() => {
              // Escape hatch: suppress M→app redirect so the owner can
              // navigate to marketing pages while logged in.
              document.cookie = "roadmap_demo_mode=1; path=/; SameSite=Lax";
              window.location.href = "/";
            }}
          />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
}
