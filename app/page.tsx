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
      <section className="pt-4 pb-3">
        <h1 className="font-serif text-2xl leading-tight tracking-tight sm:text-3xl lg:text-4xl">
          What&rsquo;s cooking
        </h1>
        {/* Hidden on phones: the four tiles + heading exactly fill an iPhone screen,
            and this paragraph is the one element that pushes it into scrolling. */}
        <div className="mt-2 text-[15px] leading-relaxed text-neutral-500 max-sm:hidden">
          <Home />
        </div>
      </section>

      {groups.length === 0 ? (
        <p className="text-sm text-neutral-400">Nothing here yet — history is still syncing.</p>
      ) : (
        // Single column on phones so project names aren't truncated; a true 2x2
        // from sm up. All four stay on one screen either way. The min-height at
        // lg stops the grid collapsing into a strip on a tall desktop window.
        <div className="grid grid-cols-1 gap-2 sm:gap-3 [grid-auto-rows:minmax(0,1fr)] sm:grid-cols-2 lg:min-h-[58vh]">
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
