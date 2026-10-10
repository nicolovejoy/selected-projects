/**
 * Page bodies shared by the English and French routes. Each route file under
 * app/(en) and app/(fr)/fr is a one-line wrapper that picks a locale.
 */
import Link from "next/link";
import type { MDXContent } from "mdx/types";
import { getGroupedFeed } from "@/lib/feed";
import { getSessionUser } from "@/lib/auth";
import { CategoryTile } from "@/components/category-tile";
import { MachineNote } from "@/components/machine-note";
import { strings } from "@/content/strings";
import { localePath, type Locale } from "@/lib/i18n";

import HomeEn from "@/content/home.mdx";
import HomeFr from "@/content/fr/home.mdx";
import AboutEn, { metadata as aboutEnMeta } from "@/content/about.mdx";
import AboutFr, { metadata as aboutFrMeta } from "@/content/fr/about.mdx";
import TenetsEn, { metadata as tenetsEnMeta } from "@/content/tenets.mdx";
import TenetsFr, { metadata as tenetsFrMeta } from "@/content/fr/tenets.mdx";
import LessonsEn, { metadata as lessonsEnMeta } from "@/content/vibe-coding-lessons.mdx";
import LessonsFr, { metadata as lessonsFrMeta } from "@/content/fr/vibe-coding-lessons.mdx";

type Meta = { title: string };
type Doc = { Body: MDXContent; meta: Meta };

const docs: Record<"about" | "tenets" | "lessons", Record<Locale, Doc>> = {
  about: {
    en: { Body: AboutEn, meta: aboutEnMeta as Meta },
    fr: { Body: AboutFr, meta: aboutFrMeta as Meta },
  },
  tenets: {
    en: { Body: TenetsEn, meta: tenetsEnMeta as Meta },
    fr: { Body: TenetsFr, meta: tenetsFrMeta as Meta },
  },
  lessons: {
    en: { Body: LessonsEn, meta: lessonsEnMeta as Meta },
    fr: { Body: LessonsFr, meta: lessonsFrMeta as Meta },
  },
};

const homeIntro: Record<Locale, MDXContent> = { en: HomeEn, fr: HomeFr };

// No `unstable_instant` on the home routes: they are fully static, and 16.2.4's
// validator then misreports the root layout's static metadata as runtime data
// (E1085, "would have been entirely prerenderable") and fails the build.
// scripts/nav-cost.mjs is the check for this route instead.
export async function HomeView({ locale }: { locale: Locale }) {
  const groups = await getGroupedFeed(locale);
  const t = strings[locale].home;
  const Intro = homeIntro[locale];

  return (
    <div className="mx-auto flex max-w-5xl flex-col px-5 pb-4">
      <section className="pt-4 pb-3">
        <h1 className="font-serif text-2xl leading-tight tracking-tight sm:text-3xl lg:text-4xl">
          {t.heading}
        </h1>
        {/* Hidden on phones: the four tiles + heading exactly fill an iPhone screen,
            and this paragraph is the one element that pushes it into scrolling. */}
        <div className="mt-2 text-[15px] leading-relaxed text-neutral-500 max-sm:hidden">
          <Intro />
        </div>
      </section>

      {groups.length === 0 ? (
        <p className="text-sm text-neutral-400">{t.empty}</p>
      ) : (
        // Single column on phones so project names aren't truncated; a true 2x2
        // from sm up. All four stay on one screen either way. The min-height at
        // lg stops the grid collapsing into a strip on a tall desktop window.
        <div className="grid grid-cols-1 gap-2 sm:gap-3 [grid-auto-rows:minmax(0,1fr)] sm:grid-cols-2 lg:min-h-[58vh]">
          {groups.map((g) => (
            <CategoryTile key={g.key} group={g} locale={locale} />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <Link
          href={localePath(locale, "/connect")}
          className="font-medium text-neutral-800 hover:text-neutral-950"
        >
          {t.getInTouch}
        </Link>
      </div>
    </div>
  );
}

/** Title + MDX body pages (about, tenets). */
export function DocView({ doc, locale }: { doc: "about" | "tenets"; locale: Locale }) {
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
              <p>
                {t.teaserBefore}
                <Link href={localePath(locale, "/tenets")}>{t.teaserLink}</Link>
                {t.teaserAfter}
              </p>
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
