import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import path from "node:path";

export const EXPERIENCE_SCHEMA_VERSION = "signal-experience/1";
export const REQUIRED_BREAKPOINTS = ["mobile", "tablet", "desktop", "wide"];

const PAGE_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js"]);
const SPECIAL_FILES = new Map([
  ["page", "page"],
  ["loading", "loading"],
  ["error", "error"],
  ["not-found", "error"],
]);
const SURFACE_TYPES = new Set([
  "page",
  "nested-view",
  "embedded-workspace",
  "dialog",
  "drawer",
  "popover",
  "menu",
  "command-palette",
  "onboarding",
  "authentication",
  "invitation",
  "shared-link",
  "loading",
  "empty",
  "error",
  "success",
  "restricted",
  "notification",
  "report",
  "export",
  "email",
  "extension-overlay",
]);
const ARCHETYPES = new Set([
  "application-shell-and-navigation",
  "dashboard-or-command-centre",
  "list-and-data-table",
  "detail-or-record-view",
  "create-and-edit-form",
  "editor-or-canvas",
  "review-and-approval-workspace",
  "search-and-command-interface",
  "settings-and-administration",
  "onboarding-and-authentication",
  "feedback-interruption-and-exception",
  "public-information-and-proof",
]);
const EXPERIENCE_STATES = new Set([
  "default",
  "first-use",
  "empty",
  "populated",
  "loading",
  "slow-loading",
  "partial-failure",
  "error",
  "success",
  "restricted",
  "disabled",
  "read-only",
  "dense",
  "long-content",
  "saved",
  "unsaved",
  "reduced-motion",
  "keyboard-only",
]);
const REVIEW_TIERS = new Set(["critical", "core", "supporting"]);
const IMPLEMENTATION_STATUSES = new Set(["live", "preview", "legacy", "planned"]);
const AUDIT_STATUSES = new Set([
  "registered",
  "baseline-captured",
  "under-remediation",
  "passing",
  "blocked",
  "exception",
]);
const COVERAGE_STATUSES = new Set(["none", "partial", "complete", "blocked"]);
const REQUIRED_STRING_FIELDS = [
  "id",
  "product",
  "surfaceType",
  "source",
  "parentJourney",
  "archetype",
  "primaryJob",
  "primaryAction",
  "reviewTier",
  "designOwner",
  "engineeringOwner",
  "implementationStatus",
  "auditStatus",
  "materialityHash",
];

export function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

export function hashText(text) {
  const normalized = text.replace(/\r\n?/g, "\n");
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

export function hashFile(file) {
  return hashText(readFileSync(file, "utf8"));
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const name of readdirSync(dir)) {
    const absolute = path.join(dir, name);
    const stat = statSync(absolute);
    if (stat.isDirectory()) {
      if (!["node_modules", ".next", ".git", "dist", "out", "coverage"].includes(name)) {
        files.push(...walk(absolute));
      }
    } else {
      files.push(absolute);
    }
  }
  return files;
}

function visibleRouteSegments(relativeDirectory) {
  if (!relativeDirectory || relativeDirectory === ".") return [];
  return relativeDirectory
    .split(path.sep)
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .filter((segment) => !segment.startsWith("@"))
    // Next.js uses percent-encoded leading underscores for routable folders;
    // literal underscore folders are private. The public route contract uses
    // the decoded segment, so the registry must do the same.
    .map((segment) => segment.replace(/%5f/gi, "_"));
}

export function normalizeRoute(appRoot, sourceFile) {
  const relativeDirectory = path.relative(appRoot, path.dirname(sourceFile));
  const segments = visibleRouteSegments(relativeDirectory);
  return segments.length ? `/${segments.join("/")}` : "/";
}

