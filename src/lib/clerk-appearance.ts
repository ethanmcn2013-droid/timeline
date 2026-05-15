/**
 * Shared Clerk appearance config.
 *
 * ClerkProvider is scoped to the surfaces that actually use Clerk —
 * /app/* (app layout) and /sign-in + /sign-up (auth layouts) — rather
 * than the root layout, so the Clerk runtime no longer ships to the
 * public roadmap viewer or marketing pages, which never call Clerk.
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
  },
} as const;
