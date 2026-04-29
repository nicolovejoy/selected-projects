import type { MDXContent } from "mdx/types";
import musicforge, { metadata as musicforgeMeta } from "@/content/projects/musicforge.mdx";
import ibuild4you, { metadata as ibuild4youMeta } from "@/content/projects/ibuild4you.mdx";
import prntd, { metadata as prntdMeta } from "@/content/projects/prntd.mdx";
import lojong, { metadata as lojongMeta } from "@/content/projects/lojong.mdx";
import promptLab, { metadata as promptLabMeta } from "@/content/projects/prompt-lab.mdx";

export type ProjectStatus = "live" | "beta" | "alpha" | "demo" | "concept";

export type ProjectMeta = {
  name: string;
  tagline: string;
  status: ProjectStatus;
  url?: string;
  github?: string;
};

export type Project = ProjectMeta & { slug: string };

type Entry = { meta: ProjectMeta; Body: MDXContent };

const entries: Record<string, Entry> = {
  musicforge: { meta: musicforgeMeta as ProjectMeta, Body: musicforge },
  ibuild4you: { meta: ibuild4youMeta as ProjectMeta, Body: ibuild4you },
  prntd: { meta: prntdMeta as ProjectMeta, Body: prntd },
  lojong: { meta: lojongMeta as ProjectMeta, Body: lojong },
  "prompt-lab": { meta: promptLabMeta as ProjectMeta, Body: promptLab },
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
