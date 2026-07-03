/**
 * D6 two-gate revalidation path contracts (BV-4).
 *
 * These pure functions document exactly which paths each action revalidates.
 * Kept in a separate module (no "use server", no Next.js imports) so they
 * can be imported directly in the Node.js test runner without pulling in
 * next/cache, Clerk, or Turso.
 *
 * workspaces.ts uses these same values inline, the static source scan in
 * tasks-milestone-source.test.ts cross-checks the live code against the
 * contract documented here.
 */

/**
 * The exact set of paths syncMilestonesAction revalidates.
 * All paths begin with /app, none are public /{workspaceSlug} paths.
 * Invariant: sync NEVER touches the public ISR cache (D6 two-gate).
 */
export function syncRevalidationPaths(projectSlug: string): string[] {
  return ["/app", `/app/plan/${projectSlug}`];
}

/**
 * The exact set of paths publishWorkspaceAction revalidates.
 * Includes the public /{workspaceSlug} path, publish is the ONLY gate.
 */
export function publishRevalidationPaths(workspaceSlug: string): string[] {
  return ["/app", `/${workspaceSlug}`];
}
