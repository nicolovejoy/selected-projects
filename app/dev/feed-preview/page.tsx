/**
 * THROWAWAY visual prototype for the mobile-first feed redesign (voice C).
 * Hardcoded sample data — no DB, no auth, no real history wiring.
 * Uses the real site nav/footer from the root layout. Delete after design sign-off.
 */

type Status = "live" | "beta" | "alpha" | "demo" | "concept";

const statusDot: Record<Status, string> = {
  live: "bg-emerald-500",
  beta: "bg-sky-500",
  alpha: "bg-amber-500",
  demo: "bg-violet-500",
  concept: "bg-neutral-400",
};

type Entry = {
  project: string;
  status: Status;
  ago: string;
  summary: string;
  sessions: number;
};

const ENTRIES: Entry[] = [
  {
    project: "selected-projects",
    status: "live",
    ago: "2 days ago",
    summary:
      "Reframed the home page around a single cross-project feed, with a soft sign-in gate and a proper mobile menu.",
    sessions: 3,
  },
  {
    project: "prompt-lab",
    status: "beta",
    ago: "4 days ago",
    summary:
      "Backfilled 163 session summaries and 39 weekly rollups into the public history tables — the feed has something to show now.",
    sessions: 5,
  },
  {
    project: "musicforge",
    status: "alpha",
    ago: "6 days ago",
    summary:
      "Reworked the synth engine's voice allocation so held chords stop stealing each other's notes.",
    sessions: 4,
  },
  {
    project: "lojong",
    status: "beta",
    ago: "1 week ago",
    summary:
      "Added streak tracking and softened the daily reminder cadence so it nudges instead of nags.",
    sessions: 2,
  },
  {
    project: "prntd",
    status: "demo",
    ago: "1 week ago",
    summary:
      "Tightened the 3D-print quote flow — fewer steps from upload to a price you can act on.",
    sessions: 3,
  },
  {
    project: "rocksculpture",
    status: "concept",
    ago: "2 weeks ago",
    summary:
      "Prototyped the gallery layout with lazy-loaded hero stills and a slower, calmer scroll.",
    sessions: 1,
  },
];

const GATED: Entry[] = [
  {
    project: "ibuild4you",
    status: "beta",
    ago: "3 weeks ago",
    summary: "Reworked onboarding so a first project scaffolds in under a minute.",
    sessions: 2,
  },
  {
    project: "musicforge",
    status: "alpha",
    ago: "3 weeks ago",
    summary: "Early pass at a pattern sequencer behind the keyboard view.",
    sessions: 2,
  },
];

function EntryCard({ e }: { e: Entry }) {
  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-600">
          <span className={`size-1.5 rounded-full ${statusDot[e.status]}`} aria-hidden />
          {e.project}
        </span>
        <span className="shrink-0 text-xs text-neutral-400">{e.ago}</span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-800">{e.summary}</p>
      <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
        ↳ from claude · {e.sessions} session{e.sessions === 1 ? "" : "s"}
      </div>
    </li>
  );
}

export default function FeedPreview() {
  return (
    <div className="bg-neutral-50">
      <main className="mx-auto max-w-md px-5 pb-20">
        {/* feed header */}
        <section className="pt-9 pb-6">
          <h1 className="font-serif text-4xl leading-tight tracking-tight">
            What&rsquo;s cooking
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">
            Experiments in AI and vibe-coding — updated as the work happens.
          </p>
        </section>

        {/* feed */}
        <ul className="space-y-3">
          {ENTRIES.map((e, i) => (
            <EntryCard key={`${e.project}-${i}`} e={e} />
          ))}
        </ul>

        {/* soft gate */}
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-7 text-center">
          <h2 className="font-serif text-xl tracking-tight">Like what you see?</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-neutral-500">
            Sign in to follow projects and join the conversation.
          </p>
          <a
            href="/signin"
            className="mt-5 block w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Sign in
          </a>
          <button className="mt-2 w-full px-4 py-2 text-sm text-neutral-500 hover:text-neutral-800">
            Keep looking
          </button>
        </div>

        {/* faded, gated entries underneath */}
        <ul className="pointer-events-none mt-3 space-y-3 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]">
          {GATED.map((e, i) => (
            <EntryCard key={`gated-${i}`} e={e} />
          ))}
        </ul>
      </main>
    </div>
  );
}
