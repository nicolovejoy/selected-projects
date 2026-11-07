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

// The action row uses the home hero's button style: "Visit site" is the one
// filled (neutral-900) button; the rest are bordered 2px-radius buttons, never
// pills.
test("project detail actions row has no pill buttons", async ({ page }) => {
  const res = await page.goto("/projects/selected-projects");
  expect(res?.status()).toBe(200);

  const visit = page.getByRole("link", { name: /visit site/i });
  await expect(visit).toBeVisible();
  await expect(visit).toHaveClass(/bg-neutral-900/);
  await expect(visit).toHaveClass(/rounded-\[2px\]/);
  await expect(visit).not.toHaveClass(/rounded-(md|lg|xl|full)/);

  const github = page.getByRole("link", { name: /code on github/i });
  await expect(github).toBeVisible();
  await expect(github).toHaveClass(/border/);
  await expect(github).toHaveClass(/rounded-\[2px\]/);
  await expect(github).not.toHaveClass(/bg-neutral-900/);

  const touch = page.getByRole("link", { name: /get in touch/i });
  await expect(touch).toBeVisible();
  await expect(touch).toHaveClass(/border/);
  await expect(touch).not.toHaveClass(/bg-neutral-900/);
});

test("project header is one summary sentence line, not a mono strip", async ({ page }) => {
  await page.goto("/projects/musicforge");
  await expect(page.getByText(/^Music, \w+\./).first()).toBeVisible();
  await expect(page.getByText(/^Music, \w+\./).first()).toContainText("Latest write-up week of");
});
