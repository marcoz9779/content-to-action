import { test, expect } from "@playwright/test";

test.describe("New Analysis Page", () => {
  test("loads and displays form", async ({ page }) => {
    await page.goto("/app/new");
    await expect(
      page.getByRole("heading", { name: /Analyze Content/i })
    ).toBeVisible();
  });

  test("shows URL and Upload tabs", async ({ page }) => {
    await page.goto("/app/new");
    await expect(page.getByRole("tab", { name: /Paste URL/i })).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /Upload Video/i })
    ).toBeVisible();
  });

  test("shows URL input by default", async ({ page }) => {
    await page.goto("/app/new");
    await expect(page.getByPlaceholder(/instagram.com/i)).toBeVisible();
  });

  test("switches to upload tab", async ({ page }) => {
    await page.goto("/app/new");
    await page.getByRole("tab", { name: /Upload Video/i }).click();
    await expect(page.getByText(/Drop a video/i)).toBeVisible();
  });

  test("shows optional text inputs", async ({ page }) => {
    await page.goto("/app/new");
    await expect(page.getByLabel(/Caption text/i)).toBeVisible();
    await expect(page.getByLabel(/Comments/i)).toBeVisible();
  });

  test("shows validation error for URL without caption", async ({ page }) => {
    await page.goto("/app/new");
    await page.getByPlaceholder(/instagram.com/i).fill("https://instagram.com/reel/abc123/");
    await page.getByRole("button", { name: /Analyze Content/i }).click();
    await expect(
      page.getByText(/URL processing is limited/i)
    ).toBeVisible();
  });
});
