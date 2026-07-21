# Site-family alignment with the recordings catalog

This site and the band-recordings catalog (https://recordings.pianohouseproject.org,
repo `~/src/split-recording`, site file `backend/catalog_site/index.html`) are
deliberately siblings. This file is the shared design contract — what must stay
common, and what is allowed to differ.

The original four-item work list (token layer, dark mode, `:focus-visible`,
mono micro-label) **shipped in PR #8, 2026-07-19**. Direction mockup, for
reference: https://claude.ai/code/artifact/6d068ff1-7478-4218-a904-4125e0f1b72a

## Shared idiom — keep in sync

- **Token layer.** `app/globals.css` defines a hueless `--n-*` ramp mapped into
  `@theme`; the catalog transcribes the same values into its inline `<style>`.
  Names: `--surface`, `--surface-tint`, `--border`, `--border-hover`, `--text`,
  `--text-muted`, `--text-faint`, `--accent-invert` / `--accent-invert-fg`.
- **Auto dark mode** over those tokens (`prefers-color-scheme` plus a
  `data-theme` override that must win in both directions). Keep the ramp hueless.
- **Focus ring:** `outline: 2px solid var(--text); outline-offset: 2px`. Not
  `currentColor` — on an invert button that draws a near-invisible ring.
- **Mono micro-label** (`.mono-label`): ui-monospace, 10–11px, uppercase,
  `letter-spacing: 0.14em`, `color: var(--text-faint)`.
- Serif display headings (Newsreader here; catalog embeds/falls back), sans body,
  mono micro-labels — a three-role type system.
- Invert-primary as the single loud gesture (near-black button, flips in dark).
- Hairline 1px borders, 2px card radius (cut from 12px in the #7 visual
  refresh — the family look is now near-square, ledger-like), hover lifts
  border color / background tint only.
- Wordmark lockup "the **piano house** …" (bold middle word); mono footer stamp.

## Legitimately different

Audio transport/player chrome (catalog only); auth, notes, OG previews, and
GitHub contribution calendars (this repo only).

## Known open

`--text-faint` is 4.18:1 in dark (under AA) and 2.53:1 in light — a pre-existing
token choice, not a dark-mode regression. Where the faint micro-labels belong is
part of issue #7.
