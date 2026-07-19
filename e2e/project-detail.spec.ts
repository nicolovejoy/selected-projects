import { test, expect } from "@playwright/test";

// Real slug from content/projects/musicforge.mdx.
test("project detail page renders title and about section", async ({ page }) => {
  const res = await page.goto("/projects/musicforge");
  expect(res?.status()).toBe(200);

  await expect(
    page.getByRole("heading", { level: 1, name: "MusicForge" }),
  ).toBeVisible();

  const about = page
    .locator("details", { has: page.locator("summary", { hasText: "about" }) })
    .first();
  await expect(about).toHaveAttribute("open", "");
  // Body copy inside the about section actually rendered.
  await expect(about.locator("article")).toContainText(/MusicForge/);
});
