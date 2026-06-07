"use client";

import Link from "next/link";
import { followAction } from "./actions";

export function FollowButton({
  project,
  following,
  signedIn,
}: {
  project: string;
  following: boolean;
  signedIn: boolean;
}) {
  if (!signedIn) {
    return (
      <Link
        href="/signin"
        className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-500"
      >
        Follow along
      </Link>
    );
  }

  return (
    <form action={followAction}>
      <input type="hidden" name="project" value={project} />
      <button
        type="submit"
        className={
          following
            ? "rounded-md border border-neutral-900 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-900"
            : "rounded-md border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-500"
        }
      >
        {following ? "Following ✓" : "Follow along"}
      </button>
    </form>
  );
}
