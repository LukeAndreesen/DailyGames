import { expect, test } from "@playwright/test";

test("renders the daily scoreboard without horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Daily leaderboard" })).toBeVisible();
  await expect(page.getByText("GeoHistory", { exact: true })).toBeVisible();
  await expect(page.getByText("GeoSports", { exact: true })).toBeVisible();
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
  await expect(page.getByRole("heading", { name: "Elo over time" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Elo rating over time chart" })).toBeVisible();
  await page.getByRole("link", { name: /GeoHistory/ }).first().click();
  await expect(page).toHaveURL(/\/games\/geohistory$/);
});

test("shows every player's Elo history together on the leaderboard", async ({ page }) => {
  await page.goto("/leaderboard");
  await expect(page.getByRole("heading", { name: "Everyone's Elo over time" })).toBeVisible();
  await expect(page.getByRole("img", { name: "All players Elo over time chart" })).toBeVisible();
  const legend = page.getByRole("list", { name: "Player color legend" });
  await expect(legend).toBeVisible();
  await expect(legend.getByText("Alex", { exact: true })).toBeVisible();
  await expect(legend.getByText("Gray", { exact: true })).toBeVisible();
  const legendItems = legend.getByRole("listitem");
  await expect(legendItems).toHaveCount(7);
  const colors = await legendItems.locator("span").evaluateAll((dots) =>
    dots.map((dot) => getComputedStyle(dot).backgroundColor),
  );
  expect(new Set(colors).size).toBe(colors.length);
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
