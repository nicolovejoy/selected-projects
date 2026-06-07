import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getFeed } from "@/lib/feed";
import { FeedCard } from "@/components/feed-card";
import Home from "@/content/home.mdx";

export default async function HomePage() {
  const user = await getSessionUser();
  const feed = await getFeed(30);

  const gated = !user;
  const visible = gated ? feed.slice(0, 6) : feed;
  const peek = gated ? feed.slice(6, 9) : [];

  return (
    <div className="bg-neutral-50">
      <main className="mx-auto max-w-xl px-5 pb-20">
        <section className="pt-9 pb-6">
          <h1 className="font-serif text-4xl leading-tight tracking-tight">
            What&rsquo;s cooking
          </h1>
          <div className="mt-3 text-[15px] leading-relaxed text-neutral-500">
            <Home />
          </div>
        </section>

        {feed.length === 0 ? (
          <p className="text-sm text-neutral-400">
            Nothing in the feed yet — history is still syncing.
          </p>
        ) : (
          <>
            <ul className="space-y-3">
              {visible.map((e, i) => (
                <FeedCard key={`${e.project}-${e.weekOf}-${i}`} entry={e} />
              ))}
            </ul>

            {gated && peek.length > 0 && (
              <>
                <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-7 text-center">
                  <h2 className="font-serif text-xl tracking-tight">Like what you see?</h2>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-neutral-500">
                    Sign in to follow projects and join the conversation.
                  </p>
                  <Link
                    href="/signin"
                    className="mt-5 block w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/projects"
                    className="mt-2 block w-full px-4 py-2 text-sm text-neutral-500 hover:text-neutral-800"
                  >
                    Browse all projects
                  </Link>
                </div>

                <ul className="pointer-events-none mt-3 space-y-3 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]">
                  {peek.map((e, i) => (
                    <FeedCard key={`peek-${e.project}-${i}`} entry={e} />
                  ))}
                </ul>
              </>
            )}

            {!gated && (
              <div className="mt-8 text-center">
                <Link
                  href="/projects"
                  className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900"
                >
                  Browse all projects
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
