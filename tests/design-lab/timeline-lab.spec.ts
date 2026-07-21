import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const options = ["a", "b", "c"] as const;
const surfaces = ["owner", "public", "update", "detail"] as const;

function labUrl({
  option = "a",
  surface = "owner",
  dataset = "wedding",
  density = "normal",
  state = "default",
  viewport = "responsive",
  preview = "working",
}: {
  option?: string;
  surface?: string;
  dataset?: string;
  density?: string;
  state?: string;
  viewport?: string;
  preview?: string;
} = {}) {
  return `/__design-lab/timeline?${new URLSearchParams({
    option,
    surface,
    dataset,
    density,
    state,
    viewport,
    preview,
  })}`;
}

async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll, `page width ${dimensions.scroll} exceeds ${dimensions.client}`).toBeLessThanOrEqual(dimensions.client + 1);
}

test.describe("Timeline review lab", () => {
  for (const width of [390, 768, 1280, 1440] as const) {
    test(`production root regression at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 960 });
      if (width === 768) {
        await page.emulateMedia({ reducedMotion: "reduce" });
      }
      const response = await page.goto("/", { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);
      await expect(page.locator("main h1").first()).toBeVisible();
      await expectNoPageOverflow(page);
      const result = await new AxeBuilder({ page }).include("main").analyze();
      expect(result.violations.map((violation) => violation.id)).toEqual([]);

      if (width === 390) {
        const dimensions = await page.evaluate(() => ({
          viewport: document.documentElement.clientHeight,
          content: document.documentElement.scrollHeight,
        }));
        expect(dimensions.content).toBeGreaterThan(dimensions.viewport * 2);

        await page.keyboard.press("Tab");
        const focused = page.locator(":focus");
        await expect(focused).toBeVisible();
        await expect(focused).not.toHaveJSProperty("tagName", "BODY");
      }

      if (width === 768) {
        await expect(page.locator(".tl1-intro")).toBeHidden();
        await expect(page.locator("#tl1-title")).toBeVisible();
      }
    });
  }

  for (const option of options) {
    for (const surface of surfaces) {
      test(`${option.toUpperCase()} ${surface} is accessible at desktop`, async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 960 });
        const response = await page.goto(labUrl({ option, surface }), { waitUntil: "networkidle" });
        expect(response?.status()).toBe(200);
        expect(response?.headers()["x-robots-tag"]).toContain("noindex");
        await expect(page.locator("#timeline-prototype h1").first()).toBeVisible();
        await expectNoPageOverflow(page);

        const result = await new AxeBuilder({ page }).include("main").analyze();
        expect(
          result.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            targets: violation.nodes.map((node) => node.target.join(" ")),
          })),
        ).toEqual([]);
      });

      test(`${option.toUpperCase()} ${surface} reflows at 390`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(labUrl({ option, surface }), { waitUntil: "networkidle" });
        await expect(page.locator("#timeline-prototype h1").first()).toBeVisible();
        await expectNoPageOverflow(page);
      });
    }
  }

  for (const option of options) {
    test(`${option.toUpperCase()} mobile frame reflows inside a wide review viewport`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 960 });
      await page.goto(labUrl({ option, surface: "owner", viewport: "mobile" }), { waitUntil: "networkidle" });
      const prototype = page.locator("#timeline-prototype");
      const size = await prototype.boundingBox();
      expect(size?.width).toBeLessThanOrEqual(392);
      const overflow = await prototype.evaluate((element) => ({
        client: element.clientWidth,
        scroll: element.scrollWidth,
        descendants: [...element.querySelectorAll<HTMLElement>("*")]
          .filter((node) =>
            node.clientWidth > 1 &&
            !node.matches("input, textarea, select") &&
            node.scrollWidth > node.clientWidth + 1,
          )
          .map((node) => ({ tag: node.tagName, client: node.clientWidth, scroll: node.scrollWidth })),
      }));
      expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1);
      expect(overflow.descendants).toEqual([]);
    });
  }

  for (const option of options) {
    for (const surface of ["owner", "public"] as const) {
      test(`${option.toUpperCase()} ${surface} keeps dense edge references inside 320`, async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 844 });
        await page.goto(labUrl({ option, surface, dataset: "edge-cases", density: "dense" }), { waitUntil: "networkidle" });
        await expect(page.locator("#timeline-prototype h1").first()).toBeVisible();
        await expectNoPageOverflow(page);
        const prototypeOverflow = await page.locator("#timeline-prototype").evaluate((element) => ({
          client: element.clientWidth,
          scroll: element.scrollWidth,
          offenders: [...element.querySelectorAll<HTMLElement>("*")]
            .filter((node) => node.getBoundingClientRect().right > element.getBoundingClientRect().right + 1)
            .slice(0, 8)
            .map((node) => ({ tag: node.tagName, className: node.className, text: node.textContent?.slice(0, 40) })),
        }));
        expect(
          prototypeOverflow.scroll,
          JSON.stringify(prototypeOverflow.offenders),
        ).toBeLessThanOrEqual(prototypeOverflow.client + 1);
      });
    }
  }

  test("owner move is keyboard-operable, stateful, focused, and write-free", async ({ page }) => {
    const writeRequests: string[] = [];
    page.on("request", (request) => {
      if (!new Set(["GET", "HEAD", "OPTIONS"]).has(request.method())) {
        writeRequests.push(`${request.method()} ${request.url()}`);
      }
    });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${labUrl()}&source=signal&campaign=direction-review`, { waitUntil: "networkidle" });
    await page.getByLabel("Move to").selectOption("soon");
    await page.getByLabel("Why · required").fill("The venue decision needs one more joint review.");
    await page.getByRole("button", { name: "Record move" }).click();

    await expect(page.getByText("Confirm the venue layout moved to soon.")).toBeAttached();
    await expect(page.locator('[data-timeline-item-id="wed-venue"]')).toBeFocused();
    expect(new URL(page.url()).searchParams.get("source")).toBe("signal");
    expect(new URL(page.url()).searchParams.get("campaign")).toBe("direction-review");

    await page.getByRole("button", { name: "Public Timeline" }).click();
    await expect(page.locator('[data-bucket="soon"]')).toContainText("Confirm the venue layout");
    await page.getByRole("button", { name: "Shared Update" }).click();
    await expect(page.locator("#timeline-prototype")).toContainText("The venue decision needs one more joint review.");
    await page.getByRole("button", { name: "Item Detail" }).click();
    await expect(page.locator("#timeline-prototype")).toContainText("The venue decision needs one more joint review.");
    await page.getByRole("button", { name: "Owner Plan" }).click();
    await page.getByRole("button", { name: "Publish this revision" }).click();
    await expect(page.getByLabel("Current review configuration")).toContainText("0 unpublished changes");
    await page.getByRole("button", { name: "Public Timeline" }).click();
    await expect(page.locator('[data-bucket="soon"]')).toContainText("Confirm the venue layout");
    expect(writeRequests).toEqual([]);
  });

  test("owner-only sentinel never enters public, update, or detail DOM", async ({ page }) => {
    await page.goto(labUrl({ surface: "owner" }), { waitUntil: "networkidle" });
    await expect(page.locator("body")).toContainText("OWNER_ONLY_SENTINEL_DO_NOT_PUBLISH");

    for (const surface of ["public", "update", "detail"] as const) {
      await page.getByRole("button", { name: surface === "public" ? "Public Timeline" : surface === "update" ? "Shared Update" : "Item Detail" }).click();
      await expect(page.locator("body")).not.toContainText("OWNER_ONLY_SENTINEL_DO_NOT_PUBLISH");
      expect(await page.content()).not.toContain("OWNER_ONLY_SENTINEL_DO_NOT_PUBLISH");
    }
  });

  for (const option of options) {
    test(`${option.toUpperCase()} hidden selection becomes an explicit detail not-found state`, async ({ page }) => {
      await page.goto(labUrl({ option, surface: "owner" }), { waitUntil: "networkidle" });
      await page.getByRole("button", { name: "Hide from public copy" }).click();
      await page.getByRole("button", { name: "Item Detail" }).click();
      await expect(page.getByRole("heading", { name: "This item is not on the public plan." })).toBeVisible();
      await page.getByRole("button", { name: "Back to public plan" }).click();
      await expect(page.locator("#timeline-prototype h1").first()).toBeVisible();
    });
  }

  test("C owner selection moves focus to the nearby planning rail", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(labUrl({ option: "c", surface: "owner", density: "dense" }), { waitUntil: "networkidle" });
    const lastItem = page.locator('#timeline-prototype [data-timeline-item-id]').last();
    await lastItem.click();
    await expect(page.locator("#c-planning-rail-title")).toBeFocused();
  });

  for (const option of options) {
    test(`${option.toUpperCase()} designs publish and share controls inside the artifact`, async ({ page }) => {
      await page.goto(labUrl({ option, surface: "owner" }), { waitUntil: "networkidle" });
      await expect(page.locator("#timeline-prototype").getByRole("button", { name: "Copy link" })).toBeVisible();
      await page.getByRole("button", { name: "Public Timeline" }).click();
      await expect(page.locator("#timeline-prototype").getByRole("button", { name: "Copy link" })).toBeVisible();
      await page.getByRole("button", { name: "Shared Update" }).click();
      await expect(page.locator("#timeline-prototype").getByRole("button", { name: "Copy link" })).toBeVisible();
    });
  }

  for (const option of options) {
    test(`${option.toUpperCase()} item links preserve attribution and return focus without losing place`, async ({ page, context }) => {
      await page.goto(`${labUrl({ option, surface: "public" })}&source=signal&campaign=direction-review`, { waitUntil: "networkidle" });
      const itemLink = page.locator('#timeline-prototype [data-public-item-id]').first();
      const itemId = await itemLink.getAttribute("data-public-item-id");
      const href = await itemLink.getAttribute("href");
      expect(itemId).toBeTruthy();
      expect(href).toContain("source=signal");
      expect(href).toContain("campaign=direction-review");

      const opened = await context.newPage();
      await opened.goto(new URL(href!, page.url()).toString(), { waitUntil: "domcontentloaded" });
      expect(new URL(opened.url()).searchParams.get("source")).toBe("signal");
      expect(new URL(opened.url()).searchParams.get("campaign")).toBe("direction-review");
      await opened.close();

      await itemLink.click();
      await expect(page.locator("[data-detail-focus]")).toBeFocused();
      await page.getByRole("button", { name: "Back to public plan" }).click();
      await expect(page.locator(`[data-public-item-id="${itemId}"]`)).toBeFocused();
    });
  }

  test("review states stay explicit and recoverable", async ({ page }) => {
    await page.goto(labUrl({ state: "loading" }));
    await expect(page.getByText("Loading review fixture")).toBeVisible();
    await page.getByLabel("State").selectOption("error");
    await expect(page.getByRole("heading", { name: "The review fixture could not be shown." })).toBeVisible();
    await page.getByRole("button", { name: "Reset fixture" }).click();
    await expect(page.getByLabel("State")).toHaveValue("default");
    await page.getByLabel("State").selectOption("read-only");
    await expect(page.getByRole("button", { name: "Add item" })).toBeDisabled();
  });

  test("public update prints as the artifact, not the review chrome", async ({ page }) => {
    await page.goto(labUrl({ option: "b", surface: "update", preview: "published" }), { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("header").first()).toBeHidden();
    await expect(page.locator("#timeline-prototype h1").first()).toBeVisible();
  });

  test("reduced motion removes meaningful transition duration", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(labUrl({ option: "c", surface: "public" }), { waitUntil: "networkidle" });
    const longest = await page.locator("#timeline-prototype *").evaluateAll((elements) =>
      Math.max(
        0,
        ...elements.map((element) => {
          const style = getComputedStyle(element);
          const parse = (value: string) => value.split(",").map((part) => {
            const trimmed = part.trim();
            return trimmed.endsWith("ms") ? Number.parseFloat(trimmed) : Number.parseFloat(trimmed) * 1000;
          });
          return Math.max(0, ...parse(style.animationDuration), ...parse(style.transitionDuration));
        }),
      ),
    );
    expect(longest).toBeLessThanOrEqual(10);
  });
});
