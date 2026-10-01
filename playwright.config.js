// Playwright config for the two Assessment 3 end-to-end tests (e2e/builder-crud.spec.js
// and e2e/generate-activity.spec.js). `webServer` starts the app automatically before
// the tests run and reuses an already-running dev server if one is up (so `npm run dev`
// in another terminal doesn't conflict with the test run) — see:
// https://playwright.dev/docs/test-webserver
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./e2e",
  // Generous timeout: Next.js dev mode compiles each route on first visit, which can
  // take 20-30s on a cold start — far longer than a typical "slow test" budget. Tests
  // are fast once the dev server has warmed up (e.g. on a second run).
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // tests write real rows to the same SQLite database — run them one at a time
  retries: 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
