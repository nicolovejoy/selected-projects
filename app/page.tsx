import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getGroupedFeed } from "@/lib/feed";
import { FeedCard } from "@/components/feed-card";
import Home from "@/content/home.mdx";

export default async function HomePage() {
  const user = await getSessionUser();
  const groups = await getGroupedFeed();

  return (
    <div className="bg-neutral-50">
      <div className="mx-auto max-w-xl px-5 pb-20">
        <section className="pt-9 pb-6">
          <h1 className="font-serif text-4xl leading-tight tracking-tight">
            What&rsquo;s cooking
          </h1>
          <div className="mt-3 text-[15px] leading-relaxed text-neutral-500">
            <Home />
          </div>
        </section>

        {groups.length === 0 ? (
          <p className="text-sm text-neutral-400">
            Nothing here yet — history is still syncing.
          </p>
        ) : (
          <>
            {groups.map((g) => (
              <section key={g.key} className="mb-8">
                <h2 className="mono-label mb-3">{g.label}</h2>
                <ul className="space-y-3">
                  {g.entries.map((e) => (
                    <FeedCard key={e.project} entry={e} />
                  ))}
                </ul>
              </section>
            ))}

            <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-7 text-center">
              <h2 className="font-serif text-xl tracking-tight">Like what you see?</h2>
              <Link
                href="/connect"
                className="mt-5 block w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700"
              >
                Get in touch
              </Link>
              {!user && (
                <Link
                  href="/signin"
                  className="mt-2 block w-full px-4 py-2 text-sm text-neutral-500 hover:text-neutral-800"
                >
                  Sign in to follow projects and post notes
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
