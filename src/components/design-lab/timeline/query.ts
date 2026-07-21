import type {
  LabConfig,
  LabDataset,
  LabDensity,
  LabOption,
  LabScenario,
  LabSurface,
  LabViewport,
  PreviewSource,
} from "./types";

export const DEFAULT_LAB_CONFIG: Readonly<LabConfig> = {
  option: "a",
  surface: "owner",
  dataset: "wedding",
  density: "normal",
  scenario: "default",
  viewport: "desktop",
  preview: "working",
};

type QueryRecord = Record<string, string | string[] | undefined>;
type QueryInput = string | URLSearchParams | QueryRecord;

const OPTIONS = new Set<LabOption>(["a", "b", "c"]);
const SURFACES = new Set<LabSurface>(["owner", "public", "update", "detail"]);
const DATASETS = new Set<LabDataset>([
  "wedding",
  "freelance",
  "small-business",
  "edge-cases",
]);
const DENSITIES = new Set<LabDensity>(["sparse", "normal", "dense"]);
const SCENARIOS = new Set<LabScenario>([
  "default",
  "empty",
  "loading",
  "error",
  "read-only",
  "unpublished",
  "recently-changed",
]);
const VIEWPORTS = new Set<LabViewport>([
  "responsive",
  "mobile",
  "tablet",
  "desktop",
  "wide",
]);
const PREVIEWS = new Set<PreviewSource>(["working", "published"]);
const SAFE_ITEM_ID = /^[a-z0-9][a-z0-9._:-]{0,79}$/;
const ATTRIBUTION_KEYS = ["source", "campaign"] as const;
const SAFE_ATTRIBUTION_VALUE = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,79}$/;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toRecord(input: QueryInput): QueryRecord {
  if (typeof input === "string") {
    const query = input.startsWith("?") ? input.slice(1) : input;
    return Object.fromEntries(new URLSearchParams(query));
  }
  if (input instanceof URLSearchParams) return Object.fromEntries(input.entries());
  return input;
}

function oneOf<T extends string>(
  value: string | undefined,
  allowed: ReadonlySet<T>,
  fallback: T,
): T {
  return value && allowed.has(value as T) ? (value as T) : fallback;
}

export function parseLabConfig(input: QueryInput = ""): LabConfig {
  const values = toRecord(input);
  const rawDataset = firstValue(values.dataset);
  const normalizedDataset = rawDataset === "edge" ? "edge-cases" : rawDataset;
  const rawItem = firstValue(values.item)?.trim().toLowerCase();

  const config: LabConfig = {
    option: oneOf(firstValue(values.option)?.toLowerCase(), OPTIONS, DEFAULT_LAB_CONFIG.option),
    surface: oneOf(
      firstValue(values.surface)?.toLowerCase(),
      SURFACES,
      DEFAULT_LAB_CONFIG.surface,
    ),
    dataset: oneOf(
      normalizedDataset?.toLowerCase(),
      DATASETS,
      DEFAULT_LAB_CONFIG.dataset,
    ),
    density: oneOf(
      firstValue(values.density)?.toLowerCase(),
      DENSITIES,
      DEFAULT_LAB_CONFIG.density,
    ),
    scenario: oneOf(
      (firstValue(values.state) ?? firstValue(values.scenario))?.toLowerCase(),
      SCENARIOS,
      DEFAULT_LAB_CONFIG.scenario,
    ),
    viewport: oneOf(
      firstValue(values.viewport)?.toLowerCase(),
      VIEWPORTS,
      DEFAULT_LAB_CONFIG.viewport,
    ),
    preview: oneOf(
      firstValue(values.preview)?.toLowerCase(),
      PREVIEWS,
      DEFAULT_LAB_CONFIG.preview,
    ),
  };
  if (rawItem && SAFE_ITEM_ID.test(rawItem)) config.item = rawItem;
  return config;
}

export function serializeLabConfig(config: LabConfig): string {
  const normalized = parseLabConfig({
    option: config.option,
    surface: config.surface,
    dataset: config.dataset,
    density: config.density,
    state: config.scenario,
    viewport: config.viewport,
    preview: config.preview,
    item: config.item,
  });
  const query = new URLSearchParams();
  query.set("option", normalized.option);
  query.set("surface", normalized.surface);
  query.set("dataset", normalized.dataset);
  query.set("density", normalized.density);
  query.set("state", normalized.scenario);
  query.set("viewport", normalized.viewport);
  query.set("preview", normalized.preview);
  if (normalized.item) query.set("item", normalized.item);
  return query.toString();
}

export function serializeLabAttribution(input: QueryInput = ""): string {
  const values = toRecord(input);
  const query = new URLSearchParams();
  for (const key of ATTRIBUTION_KEYS) {
    const value = firstValue(values[key])?.trim();
    if (value && SAFE_ATTRIBUTION_VALUE.test(value)) query.set(key, value);
  }
  return query.toString();
}
