import Link from "next/link";
import type { FeedEntry } from "@/lib/feed";
import { Sparkline } from "@/components/sparkline";
import { StatusBadge } from "@/components/status-badge";

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

/**
 * One ledger row inside a category feed. Rows are plain grid items — the
 * `<ul>` wrapper (app/[category]/page.tsx) supplies the single bordered
 * container; hover reads as a background tint, not a border lift. Rollup-less
 * projects (no weekly history published yet) still render a full row —
 * summary/authorship/week are simply absent.
 */
export function FeedCard({ entry }: { entry: FeedEntry }) {
  const hasSpark = entry.spark.length >= 2;

  return (
    // The detail-page link is an overlay so the external "visit" link can sit
    // inside the row without nesting anchors (it stacks above via z-10).
    <li className="relative grid grid-cols-[1fr_auto] gap-x-6 gap-y-2.5 border-t border-neutral-200 p-5 transition-colors first:border-t-0 hover:bg-neutral-50 max-[560px]:grid-cols-1 sm:p-6">
      <Link
        href={`/projects/${entry.project}`}
        aria-label={`${entry.projectName} — project page`}
        className="absolute inset-0"
      />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge status={entry.status} />
          {hasSpark && (
            <>
              <span className="text-neutral-300" aria-hidden="true">
                /
              </span>
              <Sparkline values={entry.spark} />
            </>
          )}
          {!entry.weekOf && (
            <>
              <span className="text-neutral-300" aria-hidden="true">
                /
              </span>
              <span className="mono-label">no rollup published</span>
            </>
          )}
        </div>

        <h3 className="mt-2 font-serif text-2xl leading-tight tracking-tight text-neutral-900">
          {entry.projectName}
        </h3>
        <p className="mt-1 font-serif text-base italic text-neutral-600">{entry.tagline}</p>
        {entry.summary && (
          <p className="mt-2.5 max-w-[60ch] text-sm leading-relaxed text-neutral-600">
            {entry.summary}
          </p>
        )}
        {entry.sessionCount !== null && (
          <p className="mono-label mt-3">
            ↳ from claude · {entry.sessionCount} session{entry.sessionCount === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 whitespace-nowrap text-right max-[560px]:flex-row max-[560px]:items-baseline max-[560px]:justify-start max-[560px]:gap-4 max-[560px]:text-left">
        {entry.weekOf ? (
          <span className="mono-label">week of {weekLabel(entry.weekOf)}</span>
        ) : (
          <span className="mono-label text-neutral-300">—</span>
        )}
        {entry.url ? (
          <a
            href={entry.url}
            target="_blank"
            rel="noopener"
            className="relative z-10 font-mono text-[0.62rem] tracking-wide text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
          >
            visit {host(entry.url)} ↗
          </a>
        ) : (
          entry.weekOf && <span className="mono-label text-neutral-300">github only</span>
        )}
      </div>
    </li>
  );
}
