import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories, isCategory, categoryLabel } from "@/lib/projects";
import { getGroupedFeed } from "@/lib/feed";
import { FeedCard } from "@/components/feed-card";
import { site } from "@/content/site";

// Fails the build if a future change reintroduces a blocking read on this route
// (e.g. an uncached fetch or a cookie read outside Suspense) instead of failing silently.
// `samples` models an anonymous visitor on the "music" category (the root layout's Nav
// reads the session cookie too) — the signed-in path isn't covered by this check.
// `samples` here is outside the documented shape too — see app/page.tsx for detail.
export const unstable_instant = {
  prefetch: "static",
  samples: [{ cookies: [{ name: "ph_session", value: null }], params: { category: "music" } }],
};

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return {};
  return { title: `${categoryLabel(category)} — ${site.title}` };
}

// Awaiting `params` suspends (it's only known at request/nav time for a dynamic
// segment), so it needs its own boundary per the instant-navigation guide's
// /store/[slug] pattern. The feed lookup lives here too since it depends on
// `category`; getGroupedFeed() itself is already 'use cache' and cheap once warm.
async function CategoryBody({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

  const group = (await getGroupedFeed()).find((g) => g.key === category);
  if (!group) notFound();

  return (
    <>
      <h1 className="pt-4 pb-6 font-serif text-4xl leading-tight tracking-tight">{group.label}</h1>

      <ul className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {group.entries.map((e) => (
          <FeedCard key={e.project} entry={e} />
        ))}
      </ul>
    </>
  );
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  return (
    <div className="mx-auto max-w-xl px-5 pb-20">
      <div className="pt-6">
        <Link href="/" className="mono-label hover:text-neutral-600">
          ← all work
        </Link>
      </div>

      {/* Matches app/loading.tsx's mono "loading" label so the fallback reads as
          the same idiom as a full route-level load, just scoped to this section. */}
      <Suspense
        fallback={
          <p className="pt-6 font-mono text-[0.625rem] tracking-[0.12em] text-faint uppercase">
            loading
          </p>
        }
      >
        <CategoryBody params={params} />
      </Suspense>
    </div>
  );
}
