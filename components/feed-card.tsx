import Link from "next/link";
import type { FeedEntry } from "@/lib/feed";
import { FactsRow, StatusText } from "@/components/project-facts";
import { strings } from "@/content/strings";
import { formatDate, localePath, type Locale } from "@/lib/i18n";

function host(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

/**
 * One row in a category list, set like the home table's rows: thumbnail left
 * (always the still image, never video), then name / state / tagline / hard /
 * facts, and the latest write-up week on the right. Rows are separated by a
 * hairline; the name is the link to the detail page, and the external "visit"
 * link sits beside it without nesting anchors.
 */
export function FeedCard({ entry, locale }: { entry: FeedEntry; locale: Locale }) {
  const t = strings[locale].feed;

  return (
    <li className="flex gap-4 border-b border-neutral-200 py-3.5">
      {entry.image && (
        <div className="w-24 shrink-0 pt-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={entry.image}
            alt=""
            loading="lazy"
            className="aspect-[1200/630] w-full rounded-[2px] border border-neutral-200 bg-neutral-50 object-cover"
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="m-0 font-serif text-[19px] leading-[1.2] font-medium">
            <Link
              href={localePath(locale, `/projects/${entry.project}`)}
              aria-label={t.projectPageAria(entry.projectName)}
              className="hover:underline hover:underline-offset-4"
            >
              {entry.projectName}
            </Link>
          </h3>
          <StatusText status={entry.status} label={strings[locale].status[entry.status]} />
          {entry.weekOf && (
            <span className="ml-auto text-xs whitespace-nowrap text-faint">
              {t.weekOf(formatDate(entry.weekOf, locale, { month: "short", day: "numeric" }))}
            </span>
          )}
        </div>
        <p className="mt-1 mb-0">{entry.tagline}</p>
        {entry.hard && <p className="mt-0.5 mb-0 text-sm text-neutral-600">{entry.hard}</p>}
        {entry.facts.length > 0 && (
          <div className="mt-2">
            <FactsRow facts={entry.facts} />
          </div>
        )}
        {entry.summary && (
          <p lang="en" className="mt-2.5 mb-0 max-w-[60ch] text-sm leading-relaxed text-neutral-500 italic">
            {entry.summary}
          </p>
        )}
        {entry.url && (
          <a
            href={entry.url}
            target="_blank"
            rel="noopener"
            className="mt-2 inline-block font-mono text-xs text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
          >
            {t.visit(host(entry.url))}
          </a>
        )}
      </div>
    </li>
  );
}
