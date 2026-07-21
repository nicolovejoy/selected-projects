# assets/

Local-only working copies of high-resolution image sources. Nothing in `originals/` is committed — git ignores it. The compressed, web-ready copy lives in `public/<slug>.jpg` and is what ships.

## Layout

```
assets/
├── README.md                       (committed)
└── originals/                      (gitignored)
    ├── <slug>.<ext>                hero / general images
    ├── projects/
    │   └── <slug>.<ext>            project screenshots (legacy `image` field)
    └── cards/
        └── <slug>.<ext>            curated card images (`cardImage` field)
```

Web-ready copies land at `public/<slug>.jpg`, `public/projects/<slug>.jpg`, and `public/cards/<slug>.jpg` respectively — same subpath, mirrored from `originals/` into `public/`.

Common extensions accepted: `jpg`, `jpeg`, `png`, `heic`, `heif`, `webp`, `tif`, `tiff`, `avif`.

## Add or replace an image

1. Drop the high-res source at `assets/originals/<slug>.<ext>` (or `assets/originals/projects/<slug>.<ext>` for project screenshots).
2. Compress and write the web copy:

   ```
   node scripts/compress-image.mjs <slug>
   ```

   For a project screenshot, pass the subpath:

   ```
   node scripts/compress-image.mjs projects/musicforge
   ```

   Defaults: 2000px wide, JPEG quality 85. Override with positional args:

   ```
   node scripts/compress-image.mjs <slug> 1600 80
   ```

3. The script writes `public/<slug>.jpg` (creating subdirectories as needed). Commit that.

## Use the image on a page

> **The home hero is gone.** `app/page.tsx` became the four-quadrant category grid
> in PR #9 (2026-07-19) and stopped rendering a hero; the registry, the
> `/dev/hero-tune` tuner, and `public/sunset.jpg` were deleted in `81a4eaa`'s
> follow-up once that was confirmed. Recover from git history if a hero returns.

### Curated card image

For a project whose live site has no useful `og:image` (private repo, no public
URL, or a scrape that isn't worth showing), drop a curated shot at
`public/cards/<slug>.<ext>` and reference it as `cardImage` in the project's MDX
frontmatter:

```mdx
export const metadata = {
  name: "MusicForge",
  ...
  cardImage: "/cards/musicforge.jpg",
};
```

Source and compress the same way as any other image, using the `cards/` subpath:

```
node scripts/compress-image.mjs cards/musicforge
```

Target 1200×630 (the OG aspect ratio both the feed cards and the detail-page
preview crop to).

`cardImage` always wins. Card image precedence, resolved in `lib/feed.ts` and
`components/og-preview.tsx`: **`cardImage` (curated) → scraped `og:image` (live
site) → `image` (legacy fallback) → nothing rendered.** `image` predates
`cardImage` and is only reached when neither of the first two exists — no MDX
file sets it today.

## Naming

Use a stable lowercase slug per image (`sunset`, `piano-house`, `studio-night`). Reference it in code as `/<slug>.jpg`. If you replace an image with a different photo, archive the prior original by renaming with a date suffix (e.g. `piano-house-2026-04-29.jpg`) before dropping the replacement.
