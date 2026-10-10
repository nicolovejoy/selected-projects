import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories, isCategory, categoryLabel } from "@/lib/projects";
import { getGroupedFeed } from "@/lib/feed";
import { FeedCard } from "@/components/feed-card";
import { strings } from "@/content/strings";
import { localePath, type Locale } from "@/lib/i18n";

type Params = Promise<{ category: string }>;

export function categoryStaticParams() {
  return categories.map((c) => ({ category: c.key }));
}

export async function categoryMetadata(params: Params, locale: Locale): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return {};
  return { title: `${categoryLabel(category, locale)} — ${strings[locale].site.title}` };
}

// Awaiting `params` suspends (it's only known at request/nav time for a dynamic
// segment), so it needs its own boundary per the instant-navigation guide's
// /store/[slug] pattern. The feed lookup lives here too since it depends on
// `category`; getGroupedFeed() itself is already 'use cache' and cheap once warm.
async function CategoryBody({ params, locale }: { params: Params; locale: Locale }) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

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

export function CategoryView({ params, locale }: { params: Params; locale: Locale }) {
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
        <CategoryBody params={params} locale={locale} />
      </Suspense>
    </div>
  );
}
