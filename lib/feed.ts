import { projects, projectHistoryKey, type ProjectStatus } from "@/lib/projects";
import { getProjectHistory } from "@/lib/history";

export type FeedEntry = {
  project: string;
  projectName: string;
  status: ProjectStatus;
  weekOf: string;
  summary: string;
  sessionCount: number;
};

/**
 * Cross-project feed: one entry per project — its most recent weekly rollup —
 * sorted by that rollup's date, newest-first. Each project's history is fetched
 * from the public API (cached 1h via getProjectHistory's fetch revalidate).
 */
export async function getFeed(limit = 30): Promise<FeedEntry[]> {
  const perProject = await Promise.all(
    projects.map(async (p) => {
      const history = await getProjectHistory(projectHistoryKey(p));
      const latest = [...history.weekly].sort((a, b) =>
        b.weekOf.localeCompare(a.weekOf),
      )[0];
      if (!latest) return null;
      return {
        project: p.slug,
        projectName: p.name,
        status: p.status,
        weekOf: latest.weekOf,
        summary: latest.publicSummary,
        sessionCount: latest.sessionCount,
      } satisfies FeedEntry;
    }),
  );

  return perProject
    .filter((e): e is FeedEntry => e !== null)
    .sort((a, b) => b.weekOf.localeCompare(a.weekOf))
    .slice(0, limit);
}
