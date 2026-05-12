/**
 * Shared formatting utilities for the Roadmap product.
 * Extracted from [workspaceSlug]/page.tsx + [workspaceSlug]/update/page.tsx
 * in Phase 11.3 to eliminate the duplicate.
 */

/**
 * Returns a human-readable relative time string ("3 minutes ago",
 * "2 days ago") for a Date. Falls back to a short locale date string
 * for anything older than 30 days.
 */
export function formatRelative(d: Date): string {
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / (60 * 1000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
