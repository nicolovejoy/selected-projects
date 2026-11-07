import type { MDXContent } from "mdx/types";
import musicforge, { metadata as musicforgeMeta } from "@/content/projects/musicforge.mdx";
import ibuild4you, { metadata as ibuild4youMeta } from "@/content/projects/ibuild4you.mdx";
import prntd, { metadata as prntdMeta } from "@/content/projects/prntd.mdx";
import promptLab, { metadata as promptLabMeta } from "@/content/projects/prompt-lab.mdx";
import raconte, { metadata as raconteMeta } from "@/content/projects/raconte.mdx";
import splitRecording, { metadata as splitRecordingMeta } from "@/content/projects/split-recording.mdx";
import rocksculpture, { metadata as rocksculptureMeta } from "@/content/projects/rocksculpture.mdx";
import anomatom, { metadata as anomatomMeta } from "@/content/projects/anomatom.mdx";
import tideline, { metadata as tidelineMeta } from "@/content/projects/tideline.mdx";
import l6Music, { metadata as l6MusicMeta } from "@/content/projects/l6-music.mdx";
import bakerylouise, { metadata as bakerylouiseMeta } from "@/content/projects/bakerylouise.mdx";
import selectedProjects, { metadata as selectedProjectsMeta } from "@/content/projects/selected-projects.mdx";
import musicforgeFr, { metadata as musicforgeFrMeta } from "@/content/fr/projects/musicforge.mdx";
import ibuild4youFr, { metadata as ibuild4youFrMeta } from "@/content/fr/projects/ibuild4you.mdx";
import prntdFr, { metadata as prntdFrMeta } from "@/content/fr/projects/prntd.mdx";
import promptLabFr, { metadata as promptLabFrMeta } from "@/content/fr/projects/prompt-lab.mdx";
import raconteFr, { metadata as raconteFrMeta } from "@/content/fr/projects/raconte.mdx";
import splitRecordingFr, { metadata as splitRecordingFrMeta } from "@/content/fr/projects/split-recording.mdx";
import rocksculptureFr, { metadata as rocksculptureFrMeta } from "@/content/fr/projects/rocksculpture.mdx";
import anomatomFr, { metadata as anomatomFrMeta } from "@/content/fr/projects/anomatom.mdx";
import tidelineFr, { metadata as tidelineFrMeta } from "@/content/fr/projects/tideline.mdx";
import l6MusicFr, { metadata as l6MusicFrMeta } from "@/content/fr/projects/l6-music.mdx";
import bakerylouiseFr, { metadata as bakerylouiseFrMeta } from "@/content/fr/projects/bakerylouise.mdx";
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
  /** What the preview loads, when it should differ from `url` (a deep link to a
   *  starting state, e.g. a pattern). Used by the split pane and the phone
   *  link; "Visit site" still goes to `url`. */
  embedUrl?: string;
  /** Made through iBuild4You. Listed in the grid on the ibuild4you page and
   *  labelled in the detail header. Absent = false. */
  ibuild4you?: boolean;
  /** Where the project sits on the home page. Absent = "list". */
  home?: HomePlacement;
  /** Order within its home group, ascending; unranked sorts last. */
  rank?: number;
  /** One sentence: the part that took real work. */
  hard?: string;
  /** Short facts, shown as a mono row. */
  facts?: string[];
  /** Looping card video under public/ (.mp4 or .webm). */
  cardVideo?: string;
};

export type HomePlacement = "featured" | "list";

export function projectHistoryKey(p: { slug: string; historyKey?: string }): string {
  return p.historyKey ?? p.slug;
}

export type Project = ProjectMeta & { slug: string };

type Entry = { meta: ProjectMeta; Body: MDXContent };

