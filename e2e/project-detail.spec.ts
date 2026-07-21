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

// #7 visual refresh: the action row lost its chunky pill buttons. "Visit
// site" is the one filled (invert) element; everything else is a mono
// underlined link, not a bordered/rounded button. Uses the site's own project
// page (public repo + live url) rather than musicforge, whose repo is
// private and would make the GitHub-link assertion flaky.
test("project detail actions row has no pill buttons", async ({ page }) => {
  const res = await page.goto("/projects/selected-projects");
  expect(res?.status()).toBe(200);

  const visit = page.getByRole("link", { name: /visit site/i });
  await expect(visit).toBeVisible();
  await expect(visit).toHaveClass(/bg-invert/);
  await expect(visit).toHaveClass(/font-mono/);

  const github = page.getByRole("link", { name: /code on github/i });
  await expect(github).toBeVisible();
  await expect(github).toHaveClass(/underline/);
  await expect(github).not.toHaveClass(/border/);
  await expect(github).not.toHaveClass(/bg-invert/);

  const touch = page.getByRole("link", { name: /get in touch/i });
  await expect(touch).toBeVisible();
  await expect(touch).toHaveClass(/underline/);
  await expect(touch).not.toHaveClass(/border/);
});
