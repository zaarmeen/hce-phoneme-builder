// Save/load inside the builder: a teacher builds a Wordle activity, saves it, comes
// back to it later (page reload), changes it and saves again, then reopens it from the
// Manage page's "Open in builder" link. Runs against the real backend and database.
//
// The word list it needs is created (and everything cleaned up) through the API, so
// the test doesn't depend on seeded data or on the other spec.
const { test, expect } = require("@playwright/test");

test("builder: save a Wordle activity, reload it, update it, and reopen it from Manage", async ({ page }) => {
  const stamp = Date.now();
  const listTitle = `E2E Save List ${stamp}`;
  const activityTitle = `E2E Saved Wordle ${stamp}`;

  const listRes = await page.request.post("/api/word-lists", {
    data: { title: listTitle, words: [{ text: "bed", phonemes: ["b", "e", "d"] }] },
  });
  expect(listRes.status()).toBe(201);
  const list = await listRes.json();

  try {
    // --- Save as a new activity ---
    await page.goto("/wordle");
    await page.locator("#sourceSet").selectOption(String(list.id));
    await page.locator("#activityTitle").fill(activityTitle);
    await page.locator("#guesses").fill("4");
    await page.getByRole("button", { name: "Save activity" }).click();
    await expect(page.getByRole("status")).toContainText("as a new activity");
    await expect(page).toHaveURL(/\?activity=\d+/);

    // --- Load: reloading the page reopens the saved activity with its settings ---
    await page.reload();
    await expect(page.locator("#activityTitle")).toHaveValue(activityTitle);
    await expect(page.locator("#guesses")).toHaveValue("4");
    await expect(page.locator("#sourceSet")).toHaveValue(String(list.id));

    // --- Update in place ---
    await page.locator("#guesses").fill("5");
    await expect(page.getByRole("status")).toContainText("Unsaved changes");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText("Changes saved");

    // --- Reopen from the Manage page ---
    await page.goto("/manage?view=activities");
    const row = page.getByTestId("activity-row").filter({ hasText: activityTitle });
    await expect(row).toContainText("5 guesses");
    await row.getByRole("link", { name: "Open in builder" }).click();
    await expect(page).toHaveURL(/\/wordle\?activity=\d+/);
    await expect(page.locator("#activityTitle")).toHaveValue(activityTitle);
    await expect(page.locator("#guesses")).toHaveValue("5");
  } finally {
    // Clean up: activities first, then the list.
    const sets = await (await page.request.get("/api/activity-sets")).json();
    for (const s of sets.filter((s) => s.title === activityTitle)) {
      await page.request.delete(`/api/activity-sets/${s.id}`);
    }
    await page.request.delete(`/api/word-lists/${list.id}`);
  }
});
