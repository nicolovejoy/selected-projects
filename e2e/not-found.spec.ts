import { test, expect } from "@playwright/test";

// #36: unknown category paths and project slugs answer a real 404 (not a
// 200 + noindex soft 404), with the site chrome; real ones are unaffected.
for (const path of ["/nope", "/projects/nope", "/fr/nope", "/fr/projects/nope"]) {
  test(`${path} is a true 404 with site chrome`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/could not be found/i);
    await expect(page.getByRole("link", { name: /the piano house project/i }).first()).toBeVisible();
  });
}

for (const path of ["/music", "/fr/products", "/projects/tideline", "/fr/projects/ibuild4you"]) {
  test(`${path} still renders (200)`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}
