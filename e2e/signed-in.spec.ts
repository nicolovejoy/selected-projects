import { test, expect } from "@playwright/test";
import { SEED_USER, STORAGE_STATE } from "./auth";

/**
 * Everything session-dependent, asserted in both states. The whole suite ran
 * anonymous until now, so the signed-in half of each branch was unverified —
 * which is exactly the half a static-shell/PPR restructure puts at risk. Each
 * pair is here so a change can't silently flip one state without failing.
 */

test.describe("signed in", () => {
  test.use({ storageState: STORAGE_STATE });

  test("nav shows the session chip and a sign-out control", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header");
    await expect(nav.getByText(SEED_USER.name)).toBeVisible();
    await expect(nav.getByRole("button", { name: "sign out" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "sign in", exact: true })).toHaveCount(0);
  });

  test("lessons renders the full body", async ({ page }) => {
    await page.goto("/vibe-coding-lessons");
    await expect(page.getByRole("heading", { name: /Plan before you code/ })).toBeVisible();
    await expect(page.getByText("Read all fourteen")).toHaveCount(0);
  });

  test("connect skips the name and email fields", async ({ page }) => {
    await page.goto("/connect");
    await expect(page.getByText(SEED_USER.email)).toBeVisible();
    await expect(page.getByLabel("Name")).toHaveCount(0);
    await expect(page.getByLabel("Email")).toHaveCount(0);
  });

  test("project detail shows follow state as a real control", async ({ page }) => {
    await page.goto("/projects/musicforge");
    // seed-dev.mjs has seed-user-dev already following musicforge.
    await expect(page.getByRole("button", { name: /following/ })).toBeVisible();
  });

  test("follow round-trip updates without a manual reload", async ({ page }) => {
    // prntd, not musicforge: seed-user-dev doesn't follow it (seed-dev.mjs), and
    // the suite runs fullyParallel, so this test can't share a project with the
    // "already following" test above without racing its assertions.
    await page.goto("/projects/prntd");
    const button = page.getByRole("button", { name: "follow" });
    await expect(button).toBeVisible();

    // The button is a <form action={followAction}> submit button, so a
    // pre-hydration click still works as a native form POST — no click-retry
    // helper is needed here (unlike the bare <button> case in
    // live-preview.spec.ts). We assert state after each click rather than
    // retrying the click itself, so a slow hydration can't cause a double
    // toggle that flips the state back.
    await button.click();
    const following = page.getByRole("button", { name: /following/ });
    await expect(following).toBeVisible();

    await following.click();
    await expect(page.getByRole("button", { name: "follow" })).toBeVisible();
  });
});

test.describe("signed out", () => {
  test("nav shows a sign-in link", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header");
    await expect(nav.getByRole("link", { name: "sign in", exact: true })).toBeVisible();
    await expect(nav.getByRole("button", { name: "sign out" })).toHaveCount(0);
    await expect(nav.getByText(SEED_USER.name)).toHaveCount(0);
  });

  test("lessons is gated to a teaser", async ({ page }) => {
    await page.goto("/vibe-coding-lessons");
    await expect(page.getByText("Read all fourteen")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Plan before you code/ })).toHaveCount(0);
  });

  test("connect asks for name and email", async ({ page }) => {
    await page.goto("/connect");
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("project detail sends anonymous readers to sign-in to follow", async ({ page }) => {
    await page.goto("/projects/musicforge");
    const follow = page.getByRole("link", { name: "follow" });
    await expect(follow).toBeVisible();
    await expect(follow).toHaveAttribute("href", "/signin");
  });
});
