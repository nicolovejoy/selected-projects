import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getGroupedFeed } from "@/lib/feed";
import { CategoryTile } from "@/components/category-tile";
import Home from "@/content/home.mdx";

export default async function HomePage() {
  const user = await getSessionUser();
  const groups = await getGroupedFeed();

  return (
    <div className="mx-auto flex max-w-5xl flex-col px-5 pb-4">
      <section className="pt-5 pb-3">
        <h1 className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
          What&rsquo;s cooking
        </h1>
        <div className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-neutral-500 sm:line-clamp-none">
          <Home />
        </div>
      </section>

      {groups.length === 0 ? (
        <p className="text-sm text-neutral-400">Nothing here yet — history is still syncing.</p>
      ) : (
        // Two columns at every width so all four quadrants stay on one screen,
        // phone included. Equal-height rows keep the grid reading as a grid.
        <div className="grid grid-cols-2 gap-3 [grid-auto-rows:minmax(0,1fr)]">
          {groups.map((g) => (
            <CategoryTile key={g.key} group={g} />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <Link href="/connect" className="font-medium text-neutral-800 hover:text-neutral-950">
          Get in touch
        </Link>
        {!user && (
          <Link href="/signin" className="text-neutral-500 hover:text-neutral-800">
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
