import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and displays hero", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Paste short-form content/i })
    ).toBeVisible();
  });

  test("shows supported content types", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Recipes")).toBeVisible();
    await expect(page.getByText("Business")).toBeVisible();
    await expect(page.getByText("DIY")).toBeVisible();
    await expect(page.getByText("Workouts")).toBeVisible();
  });

  test("has working CTA link to analyze page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Start analyzing/i }).click();
    await expect(page).toHaveURL("/app/new");
  });

  test("has navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Analyze/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Saved/i })).toBeVisible();
  });
});
