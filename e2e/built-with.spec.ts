import { test, expect } from "@playwright/test";

function section(page: import("@playwright/test").Page, title: string) {
  return page
    .locator("details", { has: page.locator("summary", { hasText: title }) })
    .first();
}

test("ibuild4you page lists the projects built with it", async ({ page }) => {
  const res = await page.goto("/projects/ibuild4you");
  expect(res?.status()).toBe(200);

  const built = section(page, "built with iBuild4You");
  await expect(built).toHaveAttribute("open", "");
  await expect(built.getByRole("link", { name: /Tideline/ }).first()).toHaveAttribute(
    "href",
    "/projects/tideline",
  );
  await expect(built.getByRole("link", { name: /Bakery Louise/ }).first()).toHaveAttribute(
    "href",
    "/projects/bakerylouise",
  );
});

test("French ibuild4you page lists them under the French title", async ({ page }) => {
  const res = await page.goto("/fr/projects/ibuild4you");
  expect(res?.status()).toBe(200);

  const built = section(page, "réalisé avec iBuild4You");
  await expect(built).toHaveAttribute("open", "");
  await expect(built.getByRole("link", { name: /Tideline/ }).first()).toHaveAttribute(
    "href",
    "/fr/projects/tideline",
  );
  await expect(built.getByRole("link", { name: /Bakery Louise/ }).first()).toHaveAttribute(
    "href",
    "/fr/projects/bakerylouise",
  );
});

test("flagged project header links back to ibuild4you", async ({ page }) => {
  await page.goto("/projects/tideline");
  await expect(
    page.getByRole("link", { name: "built with iBuild4You" }),
  ).toHaveAttribute("href", "/projects/ibuild4you");
});

test("unflagged project has no built-with label or section", async ({ page }) => {
  await page.goto("/projects/musicforge");
  await expect(page.getByRole("heading", { level: 1, name: "MusicForge" })).toBeVisible();
  await expect(page.getByRole("link", { name: "built with iBuild4You" })).toHaveCount(0);
  await expect(page.getByText("built with iBuild4You")).toHaveCount(0);
});
