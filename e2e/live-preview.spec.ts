import { test, expect, type Page, type Locator } from "@playwright/test";

// #12 split-pane live preview. ibuild4you is embed:true with a real, frameable
// url (probed in the issue — no X-Frame-Options / frame-ancestors). raconte
// is a native app with no public url, so it never gets a preview action.

// The trigger is a plain <button> (no href fallback), so a click that lands
// before React finishes hydrating is silently swallowed — Playwright's
// actionability checks confirm the DOM node is clickable, not that its
// listener is attached yet. Retry the click until the URL actually moves,
// rather than trusting a single click or padding with a fixed wait.
async function clickAndAwaitUrl(page: Page, button: Locator, urlPattern: RegExp) {
  await expect(async () => {
    await button.click();
    await expect(page).toHaveURL(urlPattern, { timeout: 500 });
  }).toPass({ timeout: 5000 });
}

test.describe("live preview — desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("action present only for embed-enabled projects", async ({ page }) => {
    await page.goto("/projects/ibuild4you");
    // Open by default, so the toggle reads "close preview".
    await expect(page.getByRole("button", { name: "close preview" })).toBeVisible();

    await page.goto("/projects/raconte");
    await expect(page.getByRole("button", { name: /preview/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /live preview/i })).toHaveCount(0);
  });

  test("embed projects open split by default: iframe at ~2/3 width with the right src", async ({
    page,
  }) => {
    await page.goto("/projects/ibuild4you");

    // Assert the src attribute rather than waiting for cross-origin load —
    // that's flaky in CI (see issue #12's test plan).
    const iframe = page.locator('iframe[title="live preview of iBuild4You"]');
    await expect(iframe).toHaveAttribute("src", "https://ibuild4you.com");

    const box = await iframe.boundingBox();
    expect(box, "iframe should be laid out").not.toBeNull();
    const ratio = box!.width / 1440;
    expect(ratio).toBeGreaterThan(0.55);
    expect(ratio).toBeLessThan(0.75);
  });

  test("the close control and Esc both close it; the toggle reopens it", async ({ page }) => {
    await page.goto("/projects/ibuild4you");
    const iframe = page.locator('iframe[title="live preview of iBuild4You"]');
    await expect(iframe).toBeVisible();

    await clickAndAwaitUrl(
      page,
      page.getByRole("button", { name: "close preview" }),
      /\?preview=0$/,
    );
    await expect(iframe).toHaveCount(0);

    // Reopen: back to the bare path.
    await clickAndAwaitUrl(
      page,
      page.getByRole("button", { name: "live preview" }),
      /\/projects\/ibuild4you$/,
    );
    await expect(iframe).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\?preview=0$/);
    await expect(iframe).toHaveCount(0);
  });

  test("home tiles invite the preview for embed projects only", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: "iBuild4You — live preview" });
    await expect(link).toHaveAttribute("href", "/projects/ibuild4you");
    await expect(page.getByRole("link", { name: "Raconte — live preview" })).toHaveCount(0);

    await link.click();
    await expect(page).toHaveURL(/\/projects\/ibuild4you$/);
    await expect(page.locator('iframe[title="live preview of iBuild4You"]')).toBeVisible();
  });
});

test.describe("live preview — phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("no split; the action is a plain external link", async ({ page }) => {
    await page.goto("/projects/ibuild4you");

    const link = page.getByRole("link", { name: /live preview/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "https://ibuild4you.com");
    await expect(link).toHaveAttribute("target", "_blank");

    await expect(page.getByRole("button", { name: /live preview/i })).toHaveCount(0);
    await expect(page.locator("iframe")).toHaveCount(0);
  });
});

test.describe("live preview — phone home", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the tile button goes straight to the live site", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: "iBuild4You — live preview" });
    await expect(link).toHaveAttribute("href", "https://ibuild4you.com");
    await expect(link).toHaveAttribute("target", "_blank");
  });
});

test("non-embed projects show no live preview action", async ({ page }) => {
  const res = await page.goto("/projects/raconte");
  expect(res?.status()).toBe(200);
  await expect(page.getByText(/live preview/i)).toHaveCount(0);
});
