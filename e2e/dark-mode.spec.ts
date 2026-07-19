import { test, expect } from "@playwright/test";
import { luminance } from "./color";

test.use({ colorScheme: "dark" });

// Regression guard: dark scheme must yield a dark page, not an inverted-light
// one. Asserts actual computed luminance, not class presence.
test("dark mode: body background is dark, text is light", async ({ page }) => {
  await page.goto("/");

  const { bg, fg } = await page.evaluate(() => {
    const s = getComputedStyle(document.body);
    return { bg: s.backgroundColor, fg: s.color };
  });

  expect(luminance(bg), `body background ${bg} should be dark`).toBeLessThan(0.2);
  expect(luminance(fg), `body text ${fg} should be light`).toBeGreaterThan(0.6);
});
