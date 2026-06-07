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
 * Cross-project feed: every project's weekly rollups, flattened and sorted
 * newest-first. Each project's history is fetched from the public API
 * (cached 1h via getProjectHistory's fetch revalidate).
 */
export async function getFeed(limit = 30): Promise<FeedEntry[]> {
  const perProject = await Promise.all(
    projects.map(async (p) => {
      const history = await getProjectHistory(projectHistoryKey(p));
      return history.weekly.map((w) => ({
        project: p.slug,
        projectName: p.name,
        status: p.status,
        weekOf: w.weekOf,
        summary: w.publicSummary,
        sessionCount: w.sessionCount,
      }));
    }),
  );

  return perProject
    .flat()
    .sort((a, b) => b.weekOf.localeCompare(a.weekOf))
    .slice(0, limit);
}
