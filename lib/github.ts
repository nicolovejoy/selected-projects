const OWNER = "nicolovejoy";

/** One week of commit activity, matching GitHub's stats/commit_activity shape. */
export type CommitWeek = {
  /** Unix seconds, start of the week (Sunday). */
  week: number;
  /** Commits per day, Sunday → Saturday. */
  days: number[];
  total: number;
};

function repoPath(github: string): string {
  return github.includes("/") ? github : `${OWNER}/${github}`;
}

/**
 * Last-52-weeks commit activity for a repo, for the contribution calendar.
 *
 * Cached 1h via Next's data cache, so it's warm across all visitors after the
 * first view (and Next's link-prefetch on the home page warms it before a
 * detail page is even opened). Returns null on any miss — no token, rate
 * limit, private repo, or GitHub still computing stats (202) — so the caller
 * simply renders nothing and the page is unaffected.
 */
export async function getCommitActivity(github: string): Promise<CommitWeek[] | null> {
  const token = process.env.GITHUB_TOKEN;
  const url = `https://api.github.com/repos/${repoPath(github)}/stats/commit_activity`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, { headers, next: { revalidate: 3600 } });
    // 202 = GitHub is still computing the stats cache; 204 = empty repo.
    if (res.status === 202 || res.status === 204) return null;
    if (!res.ok) {
      console.warn(`[github] ${url} → ${res.status}`);
      return null;
    }
    const data = (await res.json()) as CommitWeek[];
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch (err) {
    console.warn(`[github] fetch failed for ${github}:`, err);
    return null;
  }
}
