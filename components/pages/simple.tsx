/**
 * Page bodies shared by the English and French routes. Each route file under
 * app/(en) and app/(fr)/fr is a one-line wrapper that picks a locale.
 */
import Link from "next/link";
import type { MDXContent } from "mdx/types";
import { getHomeEntries } from "@/lib/feed";
import { getSessionUser } from "@/lib/auth";
import { Hero } from "@/components/home/hero";
import { FeaturedCard } from "@/components/home/featured-card";
import { ProjectTable } from "@/components/home/project-table";
import { MachineNote } from "@/components/machine-note";
import { strings } from "@/content/strings";
import { localePath, type Locale } from "@/lib/i18n";

import AboutEn, { metadata as aboutEnMeta } from "@/content/about.mdx";
import AboutFr, { metadata as aboutFrMeta } from "@/content/fr/about.mdx";
import LessonsEn, { metadata as lessonsEnMeta } from "@/content/vibe-coding-lessons.mdx";
import LessonsFr, { metadata as lessonsFrMeta } from "@/content/fr/vibe-coding-lessons.mdx";

type Meta = { title: string };
type Doc = { Body: MDXContent; meta: Meta };

const docs: Record<"about" | "lessons", Record<Locale, Doc>> = {
  about: {
    en: { Body: AboutEn, meta: aboutEnMeta as Meta },
    fr: { Body: AboutFr, meta: aboutFrMeta as Meta },
  },
  lessons: {
    en: { Body: LessonsEn, meta: lessonsEnMeta as Meta },
    fr: { Body: LessonsFr, meta: lessonsFrMeta as Meta },
  },
};

// No `unstable_instant` on the home routes: they are fully static, and 16.2.4's
// validator then misreports the root layout's static metadata as runtime data
// (E1085, "would have been entirely prerenderable") and fails the build.
// scripts/nav-cost.mjs is the check for this route instead.
// content/home.mdx (and fr/) is no longer rendered; the copy is in strings.home.
export async function HomeView({ locale }: { locale: Locale }) {
  const { featured, list, aside } = await getHomeEntries(locale);
  const t = strings[locale].home;

  return (
    <div className="mx-auto max-w-[1040px] px-5 pb-4">
      <Hero locale={locale} />

      <h2 className="mt-[72px] mb-[22px] font-serif text-[26px] font-normal tracking-tight">
        {t.featuredHeading}
      </h2>
      <div className="grid grid-cols-1 gap-7 min-[700px]:grid-cols-2 min-[1100px]:grid-cols-4">
        {featured.map((e) => (
          <FeaturedCard key={e.project} entry={e} locale={locale} />
        ))}
      </div>

      <h2 className="mt-[72px] mb-[22px] font-serif text-[26px] font-normal tracking-tight">
        {t.shippedHeading}
      </h2>
      <ProjectTable entries={list} locale={locale} />

      <div className="mt-14 border-t border-neutral-200 pt-5 text-sm text-neutral-600">
        <p className="m-0 max-w-[60ch]">
          {t.asideBefore}
          {aside.map((e, i) => (
            <span key={e.project}>
              {i > 0 && ", "}
              <Link
                href={localePath(locale, `/projects/${e.project}`)}
                className="border-b border-neutral-200 text-neutral-900"
              >
                {e.projectName}
              </Link>
            </span>
          ))}
          .
        </p>
      </div>
    </div>
  );
}

/** Title + MDX body pages (about). */
export function DocView({ doc, locale }: { doc: "about"; locale: Locale }) {
  const { Body, meta } = docs[doc][locale];
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{meta.title}</h1>
      <article className="prose prose-stone dark:prose-invert prose-lg mt-8 max-w-none">
        <Body />
      </article>
    </div>
  );
}

export async function LessonsView({ locale }: { locale: Locale }) {
  const user = await getSessionUser();
  const { Body, meta } = docs.lessons[locale];
  const t = strings[locale].lessons;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{meta.title}</h1>

      <article className="prose prose-stone dark:prose-invert prose-lg mt-8 max-w-none">
        {user ? (
          <Body />
        ) : (
          <>
            <MachineNote label={strings[locale].machineNote.label}>
              <p>{t.teaserBefore}</p>
            </MachineNote>

            <h2>{t.oneLineHeading}</h2>
            <p>{t.oneLine}</p>
          </>
        )}
      </article>

      {!user && (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-7 text-center">
          <h2 className="font-serif text-xl tracking-tight">{t.readAll}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
            {t.readAllBody}
          </p>
          <Link
            href={localePath(locale, "/signin")}
            className="mt-5 block w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700"
          >
            {t.signIn}
          </Link>
        </div>
      )}
    </div>
  );
}
