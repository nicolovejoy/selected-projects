#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const ALLOWED_STATUS = new Set(["live", "beta", "alpha", "demo", "concept"]);
const errors = [];
const expect = (cond, msg) => {
  if (!cond) errors.push(msg);
};

const projectsDir = "content/projects";
const projectFiles = readdirSync(projectsDir).filter((f) => f.endsWith(".mdx"));

for (const file of projectFiles) {
  const fullPath = path.join(projectsDir, file);
  const slug = path.parse(file).name;
  const text = readFileSync(fullPath, "utf8");
  const match = text.match(/export const metadata = (\{[\s\S]*?\n\});/);
  if (!match) {
    errors.push(`${fullPath}: no metadata export found`);
    continue;
  }
  let meta;
  try {
    meta = (0, eval)(`(${match[1]})`);
  } catch (err) {
    errors.push(`${fullPath}: failed to parse metadata (${err.message})`);
    continue;
  }
  expect(typeof meta.name === "string" && meta.name, `${fullPath}: missing metadata.name`);
  expect(typeof meta.tagline === "string" && meta.tagline, `${fullPath}: missing metadata.tagline`);
  expect(typeof meta.status === "string" && meta.status, `${fullPath}: missing metadata.status`);
  if (meta.status) {
    expect(
      ALLOWED_STATUS.has(meta.status),
      `${fullPath}: status "${meta.status}" not in {${[...ALLOWED_STATUS].join(", ")}}`,
    );
  }
  if (meta.image !== undefined) {
    expect(
      typeof meta.image === "string" && meta.image.startsWith("/"),
      `${fullPath}: image "${meta.image}" must start with "/"`,
    );
    if (typeof meta.image === "string") {
      const imagePath = path.join("public", meta.image.replace(/^\//, ""));
      expect(existsSync(imagePath), `${fullPath}: image "${meta.image}" not found at ${imagePath}`);
    }
  }
  if (meta.url !== undefined) {
    expect(
      typeof meta.url === "string" && /^https?:\/\//.test(meta.url),
      `${fullPath}: url "${meta.url}" must start with http(s)://`,
    );
  }
}

const projectsRegistry = readFileSync("lib/projects.ts", "utf8");
for (const file of projectFiles) {
  const slug = path.parse(file).name;
  expect(
    projectsRegistry.includes(`@/content/projects/${slug}.mdx`),
    `lib/projects.ts: missing import for "${slug}.mdx"`,
  );
}

const heroesSource = readFileSync("content/heroes.ts", "utf8");
const heroesBlock = heroesSource.match(/export const heroes = (\{[\s\S]*?\n\}) satisfies/);
let heroSlugs = [];
if (!heroesBlock) {
  errors.push("content/heroes.ts: could not parse `heroes` export");
} else {
  heroSlugs = [...heroesBlock[1].matchAll(/^\s{2}(["']?)([\w-]+)\1:\s*\{/gm)].map((m) => m[2]);
  for (const slug of heroSlugs) {
    const imagePath = path.join("public", `${slug}.jpg`);
    expect(existsSync(imagePath), `content/heroes.ts: hero "${slug}" has no image at ${imagePath}`);
  }
}

const homeHeroMatch = heroesSource.match(/export const homeHero[^=]*=\s*"([^"]+)"/);
if (!homeHeroMatch) {
  errors.push("content/heroes.ts: could not parse `homeHero` export");
} else {
  const homeHero = homeHeroMatch[1];
  expect(
    heroSlugs.includes(homeHero),
    `content/heroes.ts: homeHero "${homeHero}" is not a key in heroes`,
  );
}

if (errors.length) {
  console.error(`✗ Content check failed (${errors.length} error${errors.length === 1 ? "" : "s"}):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log(
  `✓ Content check passed — ${projectFiles.length} project${projectFiles.length === 1 ? "" : "s"}, ${heroSlugs.length} hero${heroSlugs.length === 1 ? "" : "es"}.`,
);
