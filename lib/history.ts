export type WeeklyRollup = {
  weekOf: string;
  publicSummary: string;
  sessionCount: number;
  commitCount: number;
};

export type SessionSummary = {
  sessionId: number;
  startedAt: string;
  publicSummary: string;
};

export type ProjectHistory = {
  weekly: WeeklyRollup[];
  recent: SessionSummary[];
  firstActivityAt?: string;
  lastActivityAt?: string;
  totalSessions: number;
};

const EMPTY: ProjectHistory = {
  weekly: [],
  recent: [],
  totalSessions: 0,
};

const API_BASE =
  process.env.PROMPT_LAB_API_BASE ?? "https://prompt-labs.org";

type ApiResponse = {
  project: string;
  sessions?: Array<{ session_id: number; started_at: string; public_summary: string }>;
  rollups?: Array<{
    week_of: string;
    public_summary: string;
    session_count: number;
    commit_count: number;
  }>;
  first_activity_at?: string | null;
  last_activity_at?: string | null;
  total_sessions?: number;
};

export async function getProjectHistory(historyKey: string): Promise<ProjectHistory> {
  const url = `${API_BASE}/api/public_history?project=${encodeURIComponent(historyKey)}&limit=5`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.status === 404) return EMPTY;
    if (!res.ok) {
      console.warn(`[history] ${url} → ${res.status}`);
      return EMPTY;
    }

    const data = (await res.json()) as ApiResponse;

    const weekly: WeeklyRollup[] = (data.rollups ?? []).slice(0, 6).map((r) => ({
      weekOf: r.week_of,
      publicSummary: r.public_summary,
      sessionCount: r.session_count ?? 0,
      commitCount: r.commit_count ?? 0,
    }));

    const recent: SessionSummary[] = (data.sessions ?? []).map((s) => ({
      sessionId: s.session_id,
      startedAt: s.started_at,
      publicSummary: s.public_summary,
    }));

    return {
      weekly,
      recent,
      firstActivityAt: data.first_activity_at ?? undefined,
      lastActivityAt: data.last_activity_at ?? undefined,
      totalSessions: data.total_sessions ?? 0,
    };
  } catch (err) {
    console.warn(`[history] fetch failed for ${historyKey}:`, err);
    return EMPTY;
  }
}
