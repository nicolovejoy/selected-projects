"use client";

import Link from "next/link";
import { followAction } from "./actions";
import { strings } from "@/content/strings";
import { localePath, type Locale } from "@/lib/i18n";

import { btn } from "@/components/project/buttons";

export function FollowButton({
  project,
  following,
  signedIn,
  locale,
}: {
  project: string;
  following: boolean;
  signedIn: boolean;
  locale: Locale;
}) {
  const t = strings[locale].project;
  if (!signedIn) {
    return (
      <Link href={localePath(locale, "/signin")} className={btn}>
        {t.follow}
      </Link>
    );
  }

  return (
    <form action={followAction} className="contents">
      <input type="hidden" name="project" value={project} />
      <button type="submit" className={`${btn} cursor-pointer`}>
        {following ? t.following : t.follow}
      </button>
    </form>
  );
}
