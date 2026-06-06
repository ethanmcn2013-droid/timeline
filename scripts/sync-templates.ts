/**
 * Sync canonical workspace template roadmap slices from the Signal Studio
 * repo into this Roadmap repo as a generated TS file
 * (`src/lib/templates.generated.ts`).
 *
 * Source-of-truth: `../studio/src/lib/templates/` (sibling directory).
 * Strategy: studio/docs/TEMPLATES_STRATEGY.md (locked 2026-05-12).
 *
 * Run:  pnpm sync:templates
 *
 * The generated file is committed to git — Vercel does not need the
 * studio repo to build. Re-run this script after editing canonical
 * templates in studio and commit the diff together.
 *
 * Roadmap consumes only the `roadmap` slice from each canonical
 * template (along with id/name for lookup). Tasks owns the gallery
 * surface; Roadmap consumes templateId metadata via lazy expression.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const studioTemplatesPath = resolve(__dirname, "../../studio/src/lib/templates");

if (!existsSync(studioTemplatesPath)) {
  console.error(
    `Studio templates not found at ${studioTemplatesPath}. ` +
      `Expected the studio repo to be a sibling of the roadmap repo.`,
  );
  process.exit(1);
}

const studioIndexUrl = pathToFileURL(`${studioTemplatesPath}/index.ts`).href;

type StudioTemplate = {
  id: string;
  name: string;
  roadmap: {
    projects: Array<{
      slug: string;
      name: string;
      oneLiner: string;
      accent?: string;
    }>;
    items: Array<{
      projectSlug: string;
      title: string;
      description: string;
      status: string;
      targetDate?: string;
    }>;
  };
};

async function main(): Promise<void> {
  const mod = (await import(studioIndexUrl)) as {
    WORKSPACE_TEMPLATES: StudioTemplate[];
  };

  const slice = mod.WORKSPACE_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    roadmap: t.roadmap,
  }));

  const banner = [
    "// AUTO-GENERATED — do not edit by hand.",
    "// Source: studio/src/lib/templates/ (canonical workspace templates).",
    "// Refresh: pnpm sync:templates",
    "// Strategy: studio/docs/TEMPLATES_STRATEGY.md (locked 2026-05-12)",
  ].join("\n");

  const body = `${banner}

export type SyncedTemplateRoadmap = {
  id: string;
  name: string;
  roadmap: {
    projects: Array<{
      slug: string;
      name: string;
      oneLiner: string;
      accent?: string;
    }>;
    items: Array<{
      projectSlug: string;
      title: string;
      description: string;
      status: "shipped" | "in-flight" | "next" | "waiting" | "refused";
      targetDate?: string;
    }>;
  };
};

export const SYNCED_TEMPLATE_ROADMAPS: SyncedTemplateRoadmap[] = ${JSON.stringify(slice, null, 2)};

export const SYNCED_TEMPLATE_IDS = new Set<string>(
  SYNCED_TEMPLATE_ROADMAPS.map((t) => t.id),
);

export function getSyncedTemplateRoadmap(id: string): SyncedTemplateRoadmap | undefined {
  return SYNCED_TEMPLATE_ROADMAPS.find((t) => t.id === id);
}
`;

  const outPath = resolve(__dirname, "../src/lib/templates.generated.ts");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, body, "utf8");

  console.log(
    `Synced ${slice.length} workspace template roadmap slice(s) to ${outPath}: ${slice
      .map((t) => t.id)
      .join(", ")}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
