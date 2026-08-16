import { expect, test } from "@playwright/test";

test("renders the daily scoreboard without horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Daily leaderboard" })).toBeVisible();
  await expect(page.getByText("GeoHistory", { exact: true })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});

test("navigates between day, game, and player views", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /GeoHistory/ }).first().click();
  await expect(page.getByRole("heading", { name: "GeoHistory" })).toBeVisible();
  await page.getByRole("link", { name: /Alex/ }).first().click();
  await expect(page.getByRole("heading", { name: "Alex" })).toBeVisible();
  await page.getByRole("link", { name: /GeoHistory/ }).first().click();
  await expect(page).toHaveURL(/\/games\/geohistory$/);
});

test("does not render phone numbers or raw messages", async ({ page }) => {
  await page.goto("/");
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(/\+1\d{10}/);
  expect(body).not.toContain("www.geohistory.gg");
});

test("rejects ingestion without the server secret", async ({ request }) => {
  const response = await request.post("/api/ingest", { data: {} });
  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "UNAUTHORIZED" });
});
