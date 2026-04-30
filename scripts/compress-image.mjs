#!/usr/bin/env node
import sharp from "sharp";
import { readdirSync } from "node:fs";
import path from "node:path";

const slug = process.argv[2];
const maxWidth = Number(process.argv[3] ?? 2000);
const quality = Number(process.argv[4] ?? 85);

if (!slug) {
  console.error(
    "Usage: node scripts/compress-image.mjs <slug> [maxWidth=2000] [quality=85]\n" +
      "Reads assets/originals/<slug>.<ext> and writes public/<slug>.jpg",
  );
  process.exit(1);
}

const originalsDir = "assets/originals";
const exts = ["jpg", "jpeg", "png", "heic", "heif", "webp", "tif", "tiff", "avif"];

const match = readdirSync(originalsDir).find((f) => {
  const { name, ext } = path.parse(f);
  return name === slug && exts.includes(ext.slice(1).toLowerCase());
});

if (!match) {
  console.error(
    `No source found at ${originalsDir}/${slug}.{${exts.join(",")}}`,
  );
  process.exit(1);
}

const input = path.join(originalsDir, match);
const output = path.join("public", `${slug}.jpg`);

const info = await sharp(input)
  .rotate()
  .resize({ width: maxWidth, withoutEnlargement: true })
  .jpeg({ quality })
  .toFile(output);

console.log(
  `${input} → ${output} (${(info.size / 1024).toFixed(0)} KB, ${info.width}×${info.height})`,
);
