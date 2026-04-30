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

### Home hero

The home hero is driven by `content/heroes.ts`:

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

The `/projects/<slug>` page will render it under the header, above the prose.

## Naming

Use a stable lowercase slug per image (`sunset`, `piano-house`, `studio-night`). Reference it in code as `/<slug>.jpg`. If you replace an image with a different photo, archive the prior original by renaming with a date suffix (e.g. `piano-house-2026-04-29.jpg`) before dropping the replacement.
