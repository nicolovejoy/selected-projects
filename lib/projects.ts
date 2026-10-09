import type { MDXContent } from "mdx/types";
import musicforge, { metadata as musicforgeMeta } from "@/content/projects/musicforge.mdx";
import ibuild4you, { metadata as ibuild4youMeta } from "@/content/projects/ibuild4you.mdx";
import prntd, { metadata as prntdMeta } from "@/content/projects/prntd.mdx";
import promptLab, { metadata as promptLabMeta } from "@/content/projects/prompt-lab.mdx";
import recountly, { metadata as recountlyMeta } from "@/content/projects/recountly.mdx";
import splitRecording, { metadata as splitRecordingMeta } from "@/content/projects/split-recording.mdx";
import songscribe, { metadata as songscribeMeta } from "@/content/projects/songscribe.mdx";
import rocksculpture, { metadata as rocksculptureMeta } from "@/content/projects/rocksculpture.mdx";
import selectedProjects, { metadata as selectedProjectsMeta } from "@/content/projects/selected-projects.mdx";
import musicforgeFr, { metadata as musicforgeFrMeta } from "@/content/fr/projects/musicforge.mdx";
import ibuild4youFr, { metadata as ibuild4youFrMeta } from "@/content/fr/projects/ibuild4you.mdx";
import prntdFr, { metadata as prntdFrMeta } from "@/content/fr/projects/prntd.mdx";
import promptLabFr, { metadata as promptLabFrMeta } from "@/content/fr/projects/prompt-lab.mdx";
import recountlyFr, { metadata as recountlyFrMeta } from "@/content/fr/projects/recountly.mdx";
import splitRecordingFr, { metadata as splitRecordingFrMeta } from "@/content/fr/projects/split-recording.mdx";
import songscribeFr, { metadata as songscribeFrMeta } from "@/content/fr/projects/songscribe.mdx";
import rocksculptureFr, { metadata as rocksculptureFrMeta } from "@/content/fr/projects/rocksculpture.mdx";
import selectedProjectsFr, { metadata as selectedProjectsFrMeta } from "@/content/fr/projects/selected-projects.mdx";
import { strings } from "@/content/strings";
import type { Locale } from "@/lib/i18n";

export type ProjectStatus = "live" | "beta" | "alpha" | "demo" | "concept";

export type ProjectCategory = "music" | "art" | "products" | "tools";

/** Display order of the category sections. Tools last — it's the layer underneath.
 *  Labels come from content/strings.ts via categoryLabel(key, locale). */
export const categories: { key: ProjectCategory }[] = [
  { key: "music" },
  { key: "art" },
  { key: "products" },
  { key: "tools" },
];

export type ProjectMeta = {
  name: string;
  tagline: string;
  status: ProjectStatus;
  category: ProjectCategory;
  url?: string;
  github?: string;
  image?: string;
  cardImage?: string;
  historyKey?: string;
  /** Opt-in to the split-pane live preview action on the detail page (#12).
   * Requires `url` — validated in check-content.mjs. */
  embed?: boolean;
};

export function projectHistoryKey(p: { slug: string; historyKey?: string }): string {
  return p.historyKey ?? p.slug;
}

export type Project = ProjectMeta & { slug: string };

type Entry = { meta: ProjectMeta; Body: MDXContent };

const entries: Record<string, Entry> = {
  musicforge: { meta: musicforgeMeta as ProjectMeta, Body: musicforge },
  prntd: { meta: prntdMeta as ProjectMeta, Body: prntd },
  rocksculpture: { meta: rocksculptureMeta as ProjectMeta, Body: rocksculpture },
  ibuild4you: { meta: ibuild4youMeta as ProjectMeta, Body: ibuild4you },
  "prompt-lab": { meta: promptLabMeta as ProjectMeta, Body: promptLab },
  recountly: { meta: recountlyMeta as ProjectMeta, Body: recountly },
  "split-recording": { meta: splitRecordingMeta as ProjectMeta, Body: splitRecording },
  songscribe: { meta: songscribeMeta as ProjectMeta, Body: songscribe },
  "selected-projects": { meta: selectedProjectsMeta as ProjectMeta, Body: selectedProjects },
};

/** French overlay: only the translated tagline and body. Everything else
 *  (name, status, url, …) comes from the English file, so it can't drift. */
type FrMeta = { tagline: string };
const frEntries: Record<string, { meta: FrMeta; Body: MDXContent }> = {
  "musicforge": { meta: musicforgeFrMeta as FrMeta, Body: musicforgeFr },
  "ibuild4you": { meta: ibuild4youFrMeta as FrMeta, Body: ibuild4youFr },
  "prntd": { meta: prntdFrMeta as FrMeta, Body: prntdFr },
  "prompt-lab": { meta: promptLabFrMeta as FrMeta, Body: promptLabFr },
  "recountly": { meta: recountlyFrMeta as FrMeta, Body: recountlyFr },
  "split-recording": { meta: splitRecordingFrMeta as FrMeta, Body: splitRecordingFr },
  "songscribe": { meta: songscribeFrMeta as FrMeta, Body: songscribeFr },
  "rocksculpture": { meta: rocksculptureFrMeta as FrMeta, Body: rocksculptureFr },
  "selected-projects": { meta: selectedProjectsFrMeta as FrMeta, Body: selectedProjectsFr },
};

export const projects: Project[] = Object.entries(entries).map(([slug, e]) => ({
  slug,
  ...e.meta,
}));

export function isCategory(value: string): value is ProjectCategory {
  return categories.some((c) => c.key === value);
}

export function categoryLabel(key: ProjectCategory, locale: Locale = "en"): string {
  return strings[locale].categories[key];
}

export function projectsInCategory(key: ProjectCategory): Project[] {
  return projects.filter((p) => p.category === key);
}

export function getProject(slug: string, locale: Locale = "en"): Project | undefined {
  const p = projects.find((p) => p.slug === slug);
  if (!p || locale === "en") return p;
  return { ...p, tagline: frEntries[slug]?.meta.tagline ?? p.tagline };
}

/** Localized project list, same order as `projects`. */
export function localizedProjects(locale: Locale): Project[] {
  return projects.map((p) => getProject(p.slug, locale)!);
}

export function getProjectBody(slug: string, locale: Locale = "en"): MDXContent | undefined {
  if (locale === "fr" && frEntries[slug]) return frEntries[slug].Body;
  return entries[slug]?.Body;
}
