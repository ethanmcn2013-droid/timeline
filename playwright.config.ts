import { defineConfig } from "@playwright/test";

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseUrl ?? "http://127.0.0.1:4320";

export default defineConfig({
  testDir: "./tests",
  outputDir: "output/playwright/test-results",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [["line"], ["html", { outputFolder: "output/playwright/report", open: "never" }]],
  use: {
    baseURL,
    browserName: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: externalBaseUrl
    ? undefined
    : {
        command: "pnpm exec next dev -H 127.0.0.1 -p 4320",
        url: `${baseURL}/__design-lab/timeline`,
        reuseExistingServer: true,
        timeout: 120_000,
        env: {
          SIGNAL_ACCESS_MODE: "review",
          NEXT_PUBLIC_SIGNAL_ACCESS_MODE: "review",
          SIGNAL_TIMELINE_DESIGN_LAB: "true",
          UX_ASSURANCE_MODE: "true",
          NEXT_PUBLIC_UX_ASSURANCE_MODE: "true",
        },
      },
});
