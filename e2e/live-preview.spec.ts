import { test, expect, type Page, type Locator } from "@playwright/test";

// #12 split-pane live preview. ibuild4you is embed:true with a real, frameable
// url (probed in the issue — no X-Frame-Options / frame-ancestors). recountly
// has a public url but is intentionally left off the embed allowlist (frames
// fine but redirects to its login screen — low preview value).

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
    await expect(page.getByRole("button", { name: "live preview" })).toBeVisible();

    await page.goto("/projects/recountly");
    await expect(page.getByRole("button", { name: /live preview/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /live preview/i })).toHaveCount(0);
  });

  test("activating sets ?preview=1 and renders the iframe at ~2/3 width with the right src", async ({
    page,
  }) => {
    await page.goto("/projects/ibuild4you");
    await clickAndAwaitUrl(
      page,
      page.getByRole("button", { name: "live preview" }),
      /\?preview=1$/,
    );

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

  test("the close control and Esc both return to the normal layout", async ({ page }) => {
    // Deep link straight into the open state.
    await page.goto("/projects/ibuild4you?preview=1");
    const iframe = page.locator('iframe[title="live preview of iBuild4You"]');
    await expect(iframe).toBeVisible();

    await clickAndAwaitUrl(
      page,
      page.getByRole("button", { name: "close preview" }),
      /\/projects\/ibuild4you$/,
    );
    await expect(iframe).toHaveCount(0);

    // Re-open, this time close via Esc.
    await clickAndAwaitUrl(
      page,
      page.getByRole("button", { name: "live preview" }),
      /\?preview=1$/,
    );
    await expect(iframe).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/projects\/ibuild4you$/);
    await expect(iframe).toHaveCount(0);
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

test("non-embed projects show no live preview action", async ({ page }) => {
  const res = await page.goto("/projects/recountly");
  expect(res?.status()).toBe(200);
  await expect(page.getByText(/live preview/i)).toHaveCount(0);
});
