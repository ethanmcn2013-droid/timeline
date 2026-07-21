import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";

const options = ["a", "b", "c"] as const;
const surfaces = ["owner", "public", "update", "detail"] as const;
const widths = [390, 768, 1280, 1440, 1728, 1920] as const;
const outputRoot = path.resolve("output", "playwright", "timeline-design-lab", "2026-07-18");

type Receipt = {
  file: string;
  sha256: string;
  option: string;
  surface: string;
  width: number;
  dataset: string;
  density: string;
  state: string;
  preview: string;
  height: number;
};

function url({
  option,
  surface,
  width,
  dataset = "wedding",
  density = "normal",
  state = "default",
  preview = "working",
}: {
  option: string;
  surface: string;
  width: number;
  dataset?: string;
  density?: string;
  state?: string;
  preview?: string;
}) {
  return `/__design-lab/timeline?${new URLSearchParams({
    option,
    surface,
    dataset,
    density,
    state,
    viewport: "responsive",
    preview,
    captureWidth: String(width),
  })}`;
}

test("capture the complete Timeline review matrix", async ({ page }) => {
  test.setTimeout(300_000);
  await mkdir(outputRoot, { recursive: true });
  const receipts: Receipt[] = [];

  async function capture(input: {
    option: string;
    surface: string;
    width: number;
    dataset?: string;
    density?: string;
    state?: string;
    preview?: string;
    prefix?: string;
  }) {
    const dataset = input.dataset ?? "wedding";
    const density = input.density ?? "normal";
    const state = input.state ?? "default";
    const preview = input.preview ?? "working";
    await page.setViewportSize({ width: input.width, height: 1000 });
    await page.goto(url({ ...input, dataset, density, state, preview }), { waitUntil: "domcontentloaded" });
    const prototype = page.locator("#timeline-prototype");
    await expect(prototype).toBeVisible();
    await page.addStyleTag({ content: ".signal-devbanner,nextjs-portal{display:none!important}" });
    const box = await prototype.boundingBox();
    const name = [
      input.prefix ?? "matrix",
      input.option,
      input.surface,
      dataset,
      density,
      state,
      String(input.width),
    ].join("-") + ".png";
    const absolute = path.join(outputRoot, name);
    const buffer = await prototype.screenshot({ path: absolute, animations: "disabled" });
    receipts.push({
      file: path.relative(process.cwd(), absolute).replaceAll("\\", "/"),
      sha256: createHash("sha256").update(buffer).digest("hex"),
      option: input.option,
      surface: input.surface,
      width: input.width,
      dataset,
      density,
      state,
      preview,
      height: Math.ceil(box?.height ?? 0),
    });
  }

  for (const option of options) {
    for (const surface of surfaces) {
      for (const width of widths) {
        await capture({ option, surface, width });
      }
    }
  }

  for (const width of [390, 768, 1280, 1440] as const) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.addStyleTag({ content: ".signal-devbanner,nextjs-portal{display:none!important}" });
    const name = `regression-root-${width}.png`;
    const absolute = path.join(outputRoot, name);
    const buffer = await page.screenshot({ path: absolute, fullPage: true, animations: "disabled" });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    receipts.push({
      file: path.relative(process.cwd(), absolute).replaceAll("\\", "/"),
      sha256: createHash("sha256").update(buffer).digest("hex"),
      option: "production-regression",
      surface: "root",
      width,
      dataset: "not-applicable",
      density: "not-applicable",
      state: "default",
      preview: "not-applicable",
      height,
    });
  }

  for (const state of ["empty", "loading", "error", "read-only", "unpublished", "recently-changed"] as const) {
    await capture({ option: "a", surface: "owner", width: 1280, state, prefix: "state" });
  }

  for (const option of options) {
    for (const surface of ["owner", "public"] as const) {
      for (const width of [390, 1440] as const) {
        await capture({
          option,
          surface,
          width,
          dataset: "edge-cases",
          density: "dense",
          state: "default",
          prefix: "edge",
        });
      }
    }
  }

  const evidence = {
    schemaVersion: "timeline-design-lab-evidence/1",
    capturedAt: "2026-07-18",
    fixtureBoundary: "Synthetic in-memory fixtures only. Reload resets every change.",
    matrix: {
      options: [...options],
      surfaces: [...surfaces],
      widths: [...widths],
      primaryCaptures: options.length * surfaces.length * widths.length,
      stateCaptures: 6,
      denseEdgeCaptures: options.length * 2 * 2,
      productionRootCaptures: 4,
      totalCaptures: receipts.length,
    },
    receipts,
  };
  await writeFile(
    path.join(outputRoot, "evidence.json"),
    `${JSON.stringify(evidence, null, 2)}\n`,
    "utf8",
  );
  expect(receipts).toHaveLength(94);
});
