#!/usr/bin/env node
import path from "node:path";
import {
  discoverRoutes,
  readBaseRegistry,
  readJson,
  registryMetrics,
  validateRegistry,
} from "./lib.mjs";

const repoRoot = process.cwd();
const baseIndex = process.argv.indexOf("--base");
const explicitBase = baseIndex >= 0 ? process.argv[baseIndex + 1] : null;
const githubBase = process.env.GITHUB_BASE_REF
  ? `origin/${process.env.GITHUB_BASE_REF}`
  : null;
const pushBase = process.env.GITHUB_EVENT_NAME === "push" ? "HEAD^" : null;
const baseRef = explicitBase || githubBase || pushBase;
const registry = readJson(path.join(repoRoot, "experience", "registry.json"));
const discovered = discoverRoutes(repoRoot);
const baseRegistry = readBaseRegistry(repoRoot, baseRef);
const errors = validateRegistry({ repoRoot, registry, discovered, baseRegistry });

if (errors.length) {
  console.error(
    `experience:validate: ${errors.length} failure(s)\n${errors
      .map((error) => `  x ${error}`)
      .join("\n")}`,
  );
  process.exit(1);
}

console.log(
  `experience:validate: clean${baseRegistry ? ` against ${baseRef}` : ""}\n${JSON.stringify(
    registryMetrics(registry),
    null,
    2,
  )}`,
);
