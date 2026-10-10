import { test, expect } from "@playwright/test";

// French mirror under /fr: separate root layout (lang="fr"), French chrome and
// copy, links stay inside /fr, and the toggle maps each page to its twin.

test("English pages keep lang=en and offer a FR toggle to the same page", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const toggle = page.getByRole("link", { name: "Lire en français" });
  await expect(toggle).toHaveAttribute("href", "/fr/about");
});

test("French home renders in French with French nav links", async ({ page }) => {
  const res = await page.goto("/fr");
  expect(res?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ce qui mijote");

  const nav = page.locator("header");
  await expect(nav.getByRole("link", { name: "à propos" })).toHaveAttribute("href", "/fr/about");
  await expect(nav.getByRole("link", { name: "principes" })).toHaveAttribute("href", "/fr/tenets");
  await expect(page.getByText("Traduit de l’anglais par Claude.")).toBeVisible();
});

test("French project page shows the translated body and localized chrome", async ({ page }) => {
  await page.goto("/fr/projects/musicforge");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.getByRole("heading", { name: "MusicForge", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "← Tous les projets" })).toHaveAttribute("href", "/fr");
  await expect(page.getByText("à propos", { exact: true }).first()).toBeVisible();
  await expect(page.locator("article")).toContainText("partitions");

  const toggle = page.getByRole("link", { name: "Read in English" }).first();
  await expect(toggle).toHaveAttribute("href", "/projects/musicforge");
});

test("French category page links into French project pages", async ({ page }) => {
  await page.goto("/fr/music");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Musique");
  const row = page.getByRole("link", { name: "MusicForge — page du projet" });
  await expect(row).toHaveAttribute("href", "/fr/projects/musicforge");
});

test("French connect form labels are French", async ({ page }) => {
  await page.goto("/fr/connect");
  await expect(page.getByLabel("Nom")).toBeVisible();
  await expect(page.getByRole("button", { name: "Envoyer" })).toBeVisible();
});

test("unmatched URLs get the site 404 with chrome", async ({ page }) => {
  const res = await page.goto("/no/such/page");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
  await expect(page.locator("header")).toBeVisible();
});
