import { test, expect } from "@playwright/test";
import { rgbDistance } from "./color";

// Regression guard: the focus ring must contrast with the button it surrounds.
// The bug was `outline: currentColor` on the invert-primary button — outline
// color equal to the label color, ring invisible against the dark surface.
test("focus ring on /signin submit is not the button's own color", async ({
  page,
}) => {
  await page.goto("/signin");
  const submit = page.getByRole("button", { name: /send me a link/i });
  await expect(submit).toBeVisible();

  // Reach the button by keyboard so :focus-visible applies.
  let focused = false;
  for (let i = 0; i < 25 && !focused; i++) {
    await page.keyboard.press("Tab");
    focused = await submit.evaluate((el) => el === document.activeElement);
  }
  expect(focused, "Tab never reached the submit button").toBe(true);

  const s = await submit.evaluate((el) => {
    const c = getComputedStyle(el);
    return {
      outlineStyle: c.outlineStyle,
      outlineWidth: c.outlineWidth,
      outlineColor: c.outlineColor,
      color: c.color,
    };
  });

  expect(s.outlineStyle).not.toBe("none");
  expect(parseFloat(s.outlineWidth)).toBeGreaterThan(0);
  expect(
    rgbDistance(s.outlineColor, s.color),
    `outline ${s.outlineColor} vs label ${s.color} — near-identical means the ring vanishes`,
  ).toBeGreaterThan(60);
});
