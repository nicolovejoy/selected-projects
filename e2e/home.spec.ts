import { test, expect } from "@playwright/test";

const CATEGORIES = ["Music", "Art", "Products", "Tools"];

test("home renders all four category quadrants", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);

  await expect(page.getByRole("heading", { name: /what.s cooking/i })).toBeVisible();

  for (const label of CATEGORIES) {
    await expect(page.getByRole("heading", { name: label, exact: true })).toBeVisible();
  }
});

test("all four quadrants sit above the fold on an iPhone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
  await page.goto("/");

  // The real invariant: every quadrant is visible without scrolling. We assert
  // the tiles clear the fold, not that the whole page (footer included) does —
  // a footer peeking just under the fold is normal, and pinning the page to
  // zero scroll fights every legitimately-added project. See PR #10.
  for (const label of CATEGORIES) {
    const tile = page
      .locator("main .grid > div")
      .filter({ has: page.getByText(label, { exact: true }) });
    const box = await tile.first().boundingBox();
    expect(box, `${label} tile should be laid out`).not.toBeNull();
    expect(box!.y + box!.height, `${label} tile should end above the fold`).toBeLessThanOrEqual(844);
  }

  // Stacked single-column on a phone, so names have room and don't truncate.
  const truncated = await page.evaluate(() =>
    [...document.querySelectorAll("main li a.font-medium")].some(
      (el) => el.scrollWidth > el.clientWidth + 1,
    ),
  );
  expect(truncated, "project names should not be cut off on a phone").toBe(false);
});

test("a quadrant links through to its category page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Music — view all" }).click();

  await expect(page).toHaveURL(/\/music$/);
  await expect(page.getByRole("heading", { name: "Music", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /project page/ }).first()).toBeVisible();
});

test("a project name on a quadrant links straight to its detail page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "MusicForge" }).click();

  await expect(page).toHaveURL(/\/projects\/musicforge$/);
  await expect(page.getByRole("heading", { level: 1, name: /musicforge/i })).toBeVisible();
});
