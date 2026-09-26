import { db } from "@/lib/db";

export const MAX_CONNECTS_PER_EMAIL_PER_HOUR = 5;
export const MAX_CONNECTS_PER_IP_PER_HOUR = 10;

/**
 * Submissions in the last rolling hour for this email (case-insensitive) and
 * this truncated IP. A null ip counts 0 — the IP key doesn't apply.
 */
export async function countRecentConnects(
  email: string,
  ip: string | null,
): Promise<{ byEmail: number; byIp: number }> {
  const res = await db().execute({
    sql: `SELECT
            COALESCE(SUM(lower(email) = lower(?)), 0) AS by_email,
            COALESCE(SUM(ip = ?), 0) AS by_ip
          FROM connect_submissions
          WHERE created_at > datetime('now', '-1 hour')`,
    args: [email, ip],
  });
  const row = res.rows[0];
  return { byEmail: Number(row?.by_email ?? 0), byIp: Number(row?.by_ip ?? 0) };
}
