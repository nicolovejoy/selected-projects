import crypto from "node:crypto";
import { db } from "@/lib/db";

export type Note = {
  id: string;
  body: string;
  createdAt: string;
  author: string; // display name, never an email
  authorId: string; // server-side only — strip before passing to client components
};

const MAX_NOTE_LENGTH = 2000;
const MAX_NAME_LENGTH = 60;

export async function getNotes(project: string): Promise<Note[]> {
  try {
    const res = await db().execute({
      sql: `SELECT n.id, n.body, n.created_at, n.user_id, u.name AS author
              FROM notes n JOIN users u ON u.id = n.user_id
             WHERE n.project = ?
             ORDER BY n.created_at DESC
             LIMIT 200`,
      args: [project],
    });
    return res.rows.map((r) => ({
      id: String(r.id),
      body: String(r.body),
      createdAt: String(r.created_at),
      author: r.author ? String(r.author) : "anonymous",
      authorId: String(r.user_id),
    }));
  } catch (err) {
    console.error("[community] getNotes failed", err);
    return [];
  }
}

export async function isFollowing(userId: string, project: string): Promise<boolean> {
  try {
    const res = await db().execute({
      sql: `SELECT 1 FROM follows WHERE user_id = ? AND project = ? LIMIT 1`,
      args: [userId, project],
    });
    return res.rows.length > 0;
  } catch (err) {
    console.error("[community] isFollowing failed", err);
    return false;
  }
}

export async function followerCount(project: string): Promise<number> {
  try {
    const res = await db().execute({
      sql: `SELECT COUNT(*) AS c FROM follows WHERE project = ?`,
      args: [project],
    });
    return Number(res.rows[0]?.c ?? 0);
  } catch (err) {
    console.error("[community] followerCount failed", err);
    return 0;
  }
}

/** Toggles follow state; returns the new state (true = now following). */
export async function toggleFollow(userId: string, project: string): Promise<boolean> {
  if (await isFollowing(userId, project)) {
    await db().execute({
      sql: `DELETE FROM follows WHERE user_id = ? AND project = ?`,
      args: [userId, project],
    });
    return false;
  }
  await db().execute({
    sql: `INSERT INTO follows (user_id, project) VALUES (?, ?)`,
    args: [userId, project],
  });
  return true;
}

export async function setUserName(userId: string, name: string): Promise<void> {
  await db().execute({
    sql: `UPDATE users SET name = ? WHERE id = ?`,
    args: [name.slice(0, MAX_NAME_LENGTH), userId],
  });
}

export async function addNote(
  userId: string,
  project: string,
  body: string,
): Promise<void> {
  await db().execute({
    sql: `INSERT INTO notes (id, project, user_id, body) VALUES (?, ?, ?, ?)`,
    args: [crypto.randomUUID(), project, userId, body.slice(0, MAX_NOTE_LENGTH)],
  });
}

/** Admin deletes anything; an author deletes only their own. Returns whether a row was removed. */
export async function deleteNote(
  noteId: string,
  requester: { userId: string; admin: boolean },
): Promise<boolean> {
  const res = await db().execute({
    sql: `DELETE FROM notes WHERE id = ? AND (? OR user_id = ?)`,
    args: [noteId, requester.admin ? 1 : 0, requester.userId],
  });
  return res.rowsAffected > 0;
}

export async function countRecentNotes(userId: string): Promise<number> {
  const res = await db().execute({
    sql: `SELECT COUNT(*) AS c FROM notes
           WHERE user_id = ? AND created_at > datetime('now', '-1 hour')`,
    args: [userId],
  });
  return Number(res.rows[0]?.c ?? 0);
}

export { MAX_NOTE_LENGTH, MAX_NAME_LENGTH };
