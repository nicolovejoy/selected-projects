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

const DAY_MS = 86_400_000;
const WEEKS = 52;

/**
 * Build the 52-week calendar from the /commits list (default branch, last
 * year), bucketed by day. We deliberately avoid stats/commit_activity: that
 * endpoint returns 202 whenever GitHub is recomputing its stats cache, which
 * made the calendar render intermittently. /commits returns 200 reliably.
 *
 * Throws on any miss so the unstable_cache wrapper never stores a failure;
 * a success is cached and stays stable.
 *
 * Caveat: capped at 3 pages (300 commits). A repo with >300 commits in the
 * last year will undercount its oldest weeks — fine for a recent-activity view.
 */
async function fetchCommitActivity(github: string): Promise<CommitWeek[]> {
  const since = new Date(Date.now() - (WEEKS * 7 + 6) * DAY_MS).toISOString();
  const base = `https://api.github.com/repos/${repoPath(github)}/commits`;

  const byDay = new Map<number, number>();
  let found = 0;
  let oldest = Infinity;
  let capped = false;
  for (let page = 1; page <= 3; page++) {
    const url = `${base}?per_page=100&since=${since}&page=${page}`;
    const res = await fetch(url, { headers: ghHeaders(), cache: "no-store" });
    if (!res.ok) throw new Error(`commits ${res.status}`);
    const batch = (await res.json()) as Array<{ commit: { committer?: { date?: string } } }>;
    for (const c of batch) {
      const iso = c.commit?.committer?.date;
      if (!iso) continue;
      const dayKey = Math.floor(new Date(iso).getTime() / DAY_MS);
      byDay.set(dayKey, (byDay.get(dayKey) ?? 0) + 1);
      if (dayKey < oldest) oldest = dayKey;
      found++;
    }
    if (batch.length < 100) break;
    if (page === 3) capped = true; // more commits than we fetched
  }
  if (found === 0) throw new Error("no commits in the last year");

  // Grid runs from a start week to the current week. Normally the full 52
  // weeks; for a busy repo whose history we capped, start at its oldest
  // fetched commit instead, so we never show undercounted older weeks.
  const today = Math.floor(Date.now() / DAY_MS);
  const currentWeekStart = today - new Date(today * DAY_MS).getUTCDay(); // Sunday
  const fullStart = currentWeekStart - (WEEKS - 1) * 7;
  const oldestWeekStart = oldest - new Date(oldest * DAY_MS).getUTCDay();
  const gridStart = capped ? Math.max(fullStart, oldestWeekStart) : fullStart;
  const numWeeks = Math.round((currentWeekStart - gridStart) / 7) + 1;

  const weeks: CommitWeek[] = [];
  for (let w = 0; w < numWeeks; w++) {
    const weekStart = gridStart + w * 7;
    const days: number[] = [];
    let total = 0;
    for (let d = 0; d < 7; d++) {
      const n = byDay.get(weekStart + d) ?? 0;
      days.push(n);
      total += n;
    }
    weeks.push({ week: (weekStart * DAY_MS) / 1000, days, total });
  }
  return weeks;
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
