import { test, expect } from "@playwright/test";

// #7 visual refresh: the feed became a single bordered ledger of row-cards
// (no per-card borders/radius). Songscribe has no published weekly rollup —
// lib/feed.ts treats rollups as optional enrichment, so its row must still
// render with the "no rollup published" fallback rather than disappearing.
test("music feed renders as one bordered ledger, including the rollup-less songscribe row", async ({
  page,
}) => {
  const res = await page.goto("/music");
  expect(res?.status()).toBe(200);

  const musicforge = page.getByRole("heading", { name: "MusicForge", level: 3 });
  const songscribe = page.getByRole("heading", { name: "Songscribe", level: 3 });
  await expect(musicforge).toBeVisible();
  await expect(songscribe).toBeVisible();

  const ledger = page.locator("ul").filter({ has: musicforge });
  await expect(ledger).toHaveCount(1);
  await expect(ledger).toHaveClass(/border/);
  await expect(ledger).toHaveClass(/overflow-hidden/);

  // Rows are plain <li> grid items inside the one ledger, not individually
  // bordered/rounded cards.
  const rows = ledger.locator("> li");
  expect(await rows.count()).toBeGreaterThan(1);
  const rowClass = await rows.first().getAttribute("class");
  expect(rowClass).not.toMatch(/rounded-xl/);

  await expect(page.getByText("no rollup published")).toBeVisible();
});
