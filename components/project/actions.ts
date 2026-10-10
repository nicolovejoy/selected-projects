"use server";

import { refresh } from "next/cache";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { projects } from "@/lib/projects";
import {
  addNote,
  countRecentNotes,
  deleteNote,
  setUserName,
  toggleFollow,
} from "@/lib/community";
import { sendNoteAlert } from "@/lib/email";
import { strings } from "@/content/strings";

const MAX_NOTES_PER_HOUR = 5;

function validProject(slug: string): boolean {
  return projects.some((p) => p.slug === slug);
}

export type NoteFormState = { ok: boolean; error?: string };

export async function postNote(
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const err = strings[formData.get("locale") === "fr" ? "fr" : "en"].notes.errors;
  const user = await getSessionUser();
  if (!user) return { ok: false, error: err.signIn };

  const project = String(formData.get("project") ?? "");
  if (!validProject(project)) return { ok: false, error: err.unknownProject };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { ok: false, error: err.empty };

  const name = String(formData.get("name") ?? "").trim();
  if (!name && !user.name) {
    return { ok: false, error: err.name };
  }

  try {
    if ((await countRecentNotes(user.id)) >= MAX_NOTES_PER_HOUR) {
      return { ok: false, error: err.tooMany };
    }
    if (name) await setUserName(user.id, name);
    await addNote(user.id, project, body);
  } catch (e) {
    console.error("[community] postNote failed", e);
    return { ok: false, error: err.failed };
  }

  // Moderation alert; a failed send must never block the note.
  try {
    await sendNoteAlert({
      project,
      author: name || user.name || "anonymous",
      authorEmail: user.email,
      body,
    });
  } catch (err) {
    console.error("[community] note alert failed", err);
  }

  // Notes/follow state are read per request outside any 'use cache' scope, so
  // there's nothing cached to invalidate here — revalidatePath would only purge
  // the shared prerendered shell for every visitor. refresh() re-renders just
  // the acting user's current route instead.
  refresh();
  return { ok: true };
}

export async function deleteNoteAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  const project = String(formData.get("project") ?? "");
  if (!validProject(project)) return;
  const noteId = String(formData.get("noteId") ?? "");
  if (!noteId) return;
  try {
    const removed = await deleteNote(noteId, { userId: user.id, admin: isAdmin(user) });
    if (removed) refresh();
  } catch (err) {
    console.error("[community] deleteNoteAction failed", err);
  }
}

export async function followAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  const project = String(formData.get("project") ?? "");
  if (!validProject(project)) return;
  try {
    await toggleFollow(user.id, project);
    refresh();
  } catch (err) {
    console.error("[community] followAction failed", err);
  }
}
