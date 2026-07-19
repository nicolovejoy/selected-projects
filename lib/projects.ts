import type { MDXContent } from "mdx/types";
import musicforge, { metadata as musicforgeMeta } from "@/content/projects/musicforge.mdx";
import ibuild4you, { metadata as ibuild4youMeta } from "@/content/projects/ibuild4you.mdx";
import prntd, { metadata as prntdMeta } from "@/content/projects/prntd.mdx";
import promptLab, { metadata as promptLabMeta } from "@/content/projects/prompt-lab.mdx";
import recountly, { metadata as recountlyMeta } from "@/content/projects/recountly.mdx";
import splitRecording, { metadata as splitRecordingMeta } from "@/content/projects/split-recording.mdx";
import rocksculpture, { metadata as rocksculptureMeta } from "@/content/projects/rocksculpture.mdx";
import selectedProjects, { metadata as selectedProjectsMeta } from "@/content/projects/selected-projects.mdx";

export type ProjectStatus = "live" | "beta" | "alpha" | "demo" | "concept";

export type ProjectCategory = "music" | "art" | "products" | "tools";

/** Display order of the category sections. Tools last — it's the layer underneath. */
export const categories: { key: ProjectCategory; label: string }[] = [
  { key: "music", label: "Music" },
  { key: "art", label: "Art" },
  { key: "products", label: "Products" },
  { key: "tools", label: "Tools" },
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
  "selected-projects": { meta: selectedProjectsMeta as ProjectMeta, Body: selectedProjects },
};

export const projects: Project[] = Object.entries(entries).map(([slug, e]) => ({
  slug,
  ...e.meta,
}));

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectBody(slug: string): MDXContent | undefined {
  return entries[slug]?.Body;
}
