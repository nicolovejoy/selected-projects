import { createClient, type Client } from "@libsql/client";

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

let _client: Client | undefined;
function client(): Client | undefined {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) return undefined;
  _client = createClient({ url, authToken });
  return _client;
}

export async function getProjectHistory(historyKey: string): Promise<ProjectHistory> {
  const c = client();
  if (!c) return EMPTY;

  try {
    const [weeklyRes, recentRes] = await Promise.all([
      c.execute({
        sql: `SELECT week_of, public_summary, session_count, commit_count
              FROM public_weekly_rollups
              WHERE project = ? AND public_summary IS NOT NULL AND public_summary != ''
              ORDER BY week_of DESC
              LIMIT 6`,
        args: [historyKey],
      }),
      c.execute({
        sql: `SELECT session_id, started_at, public_summary
              FROM public_session_summaries
              WHERE project = ? AND public_summary IS NOT NULL AND public_summary != ''
              ORDER BY started_at DESC
              LIMIT 5`,
        args: [historyKey],
      }),
    ]);

    const weekly: WeeklyRollup[] = weeklyRes.rows.map((r) => ({
      weekOf: String(r.week_of),
      publicSummary: String(r.public_summary),
      sessionCount: Number(r.session_count ?? 0),
      commitCount: Number(r.commit_count ?? 0),
    }));

    const recent: SessionSummary[] = recentRes.rows.map((r) => ({
      sessionId: Number(r.session_id),
      startedAt: String(r.started_at),
      publicSummary: String(r.public_summary),
    }));

    const totals = await c.execute({
      sql: `SELECT MIN(started_at) AS first_at, MAX(started_at) AS last_at, COUNT(*) AS n
            FROM public_session_summaries
            WHERE project = ?`,
      args: [historyKey],
    });
    const row = totals.rows[0];

    return {
      weekly,
      recent,
      firstActivityAt: row?.first_at ? String(row.first_at) : undefined,
      lastActivityAt: row?.last_at ? String(row.last_at) : undefined,
      totalSessions: Number(row?.n ?? 0),
    };
  } catch (err) {
    if (isMissingTable(err)) return EMPTY;
    console.warn(`[history] read failed for ${historyKey}:`, err);
    return EMPTY;
  }
}

function isMissingTable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /no such table:\s*public_(session_summaries|weekly_rollups)/.test(msg);
}
