import { Suspense } from "react";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getGroupedFeed } from "@/lib/feed";
import { CategoryTile } from "@/components/category-tile";
import Home from "@/content/home.mdx";

// Fails the build if a future change reintroduces a blocking read on this route
// (e.g. an uncached fetch or a cookie read outside Suspense) instead of failing silently.
// `samples` models an anonymous visitor — see app/[category]/page.tsx for why both
// routes need it (the root layout's Nav reads the session cookie too, not just
// SignInLink); the signed-in path isn't covered by this check.
// `samples` is undocumented under `prefetch: "static"` (instant.md types it only on
// `'runtime'`, and cookie `value` as `string`) — works in 16.2.4 since the config
// parser reads it regardless of mode, but that's version-dependent.
export const unstable_instant = {
  prefetch: "static",
  samples: [{ cookies: [{ name: "ph_session", value: null }] }],
};

/** Isolated so getSessionUser()'s cookie read doesn't hold the feed out of the prerendered shell. */
async function SignInLink() {
  const user = await getSessionUser();
  if (user) return null;
  return (
    <Link href="/signin" className="text-neutral-500 hover:text-neutral-800">
      Sign in
    </Link>
  );
}

export default async function HomePage() {
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
        <Suspense fallback={null}>
          <SignInLink />
        </Suspense>
      </div>
    </div>
  );
}
