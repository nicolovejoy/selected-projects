# assets/

Local-only working copies of high-resolution image sources. Nothing in `originals/` is committed — git ignores it. The compressed, web-ready copy lives in `public/<slug>.jpg` and is what ships.

## Layout

```
assets/
├── README.md                       (committed)
└── originals/                      (gitignored)
    └── <slug>.<ext>                drop high-res sources here
```

Common extensions accepted: `jpg`, `jpeg`, `png`, `heic`, `heif`, `webp`, `tif`, `tiff`, `avif`.

## Workflow

1. Drop the high-res source at `assets/originals/<slug>.<ext>`.
2. Compress and write the web copy:

   ```
   node scripts/compress-image.mjs <slug>
   ```

   Defaults: 2000px wide, JPEG quality 85. Override with positional args:

   ```
   node scripts/compress-image.mjs <slug> 1600 80
   ```

3. The script writes `public/<slug>.jpg`. Commit that.

## Naming

Use a stable lowercase slug per image (`sunset`, `piano-house`, `studio-night`). Reference it in code as `/<slug>.jpg`. If you replace an image with a different photo, archive the prior original by renaming with a date suffix (e.g. `piano-house-2026-04-29.jpg`) before dropping the replacement.
