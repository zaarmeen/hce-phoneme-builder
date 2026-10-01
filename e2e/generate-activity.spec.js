// Assessment 3, instruction 4: "One Playwright test must demonstrate a user use case
// such as generating or viewing a Wordle or Word Search activity."
//
// Uses the built-in demo bank (always present, no setup required) so this test never
// depends on data created by the other spec or by manual testing. It confirms the
// whole generation path actually produces a downloadable file, which is the real
// user-facing outcome of this feature — not just that a button exists.
const { test, expect } = require("@playwright/test");

test("user: can view the Wordle builder and generate a downloadable activity", async ({ page }) => {
  await page.goto("/wordle");

  await expect(page.getByRole("heading", { name: "Wordle Builder" })).toBeVisible();

  // Explicitly use the built-in demo bank so the test is independent of whatever
  // saved activity sets exist in the database at the time it runs.
  await page.locator("#sourceSet").selectOption("builtin");

  // A word and its live preview should render without the user doing anything else.
  await expect(page.getByText("Live preview")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Generate .html" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^phoneme-wordle-.+\.html$/);
});
