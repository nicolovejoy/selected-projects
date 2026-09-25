import { cacheLife } from "next/cache";
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
  /** Precedence: curated cardImage > live OG scrape > legacy image field. */
  image: string | null;
  /** Null when no weekly rollup has been published — the card still renders. */
  weekOf: string | null;
  summary: string | null;
  sessionCount: number | null;
  /** Sessions per week, oldest→newest, for the activity sparkline. Empty when unpublished. */
  spark: number[];
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
    image: p.cardImage ?? og?.image ?? p.image ?? null,
    weekOf: latest?.weekOf ?? null,
    summary: latest?.publicSummary ?? null,
    sessionCount: latest?.sessionCount ?? null,
    spark: [...history.weekly]
      .sort((a, b) => a.weekOf.localeCompare(b.weekOf))
      .map((w) => w.sessionCount),
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
  "use cache";
  // Explicit outer lifetime: recountly.org permanently lacks an og:image, so
  // its OG scrape always fails and caches as `minutes` (1 min revalidate).
  // Without this explicit `hours` override, that leaf's short lifetime would
  // win at this level too, and the feed — plus the `/` and category shells
  // that render it — would regenerate on nearly every request instead of
  // staying in the prerendered shell for an hour.
  cacheLife("hours");

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
