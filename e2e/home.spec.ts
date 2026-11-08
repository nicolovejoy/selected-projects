import { test, expect } from "@playwright/test";

test("home renders the claim and the four featured projects in order", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);

  await expect(
    page.getByRole("heading", { level: 1, name: "Nico’s agentic coding projects" }),
  ).toBeVisible();

  const names = page.locator("main a.group .font-serif");
  await expect(names).toHaveText(["PRNTD", "Tideline", "Prompt Lab", "anomatom"]);

  const firstRow = page.locator("main table tbody tr").first();
  await expect(firstRow.getByRole("link", { name: "Split Recording" })).toBeVisible();

  await expect(page.getByRole("heading", { level: 2, name: "other projects", exact: true })).toBeVisible();
  const rows = page.locator("main table tbody tr");
  const count = await rows.count();
  await expect(rows.nth(count - 2).getByRole("link", { name: "Rock Sculpture" })).toBeVisible();
  await expect(rows.nth(count - 1).getByRole("link", { name: "Selected Projects" })).toBeVisible();
  await expect(page.getByText("Also here")).toHaveCount(0);

  for (const label of ["Music", "Art", "Products", "Tools"]) {
    await expect(page.getByRole("heading", { level: 2, name: label, exact: true })).toHaveCount(0);
  }
});

test("a project name in the table links to its detail page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "MusicForge", exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/musicforge$/);
  await expect(page.getByRole("heading", { level: 1, name: /musicforge/i })).toBeVisible();
});

test("the claim and Get in touch sit above the fold on an iPhone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const loc of [
    page.getByRole("heading", { level: 1 }),
    page.getByRole("link", { name: "Get in touch" }),
  ]) {
    const box = await loc.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  }
});

test("the contribution calendar shows when a GitHub token is configured", async ({ page }) => {
  test.skip(!process.env.GITHUB_TOKEN, "GITHUB_TOKEN unset: calendar is omitted by design");
  await page.goto("/");
  await expect(page.locator('main figure [role="img"]')).toBeVisible();
});
