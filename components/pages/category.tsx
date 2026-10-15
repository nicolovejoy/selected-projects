import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categoryLabel, type ProjectCategory } from "@/lib/projects";
import { getGroupedFeed } from "@/lib/feed";
import { FeedCard } from "@/components/feed-card";
import { strings } from "@/content/strings";
import { localePath, type Locale } from "@/lib/i18n";

export function categoryMetadata(category: ProjectCategory, locale: Locale): Metadata {
  return { title: `${categoryLabel(category, locale)} — ${strings[locale].site.title}` };
}

// Each category is its own static route folder (app/(en)/music, …) rather than
// a [category] segment, so an unknown path like /nope matches nothing and gets
// a true 404 from global-not-found (#36). The feed lookup stays under Suspense;
// getGroupedFeed() is 'use cache', so the whole page prerenders.
async function CategoryBody({ category, locale }: { category: ProjectCategory; locale: Locale }) {
  const group = (await getGroupedFeed(locale)).find((g) => g.key === category);
  if (!group) notFound();

  return (
    <>
      <h1 className="pt-4 pb-6 font-serif text-4xl leading-tight tracking-tight">{group.label}</h1>

      <ul className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {group.entries.map((e) => (
          <FeedCard key={e.project} entry={e} locale={locale} />
        ))}
      </ul>
    </>
  );
}

export function CategoryView({ category, locale }: { category: ProjectCategory; locale: Locale }) {
  const t = strings[locale];
  return (
    <div className="mx-auto max-w-xl px-5 pb-20">
      <div className="pt-6">
        <Link href={localePath(locale, "/")} className="mono-label hover:text-neutral-600">
          {t.feed.allWork}
        </Link>
      </div>

      {/* Matches the route loading.tsx's mono "loading" label so the fallback reads as
          the same idiom as a full route-level load, just scoped to this section. */}
      <Suspense
        fallback={
          <p className="pt-6 font-mono text-[0.625rem] tracking-[0.12em] text-faint uppercase">
            {t.site.loading}
          </p>
        }
      >
        <CategoryBody category={category} locale={locale} />
      </Suspense>
    </div>
  );
}
