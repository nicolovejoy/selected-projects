/**
 * Feed prototype, now wired to REAL cross-project history (voice C).
 * Still under /dev pending a decision on how it composes into the home
 * (feed-only vs. hero + feed). No auth/DB writes here.
 */

import Link from "next/link";
import { getFeed, type FeedEntry } from "@/lib/feed";
import type { ProjectStatus } from "@/lib/projects";

const statusDot: Record<ProjectStatus, string> = {
  live: "bg-emerald-500",
  beta: "bg-sky-500",
  alpha: "bg-amber-500",
  demo: "bg-violet-500",
  concept: "bg-neutral-400",
};

function weekLabel(iso: string): string {
  return new Date(iso.replace(" ", "T") + "Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function EntryCard({ e }: { e: FeedEntry }) {
  return (
    <li>
      <Link
        href={`/projects/${e.project}`}
        className="block rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-600">
            <span className={`size-1.5 rounded-full ${statusDot[e.status]}`} aria-hidden />
            {e.project}
          </span>
          <span className="shrink-0 text-xs text-neutral-400">week of {weekLabel(e.weekOf)}</span>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-800">{e.summary}</p>
        <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
          ↳ from claude · {e.sessionCount} session{e.sessionCount === 1 ? "" : "s"}
        </div>
      </Link>
    </li>
  );
}

export default async function FeedPreview() {
  const feed = await getFeed(30);
  const visible = feed.slice(0, 6);
  const gated = feed.slice(6, 9);

  return (
    <div className="bg-neutral-50">
      <main className="mx-auto max-w-md px-5 pb-20">
        <section className="pt-9 pb-6">
          <h1 className="font-serif text-4xl leading-tight tracking-tight">
            What&rsquo;s cooking
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">
            Experiments in AI and vibe-coding — updated as the work happens.
          </p>
        </section>

        {feed.length === 0 ? (
          <p className="text-sm text-neutral-400">
            Nothing in the feed yet — history is still syncing.
          </p>
        ) : (
          <>
            <ul className="space-y-3">
              {visible.map((e, i) => (
                <EntryCard key={`${e.project}-${e.weekOf}-${i}`} e={e} />
              ))}
            </ul>

            {gated.length > 0 && (
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
                  <button className="mt-2 w-full px-4 py-2 text-sm text-neutral-500 hover:text-neutral-800">
                    Keep looking
                  </button>
                </div>

                <ul className="pointer-events-none mt-3 space-y-3 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]">
                  {gated.map((e, i) => (
                    <EntryCard key={`gated-${e.project}-${i}`} e={e} />
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
