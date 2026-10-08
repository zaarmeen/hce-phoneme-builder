// Assessment 3, instruction 4: "One Playwright test must demonstrate a builder use
// case such as CRUD operations for a word list or activity configuration."
//
// This test exercises the full lifecycle on /manage against the real backend and
// database (no mocking): create a reusable word list, add a word with phonemes,
// rename it, create an activity that uses the list, delete the activity (the list
// must survive), then delete the word and the whole list. Timestamped titles keep
// repeated runs from colliding with each other or with seeded data.
const { test, expect } = require("@playwright/test");

test("builder: create, read, update, and delete a word list and an activity using it", async ({ page }) => {
  const stamp = Date.now();
  const listTitle = `E2E List ${stamp}`;
  const activityTitle = `E2E Wordle ${stamp}`;

  await page.goto("/manage");

  // --- Create (word list) ---
  await page.locator("#newListTitle").fill(listTitle);
  await page.getByRole("button", { name: "Create word list" }).click();
  const listButton = page.getByRole("button", { name: new RegExp(listTitle) });
  await expect(listButton).toBeVisible();
  await listButton.click();

  // --- Create (word) ---
  await page.locator("#wordText").fill("bed");
  await page.getByRole("button", { name: "b", exact: true }).click();
  await page.getByRole("button", { name: "e", exact: true }).click();
  await page.getByRole("button", { name: "d", exact: true }).click();
  await page.getByRole("button", { name: "Add word to list" }).click();
  await expect(page.getByText("b e d")).toBeVisible();

  // --- Update (word) ---
  page.once("dialog", (dialog) => dialog.accept("beds"));
  await page.getByRole("button", { name: "Rename", exact: true }).click();
  await expect(page.getByText("beds", { exact: false })).toBeVisible();

  // --- Create (activity using the list) ---
  await page.getByRole("tab", { name: /Activities/ }).click();
  await page.locator("#newTitle").fill(activityTitle);
  await page.locator("#newType").selectOption("WORDLE");
  const listValue = await page
    .locator("#newWordList option", { hasText: listTitle })
    .getAttribute("value");
  await page.locator("#newWordList").selectOption(listValue);
  await page.getByRole("button", { name: "Create activity" }).click();

  const activityRow = page.getByTestId("activity-row").filter({ hasText: activityTitle });
  await expect(activityRow).toBeVisible();
  await expect(activityRow).toContainText("1 words");

  // --- Delete (activity): its word list must be kept ---
  page.once("dialog", (dialog) => dialog.accept());
  await activityRow.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByTestId("activity-row").filter({ hasText: activityTitle })).toHaveCount(0);

  await page.getByRole("tab", { name: /Word lists/ }).click();
  await expect(listButton).toBeVisible();
  await listButton.click();

  // --- Delete (word) ---
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("No words yet")).toBeVisible();

  // --- Delete (whole list) ---
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete list" }).click();
  await expect(page.getByRole("button", { name: new RegExp(listTitle) })).toHaveCount(0);
});