const entries: Record<string, Entry> = {
  musicforge: { meta: musicforgeMeta as ProjectMeta, Body: musicforge },
  prntd: { meta: prntdMeta as ProjectMeta, Body: prntd },
  rocksculpture: { meta: rocksculptureMeta as ProjectMeta, Body: rocksculpture },
  anomatom: { meta: anomatomMeta as ProjectMeta, Body: anomatom },
  ibuild4you: { meta: ibuild4youMeta as ProjectMeta, Body: ibuild4you },
  "prompt-lab": { meta: promptLabMeta as ProjectMeta, Body: promptLab },
  raconte: { meta: raconteMeta as ProjectMeta, Body: raconte },
  "l6-music": { meta: l6MusicMeta as ProjectMeta, Body: l6Music },
  "split-recording": { meta: splitRecordingMeta as ProjectMeta, Body: splitRecording },
  tideline: { meta: tidelineMeta as ProjectMeta, Body: tideline },
  bakerylouise: { meta: bakerylouiseMeta as ProjectMeta, Body: bakerylouise },
  "selected-projects": { meta: selectedProjectsMeta as ProjectMeta, Body: selectedProjects },
};

/** French overlay: the translated tagline, optional hard/facts, and body.
 *  Everything else (name, status, url, …) comes from the English file, so it
 *  can't drift. */
type FrMeta = { tagline: string; hard?: string; facts?: string[] };
const frEntries: Record<string, { meta: FrMeta; Body: MDXContent }> = {
  "musicforge": { meta: musicforgeFrMeta as FrMeta, Body: musicforgeFr },
  "anomatom": { meta: anomatomFrMeta as FrMeta, Body: anomatomFr },
  "ibuild4you": { meta: ibuild4youFrMeta as FrMeta, Body: ibuild4youFr },
  "prntd": { meta: prntdFrMeta as FrMeta, Body: prntdFr },
  "prompt-lab": { meta: promptLabFrMeta as FrMeta, Body: promptLabFr },
  "raconte": { meta: raconteFrMeta as FrMeta, Body: raconteFr },
  "l6-music": { meta: l6MusicFrMeta as FrMeta, Body: l6MusicFr },
  "split-recording": { meta: splitRecordingFrMeta as FrMeta, Body: splitRecordingFr },
  "rocksculpture": { meta: rocksculptureFrMeta as FrMeta, Body: rocksculptureFr },
  "tideline": { meta: tidelineFrMeta as FrMeta, Body: tidelineFr },
  "bakerylouise": { meta: bakerylouiseFrMeta as FrMeta, Body: bakerylouiseFr },
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
  const fr = frEntries[slug]?.meta;
  return {
    ...p,
    tagline: fr?.tagline ?? p.tagline,
    hard: fr?.hard ?? p.hard,
    facts: fr?.facts ?? p.facts,
  };
}

/** Localized project list, same order as `projects`. */
export function localizedProjects(locale: Locale): Project[] {
  return projects.map((p) => getProject(p.slug, locale)!);
}

/** Home-page groups, each sorted by `rank` ascending (unranked last, stable). */
export function homeProjects(locale: Locale = "en"): {
  featured: Project[];
  list: Project[];
} {
  const out = { featured: [] as Project[], list: [] as Project[] };
  for (const p of localizedProjects(locale)) out[p.home ?? "list"].push(p);
  const byRank = (a: Project, b: Project) =>
    (a.rank ?? Infinity) === (b.rank ?? Infinity) ? 0 : (a.rank ?? Infinity) - (b.rank ?? Infinity);
  out.featured.sort(byRank);
  out.list.sort(byRank);
  return out;
}

/** Projects built through iBuild4You, localized, in `projects` order. */
export function builtWithIbuild4you(locale: Locale = "en"): Project[] {
  return localizedProjects(locale).filter((p) => p.ibuild4you && p.slug !== "ibuild4you");
}

export function getProjectBody(slug: string, locale: Locale = "en"): MDXContent | undefined {
  if (locale === "fr" && frEntries[slug]) return frEntries[slug].Body;
  return entries[slug]?.Body;
}
