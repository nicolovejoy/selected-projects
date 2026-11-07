import { test, expect } from "@playwright/test";

// Category pages list projects as rows in the home table's idiom: borders
// between rows, no outer card. Split Recording has no published weekly rollup
// and no public url; lib/feed.ts treats rollups as optional enrichment, so its
// row must still render.
test("music feed renders bordered rows, including the rollup-less Split Recording row", async ({
  page,
}) => {
  const res = await page.goto("/music");
  expect(res?.status()).toBe(200);

  const musicforge = page.getByRole("heading", { name: "MusicForge", level: 3 });
  const splitRecording = page.getByRole("heading", { name: "Split Recording", level: 3 });
  await expect(musicforge).toBeVisible();
  await expect(splitRecording).toBeVisible();

  const list = page.locator("ul").filter({ has: musicforge });
  await expect(list).toHaveCount(1);
  // No bordered, rounded card wrapper around the list.
  await expect(list).not.toHaveClass(/rounded/);
  await expect(list).not.toHaveClass(/overflow-hidden/);

  const rows = list.locator("> li");
  expect(await rows.count()).toBeGreaterThan(1);
  for (const row of await rows.all()) {
    await expect(row).toHaveClass(/border-b/);
    await expect(row).not.toHaveClass(/rounded/);
  }

  await expect(page.getByText(/no rollup published/i)).toHaveCount(0);

  const mfRow = rows.filter({ has: musicforge });
  const srRow = rows.filter({ has: splitRecording });
  await expect(mfRow.getByRole("link", { name: /^visit .+ ↗$/ })).toHaveCount(1);
  await expect(srRow.getByRole("link", { name: /^visit / })).toHaveCount(0);
});
