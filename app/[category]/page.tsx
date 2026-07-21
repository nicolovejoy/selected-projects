import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories, isCategory, categoryLabel } from "@/lib/projects";
import { getGroupedFeed } from "@/lib/feed";
import { FeedCard } from "@/components/feed-card";
import { site } from "@/content/site";

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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

  const group = (await getGroupedFeed()).find((g) => g.key === category);
  if (!group) notFound();

  return (
    <div className="mx-auto max-w-xl px-5 pb-20">
      <div className="pt-6">
        <Link href="/" className="mono-label hover:text-neutral-600">
          ← all work
        </Link>
      </div>

      <h1 className="pt-4 pb-6 font-serif text-4xl leading-tight tracking-tight">{group.label}</h1>

      <ul className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {group.entries.map((e) => (
          <FeedCard key={e.project} entry={e} />
        ))}
      </ul>
    </div>
  );
}
