# Site-family alignment with the recordings catalog

Left 2026-07-19 by a split-recording session (Nico-approved). The band-recordings
catalog (https://recordings.pianohouseproject.org, repo `~/src/split-recording`,
site file `backend/catalog_site/index.html`) is being redesigned to feel like a
sibling of this site. The catalog side adopts this site's editorial language;
this file is the work list for meeting it halfway. Chosen direction mockup:
https://claude.ai/code/artifact/6d068ff1-7478-4218-a904-4125e0f1b72a

## Work list (this repo)

1. **Extract a token layer** in `app/globals.css` — CSS custom properties the
   catalog transcribes verbatim into its inline `<style>`:
   - `--surface: #ffffff`
   - `--surface-tint: #fafafa` (neutral-50)
   - `--border: #e5e5e5` (neutral-200)
   - `--border-hover: #d4d4d4` (neutral-300)
   - `--text: #171717` (neutral-900)
   - `--text-muted: #525252` (neutral-600)
   - `--text-faint: #a3a3a3` (neutral-400)
   - `--accent-invert: #171717` + `--accent-invert-fg: #ffffff`
   Route existing inline Tailwind neutral literals through these (or map them in
   `@theme` so utility classes resolve to the vars).
2. **Add dark mode** over those tokens (`prefers-color-scheme` + optional
   `data-theme` override). The catalog is already auto dark/light; this site
   being light-only is the biggest family mismatch. Keep the ramp hueless.
3. **Add `:focus-visible` styling** — shared spec: `outline: 2px solid
   currentColor; outline-offset: 2px` on all interactive elements. (Currently
   absent here; a11y gap.)
4. **Formalize the mono micro-label idiom** as a named utility/component:
   ui-monospace, 10–11px, uppercase, `letter-spacing: 0.14em`,
   `color: var(--text-faint)`. Already used ad hoc (card status rows, footer
   stamp); the catalog uses the same spec.

## Shared idiom (already common, keep)

- Serif display headings (Newsreader here; catalog embeds/falls back), sans
  body, mono micro-labels — three-role type system.
- Invert-primary as the single loud gesture (near-black button, flips in dark).
- Hairline 1px borders, 12px card radius, hover lifts border color only.
- Wordmark lockup "the **piano house** …" (bold middle word); mono footer stamp.

Legitimately different: audio transport/player chrome (catalog-only), auth,
notes, OG previews, contribution calendars (this repo only).
