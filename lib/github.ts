import { unstable_cache } from "next/cache";

const OWNER = "nicolovejoy";

/** One week of commit activity, matching GitHub's stats/commit_activity shape. */
export type CommitWeek = {
  /** Unix seconds, start of the week (Sunday). */
  week: number;
  /** Commits per day, Sunday → Saturday. */
  days: number[];
  total: number;
};

export type RepoInfo = { htmlUrl: string };

function repoPath(github: string): string {
  return github.includes("/") ? github : `${OWNER}/${github}`;
}

function ghHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Throws on any miss so the unstable_cache wrapper never stores a failure:
 * a successful result is cached and stays stable, while a miss (rate limit,
 * private repo, or GitHub still computing stats after retries) falls through
 * and is retried on the next view. GitHub computes commit_activity lazily and
 * can return 202 ("computing") before 200, so we use no-store + a short retry.
 */
async function fetchCommitActivity(github: string): Promise<CommitWeek[]> {
  const url = `https://api.github.com/repos/${repoPath(github)}/stats/commit_activity`;
  const attempts = 4;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const res = await fetch(url, { headers: ghHeaders(), cache: "no-store" });
    if (res.status === 202) {
      if (attempt < attempts - 1) await new Promise((r) => setTimeout(r, 1000));
      continue;
    }
    if (!res.ok) throw new Error(`commit_activity ${res.status}`);
    const data = (await res.json()) as CommitWeek[];
    if (!Array.isArray(data) || data.length === 0) throw new Error("commit_activity empty");
    return data;
  }
  throw new Error("commit_activity still computing (202)");
}

/** Last-52-weeks commit activity for the contribution calendar, or null. */
export async function getCommitActivity(github: string): Promise<CommitWeek[] | null> {
  const cached = unstable_cache(
    () => fetchCommitActivity(github),
    ["commit-activity", repoPath(github)],
    { revalidate: 3600 },
  );
  try {
    return await cached();
  } catch (err) {
    console.warn(`[github] commit_activity ${repoPath(github)}: ${(err as Error).message}`);
    return null;
  }
}

/** Throws (→ null) for private or missing repos, so we never link one publicly. */
async function fetchPublicRepo(github: string): Promise<RepoInfo> {
  const res = await fetch(`https://api.github.com/repos/${repoPath(github)}`, {
    headers: ghHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`repo ${res.status}`);
  const data = (await res.json()) as { html_url: string; private: boolean };
  if (data.private) throw new Error("repo private");
  return { htmlUrl: data.html_url };
}

/** Canonical repo URL if the repo is public, else null (for the GitHub link). */
export async function getPublicRepo(github: string): Promise<RepoInfo | null> {
  const cached = unstable_cache(
    () => fetchPublicRepo(github),
    ["repo", repoPath(github)],
    { revalidate: 86400 },
  );
  try {
    return await cached();
  } catch (err) {
    console.warn(`[github] repo ${repoPath(github)}: ${(err as Error).message}`);
    return null;
  }
}
