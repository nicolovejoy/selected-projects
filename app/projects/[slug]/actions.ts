"use server";

import { revalidatePath } from "next/cache";
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

const MAX_NOTES_PER_HOUR = 5;

function validProject(slug: string): boolean {
  return projects.some((p) => p.slug === slug);
}

export type NoteFormState = { ok: boolean; error?: string };

export async function postNote(
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in to post a note." };

  const project = String(formData.get("project") ?? "");
  if (!validProject(project)) return { ok: false, error: "Unknown project." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { ok: false, error: "Write something first." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name && !user.name) {
    return { ok: false, error: "Add a display name so people know who's talking." };
  }

  try {
    if ((await countRecentNotes(user.id)) >= MAX_NOTES_PER_HOUR) {
      return { ok: false, error: "That's a lot of notes at once — try again in an hour." };
    }
    if (name) await setUserName(user.id, name);
    await addNote(user.id, project, body);
  } catch (err) {
    console.error("[community] postNote failed", err);
    return { ok: false, error: "Couldn't post that. Try again in a minute?" };
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

  revalidatePath(`/projects/${project}`);
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
    if (removed) revalidatePath(`/projects/${project}`);
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
    revalidatePath(`/projects/${project}`);
  } catch (err) {
    console.error("[community] followAction failed", err);
  }
}
