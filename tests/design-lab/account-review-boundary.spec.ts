import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
}

test.describe("review-mode account boundary", () => {
  for (const width of [390, 768, 1280, 1440] as const) {
    test(`stays truthful and Clerk-free at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 960 });
      const response = await page.goto("/app/account", { waitUntil: "networkidle" });

      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { name: "Your Signal account" })).toBeVisible();
      await expect(
        page.getByText(
          "Identity and account deletion stay unavailable in review mode. This preview never connects to a real Signal account.",
          { exact: true },
        ),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Delete account" })).toHaveCount(0);
      await expectNoPageOverflow(page);

      const result = await new AxeBuilder({ page }).include("main").analyze();
      expect(result.violations.map((violation) => violation.id)).toEqual([]);

      await page.screenshot({
        path: `output/playwright/account-review-boundary/2026-07-18/account-review-${width}.png`,
        fullPage: true,
      });
    });
  }

  test("remains calm with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/app/account", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: "Your Signal account" })).toBeVisible();
    const result = await new AxeBuilder({ page }).include("main").analyze();
    expect(result.violations.map((violation) => violation.id)).toEqual([]);
    await page.screenshot({
      path: "output/playwright/account-review-boundary/2026-07-18/account-review-reduced-motion.png",
      fullPage: true,
    });
  });

  test("keeps the review account menu keyboard reachable", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/app/account", { waitUntil: "networkidle" });
    const accountMenu = page.getByLabel("Open demo account menu", { exact: true });
    await expect(accountMenu).toBeVisible();

    let reached = false;
    for (let index = 0; index < 12; index += 1) {
      await page.keyboard.press("Tab");
      reached = await accountMenu.evaluate((element) => element === document.activeElement);
      if (reached) break;
    }
    expect(reached).toBe(true);
    await page.screenshot({
      path: "output/playwright/account-review-boundary/2026-07-18/account-review-keyboard.png",
      fullPage: true,
    });
  });

  test("preserves a readable short-viewport flow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 360 });
    await page.goto("/app/account", { waitUntil: "networkidle" });
    const dimensions = await page.evaluate(() => ({
      clientHeight: document.documentElement.clientHeight,
      scrollHeight: document.documentElement.scrollHeight,
    }));
    expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);
    await expectNoPageOverflow(page);
    await page.screenshot({
      path: "output/playwright/account-review-boundary/2026-07-18/account-review-short-viewport.png",
      fullPage: true,
    });
  });
});
