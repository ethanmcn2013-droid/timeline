/**
 * Shared Clerk appearance config.
 *
 * ClerkProvider is at the root layout; this config is passed via the
 * root provider so every surface inherits it.
 *
 * H1 (roadmap-elevation): `userButtonAvatarBox` + `avatarBox` are clamped
 * to 32px max to match the header's h-14 (56px) proportions — avatar sits
 * at 57% of bar height. Without this, Clerk renders its default ~40px
 * indigo circle before hydration which reads as an oversized foreign element.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#4f46e5",
    colorBackground: "#ffffff",
    colorText: "#18181b",
    fontFamily: "var(--font-geist-sans)",
    borderRadius: "0.5rem",
  },
  elements: {
    // Mobile correctness: 48px min-height on inputs + buttons hits
    // the WCAG 2.5.5 tap-target floor; 16px input font-size prevents
    // iOS Safari's auto-zoom on focus. Mirrors tasks T·47.
    formFieldInput: "!min-h-[48px] !text-[16px]",
    formButtonPrimary:
      "bg-ink hover:bg-ink-soft text-white rounded-full !min-h-[48px] !text-[15px]",
    socialButtonsBlockButton: "!min-h-[48px] !text-[15px]",
    card: "shadow-[0_24px_60px_-24px_rgba(24,24,27,0.18)]",
    // H1: constrain UserButton avatar to 32×32px so the pre-hydration
    // indigo circle never oversizes. Clerk default is ~40px; 32px matches
    // the header h-14 (56px) proportions — avatar sits at 57% of bar height.
    userButtonAvatarBox: "!w-8 !h-8",
    avatarBox: "!w-8 !h-8",
  },
} as const;
