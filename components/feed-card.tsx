import Link from "next/link";
import type { FeedEntry } from "@/lib/feed";
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

export function FeedCard({ entry }: { entry: FeedEntry }) {
  return (
    <li>
      <Link
        href={`/projects/${entry.project}`}
        className="block rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-600">
            <span className={`size-1.5 rounded-full ${statusDot[entry.status]}`} aria-hidden />
            {entry.project}
          </span>
          <span className="shrink-0 text-xs text-neutral-400">
            week of {weekLabel(entry.weekOf)}
          </span>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-800">{entry.summary}</p>
        <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
          ↳ from claude · {entry.sessionCount} session{entry.sessionCount === 1 ? "" : "s"}
        </div>
      </Link>
    </li>
  );
}
