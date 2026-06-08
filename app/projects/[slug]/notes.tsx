"use client";

import { useActionState } from "react";
import Link from "next/link";
import { postNote, type NoteFormState } from "./actions";
import type { Note } from "@/lib/community";

const initial: NoteFormState = { ok: false };

function formatDate(iso: string): string {
  // sqlite datetime('now') is "YYYY-MM-DD HH:MM:SS" in UTC
  return new Date(iso.replace(" ", "T") + "Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Notes({
  project,
  notes,
  currentName,
  signedIn,
}: {
  project: string;
  notes: Note[];
  currentName: string | null;
  signedIn: boolean;
}) {
  const [state, action, pending] = useActionState(postNote, initial);

  return (
    <>
      {signedIn ? (
        // key on notes.length so a successful post (which adds a note via
        // revalidate) remounts the form and clears the inputs.
        <form key={notes.length} action={action} className="space-y-2">
          <input type="hidden" name="project" value={project} />
          <input
            name="name"
            defaultValue={currentName ?? ""}
            placeholder="Display name"
            maxLength={60}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <textarea
            name="body"
            rows={3}
            required
            maxLength={2000}
            placeholder="Add a note…"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
          >
            {pending ? "Posting…" : "Post"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-neutral-500">
          <Link
            href="/signin"
            className="underline underline-offset-4 hover:text-neutral-900"
          >
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      <ul className="mt-8 space-y-5">
        {notes.length === 0 && (
          <li className="text-sm text-neutral-400">No notes yet. Be the first.</li>
        )}
        {notes.map((n) => (
          <li key={n.id} className="border-l-2 border-neutral-200 pl-4">
            <div className="text-xs text-neutral-500">
              {n.author} · {formatDate(n.createdAt)}
            </div>
            <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-800">
              {n.body}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
