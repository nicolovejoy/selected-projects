import { test, expect } from "@playwright/test";

test("home renders heading and at least one project card", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);

  await expect(
    page.getByRole("heading", { name: /what.s cooking/i }),
  ).toBeVisible();

  // Feed cards link to detail pages via aria-label "<name> — project page".
  // Requires the prompt-lab public history API to be reachable — the feed
  // drops projects without rollups, so no network means no cards.
  await expect(
    page.getByRole("link", { name: /project page/ }).first(),
  ).toBeVisible();
});
