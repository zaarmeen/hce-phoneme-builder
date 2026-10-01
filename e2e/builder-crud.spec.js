// Assessment 3, instruction 4: "One Playwright test must demonstrate a builder use
// case such as CRUD operations for a word list or activity configuration."
//
// This test exercises the full lifecycle on /manage against the real backend and
// database (no mocking): create an activity set, add a word with phonemes, rename
// it, delete the word, then delete the whole set — checking the UI reflects each
// change along the way. A timestamped title keeps repeated test runs from colliding
// with each other or with seeded data.
const { test, expect } = require("@playwright/test");

test("builder: create, read, update, and delete an activity set and its word", async ({ page }) => {
  const title = `E2E Wordle Set ${Date.now()}`;

  await page.goto("/manage");

  // --- Create ---
  await page.locator("#newTitle").fill(title);
  await page.locator("#newType").selectOption("WORDLE");
  await page.getByRole("button", { name: "Create activity set" }).click();

  const setButton = page.getByRole("button", { name: new RegExp(title) });
  await expect(setButton).toBeVisible();
  await setButton.click();

  // --- Create (word) ---
  await page.locator("#wordText").fill("bed");
  await page.getByRole("button", { name: "b", exact: true }).click();
  await page.getByRole("button", { name: "e", exact: true }).click();
  await page.getByRole("button", { name: "d", exact: true }).click();
  await page.getByRole("button", { name: "Add word to set" }).click();

  await expect(page.getByText("b e d")).toBeVisible();

  // --- Update ---
  page.once("dialog", (dialog) => dialog.accept("beds"));
  await page.getByRole("button", { name: "Rename" }).click();
  await expect(page.getByText("beds", { exact: false })).toBeVisible();

  // --- Delete (word) ---
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("No words yet")).toBeVisible();

  // --- Delete (whole set) ---
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete set" }).click();
  await expect(page.getByRole("button", { name: new RegExp(title) })).toHaveCount(0);
});
