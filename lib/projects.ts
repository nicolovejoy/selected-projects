export type ProjectStatus = "live" | "beta" | "alpha" | "concept";

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  status: ProjectStatus;
  url?: string;
  github?: string;
  description: string;
  cta?: { label: string; href: string };
};

export const projects: Project[] = [
  {
    slug: "musicforge",
    name: "MusicForge",
    tagline: "TODO — one-line tagline",
    status: "alpha",
    description: "TODO — a paragraph or two about what MusicForge is, who it's for, and why it exists.",
  },
  {
    slug: "ibuild4you",
    name: "iBuild4You",
    tagline: "TODO — one-line tagline",
    status: "alpha",
    description: "TODO — a paragraph or two about iBuild4You.",
  },
  {
    slug: "prntd",
    name: "prntd",
    tagline: "TODO — one-line tagline",
    status: "alpha",
    description: "TODO — a paragraph or two about prntd.",
  },
  {
    slug: "lojong",
    name: "Lojong",
    tagline: "TODO — one-line tagline",
    status: "alpha",
    github: "am-i-an-ai",
    description: "TODO — a paragraph or two about Lojong (formerly am-i-an-ai).",
  },
  {
    slug: "prompt-lab",
    name: "Prompt Lab",
    tagline: "TODO — one-line tagline",
    status: "beta",
    description: "TODO — a paragraph or two about Prompt Lab.",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
