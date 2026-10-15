import { cacheLife } from "next/cache";

export type WeeklyRollup = {
  weekOf: string;
  /** Null for counts-only weeks — the prose is human-gated, the counts aren't. */
  publicSummary: string | null;
  sessionCount: number;
  commitCount: number;
};

export type SessionSummary = {
  sessionId: number;
  startedAt: string;
  publicSummary: string;
};

/** One week of true activity from the private endpoint, oldest→newest. */
export type ActivityWeek = {
  weekOf: string;
  sessionCount: number;
  commitCount: number;
};

export type ProjectHistory = {
  weekly: WeeklyRollup[];
  recent: SessionSummary[];
  firstActivityAt?: string;
  lastActivityAt?: string;
  totalSessions: number;
  /** All-time commit count. Null when the private endpoint didn't answer — the
   *  public endpoint has no true figure, and summing displayed rollups is wrong. */
  totalCommits: number | null;
  /** True weekly activity, oldest→newest. Empty when only the public data answered. */
  activity: ActivityWeek[];
};

const EMPTY: ProjectHistory = {
  weekly: [],
  recent: [],
  totalSessions: 0,
  totalCommits: null,
  activity: [],
};

const API_BASE =
  process.env.PROMPT_LAB_API_BASE ?? "https://prompt-labs.org";

type ApiResponse = {
  project: string;
  sessions?: Array<{ session_id: number; started_at: string; public_summary: string }>;
  rollups?: Array<{
    week_of: string;
    public_summary: string | null;
    session_count: number;
    commit_count: number;
  }>;
  first_activity_at?: string | null;
  last_activity_at?: string | null;
  total_sessions?: number;
};

type PrivateApiResponse = ApiResponse & {
  total_commits?: number;
  total_prompts?: number;
  activity?: Array<{
    week_of: string;
    session_count: number;
    commit_count: number;
    prompt_count?: number;
  }>;
};

type PublicHistory = Pick<
  ProjectHistory,
  "weekly" | "recent" | "firstActivityAt" | "lastActivityAt" | "totalSessions"
>;

type PrivateTotals = Pick<
  ProjectHistory,
  "firstActivityAt" | "lastActivityAt" | "totalSessions" | "totalCommits" | "activity"
>;

const EMPTY_PUBLIC: PublicHistory = { weekly: [], recent: [], totalSessions: 0 };

/**
 * Public endpoint: human-gated prose (weekly summaries, recent sessions) plus
 * published-only counts. Cached by `historyKey`. The try/catch lives inside
 * the cached scope so a failure never throws out of it: a 404 (no history
 * yet) is cached for `hours` as empty, any other miss briefly (`minutes`).
 */
async function fetchPublicHistory(historyKey: string): Promise<PublicHistory> {
  "use cache";

  const url = `${API_BASE}/api/public_history?project=${encodeURIComponent(historyKey)}&limit=5`;

  try {
    const res = await fetch(url);
    if (res.status === 404) {
      cacheLife("hours");
      return EMPTY_PUBLIC;
    }
    if (!res.ok) {
      console.warn(`[history] ${url} → ${res.status}`);
      cacheLife("minutes");
      return EMPTY_PUBLIC;
    }

    const data = (await res.json()) as ApiResponse;

    const weekly: WeeklyRollup[] = (data.rollups ?? []).slice(0, 6).map((r) => ({
      weekOf: r.week_of,
      publicSummary: r.public_summary ?? null,
      sessionCount: r.session_count ?? 0,
      commitCount: r.commit_count ?? 0,
    }));

    const recent: SessionSummary[] = (data.sessions ?? []).map((s) => ({
      sessionId: s.session_id,
      startedAt: s.started_at,
      publicSummary: s.public_summary,
    }));

    cacheLife("hours");
    return {
      weekly,
      recent,
      firstActivityAt: data.first_activity_at ?? undefined,
      lastActivityAt: data.last_activity_at ?? undefined,
      totalSessions: data.total_sessions ?? 0,
    };
  } catch (err) {
    console.warn(`[history] fetch failed for ${historyKey}:`, err);
    cacheLife("minutes");
    return EMPTY_PUBLIC;
  }
}

/**
 * Private endpoint (prompt-lab Tier 1, live since 2026-08-02): the same
 * envelope with *true* all-time counts and weekly `activity[]`, behind a
 * shared service key. Prose is never returned here — `rollups[]` is
 * counts-only and `sessions[]` is empty — so this only ever corrects numbers.
 *
 * Returns null when the key is unset (local dev without it) or the call
 * fails, and the caller keeps the public figures. The key is read inside the
 * cached scope so it's never part of the cache key.
 */
async function fetchPrivateTotals(historyKey: string): Promise<PrivateTotals | null> {
  "use cache";

  const key = process.env.PROMPT_LAB_SERVICE_KEY;
  if (!key) {
    cacheLife("hours");
    return null;
  }

  const url = `${API_BASE}/api/private_history?project=${encodeURIComponent(historyKey)}`;

  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) {
      console.warn(`[history] ${url} → ${res.status}`);
      cacheLife("minutes");
      return null;
    }

    const data = (await res.json()) as PrivateApiResponse;

    const activity: ActivityWeek[] = (data.activity ?? [])
      .map((w) => ({
        weekOf: w.week_of,
        sessionCount: w.session_count ?? 0,
        commitCount: w.commit_count ?? 0,
      }))
      .sort((a, b) => a.weekOf.localeCompare(b.weekOf));

    cacheLife("hours");
    return {
      firstActivityAt: data.first_activity_at ?? undefined,
      lastActivityAt: data.last_activity_at ?? undefined,
      totalSessions: data.total_sessions ?? 0,
      totalCommits: data.total_commits ?? null,
      activity,
    };
  } catch (err) {
    console.warn(`[history] private fetch failed for ${historyKey}:`, err);
    cacheLife("minutes");
    return null;
  }
}

/**
 * Prose from the public endpoint, numbers from the private one when it
 * answers. Both halves are cached independently so a private-side miss
 * never shortens the public entry's lifetime, and vice versa.
 */
export async function getProjectHistory(historyKey: string): Promise<ProjectHistory> {
  const [pub, priv] = await Promise.all([
    fetchPublicHistory(historyKey),
    fetchPrivateTotals(historyKey),
  ]);
  if (!priv) return { ...EMPTY, ...pub };
  return {
    weekly: pub.weekly,
    recent: pub.recent,
    firstActivityAt: priv.firstActivityAt ?? pub.firstActivityAt,
    lastActivityAt: priv.lastActivityAt ?? pub.lastActivityAt,
    totalSessions: Math.max(priv.totalSessions, pub.totalSessions),
    totalCommits: priv.totalCommits,
    activity: priv.activity,
  };
}
