"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { projects } from "@/lib/projects";
import { addNote, setUserName, toggleFollow } from "@/lib/community";

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
    if (name) await setUserName(user.id, name);
    await addNote(user.id, project, body);
  } catch (err) {
    console.error("[community] postNote failed", err);
    return { ok: false, error: "Couldn't post that. Try again in a minute?" };
  }

  revalidatePath(`/projects/${project}`);
  return { ok: true };
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
