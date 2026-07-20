# assets/

Local-only working copies of high-resolution image sources. Nothing in `originals/` is committed — git ignores it. The compressed, web-ready copy lives in `public/<slug>.jpg` and is what ships.

## Layout

```
assets/
├── README.md                       (committed)
└── originals/                      (gitignored)
    ├── <slug>.<ext>                hero / general images
    └── projects/
        └── <slug>.<ext>            project screenshots
```

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

### Home hero — currently unused

**Nothing in production renders a hero.** `app/page.tsx` has been the four-quadrant
category grid since 2026-07-19 and never imports `content/heroes.ts`. The tuner and
the registry below still work, and `npm run check` still validates them, but the
output goes nowhere. Read this section as dormant, not live. See AGENTS.md "Still open".

The hero is driven by `content/heroes.ts`:

- Add a `<slug>: { ... }` entry to the `heroes` map with sensible defaults (`startOpacity: 70, midOpacity: 40, midStop: 45, endStop: 85, objectPosition: "right", titleColor: "#171717", subtitleColor: "#404040"`).
- Set `homeHero` to that slug to make it the active hero.
- Run `npm run dev` and open `http://localhost:3000/dev/hero-tune` to drag sliders, eyedrop colors, and copy the tuned values back into `heroes.ts`. The tuner 404s in production.

### Project screenshot

Add an `image` field to the project's MDX frontmatter:

```mdx
export const metadata = {
  name: "MusicForge",
  ...
  image: "/projects/musicforge.jpg",
};
```

This is a *fallback*, not a screenshot slot. `components/og-preview.tsx` resolves the
detail page's preview card as `scraped og:image → project.image → project.cardImage`,
so `image` is only reached when the live site ships no `og:image`. All six project
sites currently do, which is why no MDX file sets `image` today.

## Naming

Use a stable lowercase slug per image (`sunset`, `piano-house`, `studio-night`). Reference it in code as `/<slug>.jpg`. If you replace an image with a different photo, archive the prior original by renaming with a date suffix (e.g. `piano-house-2026-04-29.jpg`) before dropping the replacement.
