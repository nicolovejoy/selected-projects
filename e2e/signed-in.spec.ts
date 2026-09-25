import { test, expect, type Locator } from "@playwright/test";
import { SEED_USER, STORAGE_STATE } from "./auth";

/**
 * Everything session-dependent, asserted in both states. The whole suite ran
 * anonymous until now, so the signed-in half of each branch was unverified —
 * which is exactly the half a static-shell/PPR restructure puts at risk. Each
 * pair is here so a change can't silently flip one state without failing.
 */

/**
 * A click that lands before hydration still works (these are real
 * <form action={...}> submit buttons — a native form POST shows the new
 * state on its own, whether or not refresh() ran), so a test that clicks
 * immediately can pass even if refresh() is broken. React attaches its own
 * internal props key (`__reactProps$...`) to a DOM node only once hydration
 * wires up that node's event handlers, so polling for that key is a direct
 * hydration signal rather than a timing proxy like networkidle.
 */
async function waitForHydration(locator: Locator): Promise<void> {
  await locator.evaluate((el) => {
    return new Promise<void>((resolve) => {
      const check = () => {
        if (Object.keys(el).some((k) => k.startsWith("__reactProps$"))) resolve();
        else requestAnimationFrame(check);
      };
      check();
    });
  });
}

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
    // Wait for hydration before the first click — see waitForHydration's doc
    // comment: a pre-hydration click still flips the button via the native
    // form POST, which would mask a broken refresh() call.
    await waitForHydration(button);

    // We assert state after each click rather than retrying the click itself
    // (unlike live-preview.spec.ts's bare-<button> case), so a slow hydration
    // can't cause a double toggle that flips the state back.
    try {
      await button.click();
      const following = page.getByRole("button", { name: /following/ });
      await expect(following).toBeVisible();

      await following.click();
      await expect(page.getByRole("button", { name: "follow" })).toBeVisible();
    } finally {
      // Restore the unfollowed state even if an assertion above failed mid-toggle.
      const stillFollowing = page.getByRole("button", { name: /following/ });
      if (await stillFollowing.isVisible().catch(() => false)) {
        await stillFollowing.click();
        await expect(page.getByRole("button", { name: "follow" })).toBeVisible();
      }
    }
  });

  test("note post/delete round-trip updates without a manual reload", async ({ page }) => {
    // songscribe: distinct from prntd/musicforge (used by the follow tests above)
    // and from any other project a parallel test posts to, so this test can't
    // collide with another under fullyParallel. Rate limit is 5 notes/hour/user
    // (app/projects/[slug]/actions.ts) — this test posts exactly 1.
    await page.goto("/projects/songscribe");
    // "notes" is a native <details>/<summary> section, collapsed by default
    // (only "about" defaults open) — expand it before touching the form.
    await page.getByRole("heading", { name: "notes" }).click();

    const body = `e2e note ${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const textarea = page.getByPlaceholder("Add a note…");
    await expect(textarea).toBeVisible();
    const postButton = page.getByRole("button", { name: "Post" });
    await waitForHydration(postButton);

    await textarea.fill(body);
    await postButton.click();

    const note = page.getByText(body, { exact: true });
    try {
      await expect(note).toBeVisible();

      const noteItem = page.locator("li", { has: note });
      const deleteButton = noteItem.getByRole("button", { name: "delete" });
      await waitForHydration(deleteButton);
      await deleteButton.click();
      await expect(note).toHaveCount(0);
    } finally {
      // Cleanup: if the note is still there (e.g. the delete assertion
      // above failed), remove it so it doesn't linger across runs.
      if (await note.isVisible().catch(() => false)) {
        const noteItem = page.locator("li", { has: note });
        const deleteButton = noteItem.getByRole("button", { name: "delete" });
        if (await deleteButton.isVisible().catch(() => false)) {
          await deleteButton.click();
          await expect(note).toHaveCount(0);
        }
      }
    }
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
