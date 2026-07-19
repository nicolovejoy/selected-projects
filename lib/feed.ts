import {
  projects,
  projectHistoryKey,
  categories,
  type ProjectStatus,
  type ProjectCategory,
} from "@/lib/projects";
import { getProjectHistory } from "@/lib/history";
import { getOgPreview } from "@/lib/og";

export type FeedEntry = {
  project: string;
  projectName: string;
  status: ProjectStatus;
  category: ProjectCategory;
  tagline: string;
  url: string | null;
  image: string | null;
  /** Null when no weekly rollup has been published — the card still renders. */
  weekOf: string | null;
  summary: string | null;
  sessionCount: number | null;
};

export type FeedGroup = { key: ProjectCategory; label: string; entries: FeedEntry[] };

async function toEntry(p: (typeof projects)[number]): Promise<FeedEntry> {
  const [history, og] = await Promise.all([
    getProjectHistory(projectHistoryKey(p)),
    p.url ? getOgPreview(p.url) : null,
  ]);
  const latest = [...history.weekly].sort((a, b) => b.weekOf.localeCompare(a.weekOf))[0];
  return {
    project: p.slug,
    projectName: p.name,
    status: p.status,
    category: p.category,
    tagline: p.tagline,
    url: p.url ?? null,
    image: og?.image ?? p.cardImage ?? p.image ?? null,
    weekOf: latest?.weekOf ?? null,
    summary: latest?.publicSummary ?? null,
    sessionCount: latest?.sessionCount ?? null,
  };
}

/**
 * Every project, grouped into category sections. The weekly rollup is optional
 * enrichment: a project with no published rollup still gets a card from its own
 * frontmatter, so the site never hides work just because the upstream history
 * feed is stale. Within a category, projects with recent activity come first
 * and rollup-less ones fall to the end in manifest order.
 */
export async function getGroupedFeed(): Promise<FeedGroup[]> {
  const entries = await Promise.all(projects.map(toEntry));

  return categories
    .map(({ key, label }) => ({
      key,
      label,
      entries: entries
        .filter((e) => e.category === key)
        .sort((a, b) => (b.weekOf ?? "").localeCompare(a.weekOf ?? "")),
    }))
    .filter((g) => g.entries.length > 0);
}