function kebab(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function slugSegment(segment) {
  const optionalCatchAll = segment.match(/^\[\[\.\.\.(.+)\]\]$/);
  if (optionalCatchAll) return `by-${kebab(optionalCatchAll[1])}`;
  const catchAll = segment.match(/^\[\.\.\.(.+)\]$/);
  if (catchAll) return `by-${kebab(catchAll[1])}`;
  const dynamic = segment.match(/^\[(.+)\]$/);
  if (dynamic) return `by-${kebab(dynamic[1])}`;
  return kebab(segment);
}

export function routeSlug(route) {
  if (route === "/") return "root";
  return route.split("/").filter(Boolean).map(slugSegment).join("-");
}

function sourceRelative(repoRoot, sourceFile) {
  return path.relative(repoRoot, sourceFile).split(path.sep).join("/");
}

function routingContext(appRoot, sourceFile) {
  return path
    .relative(appRoot, path.dirname(sourceFile))
    .split(path.sep)
    .filter(
      (segment) =>
        (segment.startsWith("(") && segment.endsWith(")")) ||
        segment.startsWith("@"),
    )
    .map((segment) => kebab(segment.replace(/^[@(]+|[)]+$/g, "")))
    .filter(Boolean)
    .join("-");
}

export function discoverRoutes(repoRoot) {
  const appRoot = path.join(repoRoot, "src", "app");
  const candidates = [];
  for (const file of walk(appRoot)) {
    const extension = path.extname(file);
    if (!PAGE_EXTENSIONS.has(extension)) continue;
    const basename = path.basename(file, extension);
    if (!SPECIAL_FILES.has(basename)) continue;
    const route = normalizeRoute(appRoot, file);
    const kind = basename === "page" ? "page" : "state";
    const suffix = basename === "page" ? routeSlug(route) : `${routeSlug(route)}-${basename}`;
    candidates.push({
      baseId: `timeline.${kind}.${suffix}`,
      context: routingContext(appRoot, file) || "default",
      route,
      surfaceType: SPECIAL_FILES.get(basename),
      source: sourceRelative(repoRoot, file),
      materialityHash: hashFile(file),
    });
  }

  const counts = new Map();
  for (const candidate of candidates) {
    counts.set(candidate.baseId, (counts.get(candidate.baseId) ?? 0) + 1);
  }
  return candidates
    .map(({ baseId, context, ...candidate }) => ({
      id: (counts.get(baseId) ?? 0) > 1 ? `${baseId}-${context}` : baseId,
      ...candidate,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function requireArray(entry, field, errors) {
  if (!Array.isArray(entry[field])) {
    errors.push(`${entry.id || "<missing-id>"}: ${field} must be an array`);
    return false;
  }
  return true;
}

function hasMaterialEvidence(entry) {
  return (
    entry.fixtureCoverage === "complete" &&
    entry.screenshotCoverage === "complete" &&
    entry.accessibilityCoverage === "complete" &&
    isNonEmptyString(entry.lastReviewedAt) &&
    isNonEmptyString(entry.approvedBaselineReference)
  );
}

function validateEnum(entry, field, allowed, errors) {
  if (!allowed.has(entry[field])) {
    errors.push(`${entry.id || "<missing-id>"}: invalid ${field} ${JSON.stringify(entry[field])}`);
  }
}

function resolveSource(repoRoot, source) {
  if (!isNonEmptyString(source) || path.isAbsolute(source)) return null;
  const absolute = path.resolve(repoRoot, source.replaceAll("/", path.sep));
  const relative = path.relative(repoRoot, absolute);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    return null;
  }
  return absolute;
}

export function validateRegistry({ repoRoot, registry, discovered, baseRegistry = null }) {
  const errors = [];
  if (registry.schemaVersion !== EXPERIENCE_SCHEMA_VERSION) {
    errors.push(`registry schema must be ${EXPERIENCE_SCHEMA_VERSION}`);
  }
  if (!Array.isArray(registry.experiences)) {
    return [...errors, "registry experiences must be an array"];
  }
  for (const breakpoint of REQUIRED_BREAKPOINTS) {
    const value = registry.breakpoints?.[breakpoint];
    if (!value || !Number.isInteger(value.width) || !Number.isInteger(value.height)) {
      errors.push(`registry breakpoint ${breakpoint} must define integer width and height`);
    }
  }

  const ids = new Set();
  const sources = new Set();
  const pageRoutes = new Map();
  for (const entry of registry.experiences) {
    for (const field of REQUIRED_STRING_FIELDS) {
      if (!isNonEmptyString(entry[field])) {
        errors.push(`${entry.id || "<missing-id>"}: missing ${field}`);
      }
    }
    if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(entry.id ?? "")) {
      errors.push(`${entry.id || "<missing-id>"}: unstable ID format`);
    }
    if (ids.has(entry.id)) errors.push(`${entry.id}: duplicate experience ID`);
    ids.add(entry.id);
    if (entry.product !== "timeline") errors.push(`${entry.id}: product must be timeline`);
    validateEnum(entry, "surfaceType", SURFACE_TYPES, errors);
    validateEnum(entry, "archetype", ARCHETYPES, errors);
    validateEnum(entry, "reviewTier", REVIEW_TIERS, errors);
    validateEnum(entry, "implementationStatus", IMPLEMENTATION_STATUSES, errors);
    validateEnum(entry, "auditStatus", AUDIT_STATUSES, errors);
    for (const field of [
      "automatedTestCoverage",
      "screenshotCoverage",
      "accessibilityCoverage",
      "fixtureCoverage",
    ]) {
      validateEnum(entry, field, COVERAGE_STATUSES, errors);
    }
    if (!entry.route && !entry.trigger) {
      errors.push(`${entry.id}: route or trigger is required`);
    }
    if (entry.route && !entry.route.startsWith("/")) {
      errors.push(`${entry.id}: route must start with /`);
    }
    if (entry.surfaceType === "page" && entry.route) {
      const prior = pageRoutes.get(entry.route);
      if (prior) errors.push(`${entry.id}: duplicate page route ${entry.route} (already ${prior})`);
      pageRoutes.set(entry.route, entry.id);
    }
    const sourceKey = `${entry.surfaceType}|${entry.source}`;
    if (sources.has(sourceKey)) errors.push(`${entry.id}: duplicate registered source ${entry.source}`);
    sources.add(sourceKey);

    for (const field of [
      "roles",
      "requiredStates",
      "requiredBreakpoints",
      "componentDependencies",
      "patternDependencies",
      "openFindingIds",
      "intentionalExceptions",
    ]) {
      requireArray(entry, field, errors);
    }
    if (!entry.roles?.length) errors.push(`${entry.id}: roles are required`);
    if (!entry.requiredStates?.length) errors.push(`${entry.id}: required states are missing`);
    for (const state of entry.requiredStates ?? []) {
      if (!EXPERIENCE_STATES.has(state)) errors.push(`${entry.id}: invalid required state ${state}`);
    }
    for (const breakpoint of REQUIRED_BREAKPOINTS) {
      if (!entry.requiredBreakpoints?.includes(breakpoint)) {
        errors.push(`${entry.id}: missing breakpoint ${breakpoint}`);
      }
    }
    for (const breakpoint of entry.requiredBreakpoints ?? []) {
      if (!REQUIRED_BREAKPOINTS.includes(breakpoint)) {
        errors.push(`${entry.id}: invalid breakpoint ${breakpoint}`);
      }
    }

    const absolute = resolveSource(repoRoot, entry.source);
    if (!absolute) {
      errors.push(`${entry.id}: source must stay inside the repository (${entry.source})`);
    } else if (!existsSync(absolute)) {
      errors.push(`${entry.id}: broken source reference ${entry.source}`);
    } else if (hashFile(absolute) !== entry.materialityHash) {
      errors.push(`${entry.id}: materiality hash does not match the current source`);
    }
  }

  const registeredRoutes = new Map(
    registry.experiences
      .filter(
        (entry) =>
          entry.route &&
          (entry.id.startsWith("timeline.page.") ||
            entry.id.startsWith("timeline.state.")),
      )
      .map((entry) => [entry.id, entry]),
  );
  const discoveredRoutes = new Map(discovered.map((entry) => [entry.id, entry]));
  const discoveredPages = new Map();
  for (const entry of discovered) {
    if (entry.surfaceType === "page") {
      const prior = discoveredPages.get(entry.route);
      if (prior) errors.push(`${entry.id}: duplicate discovered page route ${entry.route} (also ${prior})`);
      discoveredPages.set(entry.route, entry.id);
    }
    const registered = registeredRoutes.get(entry.id);
    if (!registered) {
      errors.push(`${entry.id}: discovered experience is not registered (${entry.source})`);
      continue;
    }
    if (registered.source !== entry.source) {
      errors.push(`${entry.id}: obsolete source reference ${registered.source}; discovered ${entry.source}`);
    }
    if (registered.route !== entry.route) {
      errors.push(`${entry.id}: registered route ${registered.route} does not match ${entry.route}`);
    }
    if (registered.surfaceType !== entry.surfaceType) {
      errors.push(`${entry.id}: registered surface type ${registered.surfaceType} does not match ${entry.surfaceType}`);
    }
  }
  for (const [id, entry] of registeredRoutes) {
    if (!discoveredRoutes.has(id)) {
      errors.push(`${id}: registered experience is obsolete (${entry.source})`);
    }
  }

  if (baseRegistry?.experiences) {
    const baseById = new Map(baseRegistry.experiences.map((entry) => [entry.id, entry]));
    for (const entry of registry.experiences) {
      const base = baseById.get(entry.id);
      if (base && base.materialityHash !== entry.materialityHash) {
        if (!hasMaterialEvidence(entry)) {
          errors.push(`${entry.id}: materiality hash changed from the base registry without review evidence`);
        } else if (entry.approvedBaselineReference === base.approvedBaselineReference) {
          errors.push(`${entry.id}: materiality hash changed without a new approved baseline reference`);
        }
      }
    }
  }
  return [...new Set(errors)];
}

export function readBaseRegistry(repoRoot, baseRef) {
  if (!baseRef) return null;
  try {
    const text = execFileSync(
      "git",
      ["show", `${baseRef}:experience/registry.json`],
      { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function registryMetrics(registry) {
  return {
    experiences: registry.experiences.length,
    routeExperiences: registry.experiences.filter((entry) => entry.route).length,
    triggeredSurfaces: registry.experiences.filter((entry) => entry.trigger).length,
    stateVariants: registry.experiences.reduce(
      (sum, entry) => sum + entry.requiredStates.length,
      0,
    ),
    breakpointVariants: registry.experiences.reduce(
      (sum, entry) => sum + entry.requiredBreakpoints.length,
      0,
    ),
  };
}
