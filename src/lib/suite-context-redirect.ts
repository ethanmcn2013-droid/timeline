const CONTEXT_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const SOURCE_PRODUCTS = new Set(["notes", "tasks", "timeline", "signal"]);

/**
 * Convert a cross-product project hint into Timeline's canonical project
 * route. The destination route remains responsible for workspace and project
 * authorization; this helper only normalizes bounded routing hints.
 */
export function timelineProjectContextRedirect(input: URL): URL | null {
  if (input.pathname !== "/app") return null;

  const projectId = input.searchParams.get("projectId")?.trim();
  if (!projectId || !CONTEXT_ID.test(projectId)) return null;

  const destination = new URL(input.origin);
  destination.pathname = `/app/plan/${encodeURIComponent(projectId)}`;

  for (const key of ["workspaceId", "planningPeriodId"] as const) {
    const value = input.searchParams.get(key)?.trim();
    if (value && CONTEXT_ID.test(value)) {
      destination.searchParams.set(key, value);
    }
  }

  const sourceProduct = input.searchParams.get("sourceProduct")?.trim();
  if (sourceProduct && SOURCE_PRODUCTS.has(sourceProduct)) {
    destination.searchParams.set("sourceProduct", sourceProduct);
  }
  if (input.searchParams.get("contextVersion") === "2") {
    destination.searchParams.set("contextVersion", "2");
  }

  return destination;
}
