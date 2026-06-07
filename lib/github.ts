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
 * Returns null on any miss — no token, rate limit, private/missing repo, or
 * GitHub still computing stats after retries — so the caller renders nothing
 * and the page is unaffected.
 */
export async function getCommitActivity(github: string): Promise<CommitWeek[] | null> {
  const token = process.env.GITHUB_TOKEN;
  const url = `https://api.github.com/repos/${repoPath(github)}/stats/commit_activity`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // GitHub computes commit_activity lazily: the first request for a repo can
  // return 202 ("computing") and 200 a moment later. We use no-store so a 202
  // is never cached, and retry briefly. Each detail-page view is then ~1 auth'd
  // call — well within the 5000/hr token budget for a low-traffic site.
  const attempts = 4;
  try {
    for (let attempt = 0; attempt < attempts; attempt++) {
      const res = await fetch(url, { headers, cache: "no-store" });
      if (res.status === 202) {
        // Still computing — wait, then retry. GitHub usually finishes within
        // a few seconds; if not, the calendar self-heals on a later view.
        if (attempt < attempts - 1) await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      if (res.status === 204) return null; // empty repo
      if (!res.ok) {
        console.warn(`[github] ${url} → ${res.status}`);
        return null;
      }
      const data = (await res.json()) as CommitWeek[];
      return Array.isArray(data) && data.length > 0 ? data : null;
    }
    return null; // still 202 after retries
  } catch (err) {
    console.warn(`[github] fetch failed for ${github}:`, err);
    return null;
  }
}
