"use client";

import Link from "next/link";
import { followAction } from "./actions";

const actLink =
  "font-mono text-[0.66rem] tracking-[0.08em] uppercase text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900 hover:decoration-neutral-500";

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
      <Link href="/signin" className={actLink}>
        follow
      </Link>
    );
  }

  return (
    <form action={followAction} className="contents">
      <input type="hidden" name="project" value={project} />
      <button type="submit" className={following ? `${actLink} text-neutral-900` : actLink}>
        {following ? "following ✓" : "follow"}
      </button>
    </form>
  );
}
