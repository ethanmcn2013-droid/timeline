"use client";

/**
 * Clears the roadmap_demo_mode cookie on mount.
 *
 * The escape hatch in the account menu sets this cookie to suppress
 * the M→app redirect for one tab. When the owner navigates back to
 * /app, the cookie should be cleared so the next marketing page visit
 * redirects normally.
 *
 * This is a zero-render effect component — returns null.
 */

import { useEffect } from "react";

export function ClearDemoMode() {
  useEffect(() => {
    // Clear by setting an expired date.
    document.cookie = "roadmap_demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  }, []);
  return null;
}
