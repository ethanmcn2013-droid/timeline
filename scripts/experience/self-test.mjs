#!/usr/bin/env node
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  EXPERIENCE_SCHEMA_VERSION,
  discoverRoutes,
  validateRegistry,
} from "./lib.mjs";

const breakpoints = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 900 },
  wide: { width: 1440, height: 960 },
};

function registeredEntry(discovered) {
  return {
    ...discovered,
    product: "timeline",
    parentJourney: "self-test",
    archetype: "public-information-and-proof",
    primaryJob: "Prove route discovery rejects drift.",
    primaryAction: "Run the validator.",
    roles: ["reviewer"],
    requiredStates: ["default", "reduced-motion", "keyboard-only"],
    requiredBreakpoints: ["mobile", "tablet", "desktop", "wide"],
    componentDependencies: [],
    patternDependencies: [],
    reviewTier: "critical",
    designOwner: "product-taste-design-integrity",
    engineeringOwner: "engineering-systems-architecture",
    implementationStatus: "live",
    auditStatus: "registered",
    auditScore: null,
    openFindingIds: [],
    automatedTestCoverage: "none",
    screenshotCoverage: "none",
    accessibilityCoverage: "none",
    fixtureCoverage: "none",
    lastReviewedAt: null,
    approvedBaselineReference: null,
    intentionalExceptions: [],
  };
}

function registry(experiences) {
  return {
    schemaVersion: EXPERIENCE_SCHEMA_VERSION,
    generatedAt: "2026-07-15",
    breakpoints,
    experiences,
  };
}

function withEvidence(entry, approvedBaselineReference) {
  return {
    ...entry,
    fixtureCoverage: "complete",
    screenshotCoverage: "complete",
    accessibilityCoverage: "complete",
    lastReviewedAt: "2026-07-15",
    approvedBaselineReference,
  };
}

function requireFailure(errors, fragment) {
  if (!errors.some((error) => error.includes(fragment))) {
    throw new Error(`self-test did not catch ${fragment}\n${errors.join("\n")}`);
  }
}

const root = mkdtempSync(path.join(tmpdir(), "timeline-experience-"));
try {
  const appRoot = path.join(root, "src", "app");
  mkdirSync(appRoot, { recursive: true });
  const rootPage = path.join(appRoot, "page.tsx");
  writeFileSync(rootPage, "export default function Page(){return null}\n");

  const initialDiscovery = discoverRoutes(root);
  const rootEntry = registeredEntry(initialDiscovery[0]);
  const registered = registry([rootEntry]);

  const missingRoot = path.join(appRoot, "deliberately-unregistered");
  mkdirSync(missingRoot, { recursive: true });
  writeFileSync(
    path.join(missingRoot, "page.tsx"),
    "export default function Page(){return null}\n",
  );
  const unregisteredErrors = validateRegistry({
    repoRoot: root,
    registry: registered,
    discovered: discoverRoutes(root),
  });
  requireFailure(unregisteredErrors, "discovered experience is not registered");

  rmSync(missingRoot, { recursive: true, force: true });
  rmSync(rootPage, { force: true });
  const obsoleteErrors = validateRegistry({
    repoRoot: root,
    registry: registered,
    discovered: discoverRoutes(root),
  });
  requireFailure(obsoleteErrors, "registered experience is obsolete");
  writeFileSync(rootPage, "export default function Page(){return null}\n");

  const duplicateIdErrors = validateRegistry({
    repoRoot: root,
    registry: registry([rootEntry, { ...rootEntry }]),
    discovered: discoverRoutes(root),
  });
  requireFailure(duplicateIdErrors, "duplicate experience ID");

  const duplicate = {
    ...rootEntry,
    id: "timeline.page.duplicate-root",
    source: "src/app/duplicate-root.tsx",
  };
  writeFileSync(path.join(appRoot, "duplicate-root.tsx"), "export default null\n");
  duplicate.materialityHash = discoverRoutes(root)[0].materialityHash;
  const duplicateErrors = validateRegistry({
    repoRoot: root,
    registry: registry([rootEntry, duplicate]),
    discovered: discoverRoutes(root),
  });
  requireFailure(duplicateErrors, "duplicate page route");

  rmSync(path.join(appRoot, "duplicate-root.tsx"), { force: true });
  writeFileSync(rootPage, "export default function Page(){return 'changed'}\n");
  const changedDiscovery = discoverRoutes(root);
  const changedErrors = validateRegistry({
    repoRoot: root,
    registry: registered,
    discovered: changedDiscovery,
  });
  requireFailure(changedErrors, "materiality hash does not match the current source");

  const regenerated = registry([registeredEntry(changedDiscovery[0])]);
  const baseErrors = validateRegistry({
    repoRoot: root,
    registry: regenerated,
    discovered: changedDiscovery,
    baseRegistry: registered,
  });
  requireFailure(baseErrors, "materiality hash changed from the base registry");

  const evidencedBase = registry([withEvidence(rootEntry, "experience/baselines/root-a.json")]);
  const staleEvidence = registry([
    withEvidence(registeredEntry(changedDiscovery[0]), "experience/baselines/root-a.json"),
  ]);
  const staleEvidenceErrors = validateRegistry({
    repoRoot: root,
    registry: staleEvidence,
    discovered: changedDiscovery,
    baseRegistry: evidencedBase,
  });
  requireFailure(staleEvidenceErrors, "without a new approved baseline reference");

  const freshEvidence = registry([
    withEvidence(registeredEntry(changedDiscovery[0]), "experience/baselines/root-b.json"),
  ]);
  const freshEvidenceErrors = validateRegistry({
    repoRoot: root,
    registry: freshEvidence,
    discovered: changedDiscovery,
    baseRegistry: evidencedBase,
  });
  if (freshEvidenceErrors.length) {
    throw new Error(`self-test rejected fresh review evidence\n${freshEvidenceErrors.join("\n")}`);
  }

  const broken = {
    ...rootEntry,
    id: "timeline.surface.broken-source",
    route: undefined,
    trigger: "Open a missing surface",
    surfaceType: "nested-view",
    source: "src/components/missing.tsx",
  };
  const brokenErrors = validateRegistry({
    repoRoot: root,
    registry: registry([rootEntry, broken]),
    discovered: initialDiscovery,
  });
  requireFailure(brokenErrors, "broken source reference");

  console.log(
    "experience:self-test: pass - unregistered routes, obsolete registrations, duplicate IDs and page routes, stale hashes, regenerated hashes without fresh evidence, and broken sources are rejected",
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}
