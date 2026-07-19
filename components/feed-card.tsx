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

function host(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

export function FeedCard({ entry }: { entry: FeedEntry }) {
  return (
    // The detail-page link is an overlay so the external "visit" link can sit
    // inside the card without nesting anchors (it stacks above via z-10).
    <li className="relative rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300">
      <Link
        href={`/projects/${entry.project}`}
        aria-label={`${entry.projectName} — project page`}
        className="absolute inset-0 rounded-xl"
      />

      <div className="flex items-center justify-between gap-3">
        <span className="mono-label inline-flex items-center gap-1.5 text-[11px] text-neutral-600">
          <span className={`size-1.5 rounded-full ${statusDot[entry.status]}`} aria-hidden />
          {entry.project}
        </span>
        <span className="shrink-0 text-xs text-neutral-400">
          week of {weekLabel(entry.weekOf)}
        </span>
      </div>

      <div className="mt-3 flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-neutral-900">{entry.tagline}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-700">{entry.summary}</p>
        </div>
        {entry.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.image}
            alt=""
            loading="lazy"
            className="mt-1 hidden size-20 shrink-0 rounded-lg border border-neutral-200 object-cover sm:block"
          />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="mono-label">
          ↳ from claude · {entry.sessionCount} session{entry.sessionCount === 1 ? "" : "s"}
        </span>
        {entry.url && (
          <a
            href={entry.url}
            target="_blank"
            rel="noopener"
            className="relative z-10 shrink-0 text-xs font-medium text-neutral-800 underline underline-offset-4 hover:text-neutral-950"
          >
            visit {host(entry.url)} ↗
          </a>
        )}
      </div>
    </li>
  );
}
