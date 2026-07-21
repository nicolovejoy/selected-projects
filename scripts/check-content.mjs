#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const ALLOWED_STATUS = new Set(["live", "beta", "alpha", "demo", "concept"]);
const ALLOWED_CATEGORY = new Set(["music", "art", "products", "tools"]);
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
  expect(
    typeof meta.category === "string" && meta.category,
    `${fullPath}: missing metadata.category`,
  );
  if (meta.category) {
    expect(
      ALLOWED_CATEGORY.has(meta.category),
      `${fullPath}: category "${meta.category}" not in {${[...ALLOWED_CATEGORY].join(", ")}}`,
    );
  }
  for (const field of ["image", "cardImage"]) {
    const value = meta[field];
    if (value === undefined) continue;
    expect(
      typeof value === "string" && value.startsWith("/"),
      `${fullPath}: ${field} "${value}" must start with "/"`,
    );
    if (typeof value === "string") {
      const imagePath = path.join("public", value.replace(/^\//, ""));
      expect(existsSync(imagePath), `${fullPath}: ${field} "${value}" not found at ${imagePath}`);
    }
  }
  if (meta.url !== undefined) {
    expect(
      typeof meta.url === "string" && /^https?:\/\//.test(meta.url),
      `${fullPath}: url "${meta.url}" must start with http(s)://`,
    );
  }
  if (meta.historyKey !== undefined) {
    expect(
      typeof meta.historyKey === "string" && /^[\w-]+$/.test(meta.historyKey),
      `${fullPath}: historyKey "${meta.historyKey}" must be a slug-like string`,
    );
  }
  if (meta.embed !== undefined) {
    expect(typeof meta.embed === "boolean", `${fullPath}: embed must be a boolean`);
    if (meta.embed) {
      expect(!!meta.url, `${fullPath}: embed: true requires url`);
    }
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

if (errors.length) {
  console.error(`✗ Content check failed (${errors.length} error${errors.length === 1 ? "" : "s"}):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log(
  `✓ Content check passed — ${projectFiles.length} project${projectFiles.length === 1 ? "" : "s"}.`,
);
