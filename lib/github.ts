import { cacheLife } from "next/cache";

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
 * Cached by `github`; the try/catch lives inside the cached scope so a
 * failure never throws out of it — it's cached briefly (`minutes`) instead
 * of caching nothing, and a success is cached for `hours`.
 *
 * Both GitHub fetchers use `use cache: remote`: they only ever run at request
 * time (after the cookie read on /projects/[slug]), where plain `use cache` is
 * per-serverless-instance memory. Measured on prod 2026-09-25 with plain
 * `use cache`: 6 page loads → 6 /repos + 18 /commits calls. Remote is shared
 * across instances.
 *
 * Caveat: capped at 3 pages (300 commits). A repo with >300 commits in the
 * last year will undercount its oldest weeks — fine for a recent-activity view.
 */
async function fetchCommitActivity(github: string): Promise<CommitWeek[] | null> {
  "use cache: remote";

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);
  try {
    // Date.now() here evaluates when the cache entry fills (this scope is
    // never prerendered — it runs after the cookie read on /projects/[slug]),
    // not per request — the `hours` lifetime below is what keeps this
    // calendar window current after that.
    const since = new Date(Date.now() - (WEEKS * 7 + 6) * DAY_MS).toISOString();
    const base = `https://api.github.com/repos/${repoPath(github)}/commits`;

    const byDay = new Map<number, number>();
    let found = 0;
    let oldest = Infinity;
    let capped = false;
    try {
      for (let page = 1; page <= 3; page++) {
        const url = `${base}?per_page=100&since=${since}&page=${page}`;
        const res = await fetch(url, { headers: ghHeaders(), signal: ctrl.signal });
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
    } finally {
      clearTimeout(timer);
    }
    if (found === 0) throw new Error("no commits in the last year");

    // Grid runs from a start week to the current week. Normally the full 52
    // weeks; for a busy repo whose history we capped, start at its oldest
    // fetched commit instead, so we never show undercounted older weeks.
    // Date.now() here evaluates when the cache entry fills, same as above.
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
    cacheLife("hours");
    return weeks;
  } catch (err) {
    console.warn(`[github] commit_activity ${repoPath(github)}: ${(err as Error).message}`);
    cacheLife("minutes");
    return null;
  }
}

/** Last-52-weeks commit activity for the contribution calendar, or null. */
export async function getCommitActivity(github: string): Promise<CommitWeek[] | null> {
  return fetchCommitActivity(github);
}

/** Cached by `github`; a private or missing repo is cached briefly as null, so we never link one publicly. */
async function fetchPublicRepo(github: string): Promise<RepoInfo | null> {
  "use cache: remote";

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);
  try {
    let res: Response;
    try {
      res = await fetch(`https://api.github.com/repos/${repoPath(github)}`, {
        headers: ghHeaders(),
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) throw new Error(`repo ${res.status}`);
    const data = (await res.json()) as { html_url: string; private: boolean };
    if (data.private) throw new Error("repo private");
    cacheLife("days");
    return { htmlUrl: data.html_url };
  } catch (err) {
    console.warn(`[github] repo ${repoPath(github)}: ${(err as Error).message}`);
    cacheLife("minutes");
    return null;
  }
}

/** Canonical repo URL if the repo is public, else null (for the GitHub link). */
export async function getPublicRepo(github: string): Promise<RepoInfo | null> {
  return fetchPublicRepo(github);
}

type GqlDay = { contributionCount: number; date: string };

/**
 * The user's public contribution calendar (all repos, last year) mapped into
 * the CommitWeek shape. Partial first/last weeks are padded with 0 by weekday.
 * Needs GITHUB_TOKEN (GraphQL has no anonymous access); without it, null.
 * No Date.now(): the window comes from GitHub's own response.
 */
async function fetchUserContributions(): Promise<{ total: number; weeks: CommitWeek[] } | null> {
  "use cache: remote";

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    cacheLife("minutes");
    return null;
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);
  try {
    let res: Response;
    try {
      res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{ user(login: "${OWNER}") { contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { contributionCount date } } } } } }`,
        }),
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) throw new Error(`graphql ${res.status}`);
    const json = (await res.json()) as {
      data?: {
        user?: {
          contributionsCollection: {
            contributionCalendar: {
              totalContributions: number;
              weeks: { contributionDays: GqlDay[] }[];
            };
          };
        } | null;
      };
      errors?: { message: string }[];
    };
    const cal = json.data?.user?.contributionsCollection.contributionCalendar;
    if (!cal) throw new Error(json.errors?.[0]?.message ?? "no calendar in response");

    const weeks: CommitWeek[] = [];
    for (const w of cal.weeks) {
      if (w.contributionDays.length === 0) continue;
      const days = [0, 0, 0, 0, 0, 0, 0];
      let weekStart = Infinity; // day number (UTC) of that week's Sunday
      for (const d of w.contributionDays) {
        const dayNum = Math.floor(Date.parse(`${d.date}T00:00:00Z`) / DAY_MS);
        const dow = new Date(dayNum * DAY_MS).getUTCDay();
        days[dow] = d.contributionCount;
        weekStart = Math.min(weekStart, dayNum - dow);
      }
      weeks.push({
        week: (weekStart * DAY_MS) / 1000,
        days,
        total: days.reduce((a, b) => a + b, 0),
      });
    }
    if (weeks.length === 0) throw new Error("empty calendar");
    cacheLife("hours");
    return { total: cal.totalContributions, weeks };
  } catch (err) {
    console.warn(`[github] contributions: ${(err as Error).message}`);
    cacheLife("minutes");
    return null;
  }
}

/** Last-year contributions across all of the owner's public activity, or null. */
export async function getUserContributions(): Promise<{ total: number; weeks: CommitWeek[] } | null> {
  return fetchUserContributions();
}

async function fetchPublicRepoCount(): Promise<number | null> {
  "use cache: remote";

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);
  try {
    let res: Response;
    try {
      res = await fetch(`https://api.github.com/users/${OWNER}`, {
        headers: ghHeaders(),
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) throw new Error(`user ${res.status}`);
    const data = (await res.json()) as { public_repos?: number };
    if (typeof data.public_repos !== "number") throw new Error("no public_repos");
    cacheLife("days");
    return data.public_repos;
  } catch (err) {
    console.warn(`[github] public_repos: ${(err as Error).message}`);
    cacheLife("minutes");
    return null;
  }
}

/** Number of public repos owned by the user, or null. */
export async function getPublicRepoCount(): Promise<number | null> {
  return fetchPublicRepoCount();
}
