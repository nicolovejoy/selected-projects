import { cacheLife } from "next/cache";
import {
  localizedProjects,
  categoryLabel,
  projectHistoryKey,
  categories,
  type ProjectStatus,
  type ProjectCategory,
} from "@/lib/projects";
import { getProjectHistory, type ProjectHistory } from "@/lib/history";
import { getOgPreview } from "@/lib/og";
import type { Locale } from "@/lib/i18n";
import type { Project } from "@/lib/projects";

export type FeedEntry = {
  project: string;
  projectName: string;
  status: ProjectStatus;
  category: ProjectCategory;
  tagline: string;
  url: string | null;
  /** Precedence: curated cardImage > live OG scrape > legacy image field. */
  image: string | null;
  /** Null when no weekly rollup has been published — the card still renders. */
  weekOf: string | null;
  summary: string | null;
  sessionCount: number | null;
  /** Sessions per week, oldest→newest, for the activity sparkline. Empty when unpublished. */
  spark: number[];
};

export type FeedGroup = { key: ProjectCategory; label: string; entries: FeedEntry[] };

const SPARK_WEEKS = 12;
const DAY_MS = 86_400_000;

/** Monday of the week containing `now`, as YYYY-MM-DD on Nico's calendar
 *  (Pacific), matching the upstream `week_of` convention. */
function currentWeekOf(now: number): string {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(now);
  // From here on it's pure UTC-midnight arithmetic on an already-Pacific
  // calendar day, so `toISOString().slice(0, 10)` can't roll the date over.
  const d = new Date(`${day}T00:00:00Z`);
  const back = (d.getUTCDay() + 6) % 7; // Mon → 0 … Sun → 6
  return new Date(d.getTime() - back * DAY_MS).toISOString().slice(0, 10);
}

/**
 * True weekly sessions when the private endpoint answered — a 12-week
 * calendar window ending this week, quiet weeks filled as 0, because
 * `activity[]` only lists weeks that had sessions and a gap would otherwise
 * collapse into one step. Otherwise the published rollups' counts, as before.
 *
 * `Date.now()` evaluates when the enclosing feed cache entry fills; its
 * `hours` lifetime keeps the window current.
 */
function sparkValues(history: ProjectHistory): number[] {
  if (history.activity.length > 0) {
    const byWeek = new Map(history.activity.map((w) => [w.weekOf, w.sessionCount]));
    const end = new Date(`${currentWeekOf(Date.now())}T00:00:00Z`).getTime();
    return Array.from({ length: SPARK_WEEKS }, (_, i) => {
      const weekOf = new Date(end - (SPARK_WEEKS - 1 - i) * 7 * DAY_MS).toISOString().slice(0, 10);
      return byWeek.get(weekOf) ?? 0;
    });
  }
  return [...history.weekly]
    .sort((a, b) => a.weekOf.localeCompare(b.weekOf))
    .map((w) => w.sessionCount);
}

async function toEntry(p: Project): Promise<FeedEntry> {
  const [history, og] = await Promise.all([
    getProjectHistory(projectHistoryKey(p)),
    p.url ? getOgPreview(p.url) : null,
  ]);
  const latest = [...history.weekly].sort((a, b) => b.weekOf.localeCompare(a.weekOf))[0];
  return {
    project: p.slug,
    projectName: p.name,
    status: p.status,
    category: p.category,
    tagline: p.tagline,
    url: p.url ?? null,
    image: p.cardImage ?? og?.image ?? p.image ?? null,
    weekOf: latest?.weekOf ?? null,
    summary: latest?.publicSummary ?? null,
    sessionCount: latest?.sessionCount ?? null,
    spark: sparkValues(history),
  };
}

/**
 * Every project, grouped into category sections. The weekly rollup is optional
 * enrichment: a project with no published rollup still gets a card from its own
 * frontmatter, so the site never hides work just because the upstream history
 * feed is stale. Within a category, projects with recent activity come first
 * and rollup-less ones fall to the end in manifest order.
 */
export async function getGroupedFeed(locale: Locale = "en"): Promise<FeedGroup[]> {
  "use cache";
  // Explicit outer lifetime: a project whose url lacks an og:image (recountly.org
  // did, until it became Raconte) fails its OG scrape and caches as `minutes`
  // (1 min revalidate).
  // Without this explicit `hours` override, that leaf's short lifetime would
  // win at this level too, and the feed — plus the `/` and category shells
  // that render it — would regenerate on nearly every request instead of
  // staying in the prerendered shell for an hour.
  cacheLife("hours");

  // `locale` is an argument, so it's part of the cache key: one entry per language.
  const entries = await Promise.all(localizedProjects(locale).map(toEntry));

  return categories
    .map(({ key }) => ({
      key,
      label: categoryLabel(key, locale),
      entries: entries
        .filter((e) => e.category === key)
        .sort((a, b) => (b.weekOf ?? "").localeCompare(a.weekOf ?? "")),
    }))
    .filter((g) => g.entries.length > 0);
}
