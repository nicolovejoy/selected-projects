import Link from "next/link";
import { CardMedia } from "@/components/card-media";
import { FactsRow, StatusText } from "@/components/project-facts";
import type { HomeEntry } from "@/lib/feed";
import { strings } from "@/content/strings";
import { localePath, type Locale } from "@/lib/i18n";

export function FeaturedCard({ entry, locale }: { entry: HomeEntry; locale: Locale }) {
  return (
    <Link
      href={localePath(locale, `/projects/${entry.project}`)}
      className="group flex min-w-0 flex-col gap-2.5"
    >
      <CardMedia project={entry} image={entry.image} />
      <div className="mt-1 flex items-baseline gap-3">
        <span className="font-serif text-[22px] leading-[1.15] font-medium group-hover:underline group-hover:underline-offset-4">
          {entry.projectName}
        </span>
        <span className="ml-auto">
          <StatusText status={entry.status} label={strings[locale].status[entry.status]} />
        </span>
      </div>
      <p className="m-0">{entry.tagline}</p>
      {entry.hard && <p className="m-0 text-sm text-neutral-600">{entry.hard}</p>}
      <FactsRow facts={entry.facts} />
    </Link>
  );
}
