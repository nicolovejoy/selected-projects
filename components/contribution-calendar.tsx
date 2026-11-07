import type { CommitWeek } from "@/lib/github";
import { strings } from "@/content/strings";
import { intlTag, plural, type Locale } from "@/lib/i18n";

// GitHub's 5-level activity scale, tokenized — the light ramp darkens as it
// intensifies, so dark mode needs the inverse ramp or busy days read dimmest.
const LEVELS = ["var(--cal-0)", "var(--cal-1)", "var(--cal-2)", "var(--cal-3)", "var(--cal-4)"];

function level(n: number): number {
  if (n <= 0) return 0;
  if (n <= 2) return 1;
  if (n <= 5) return 2;
  if (n <= 9) return 3;
  return 4;
}


export function ContributionCalendar({
  weeks,
  locale,
  caption,
  fill = false,
}: {
  weeks: CommitWeek[];
  locale: Locale;
  /** Replaces the default "N commits in the last year" caption. */
  caption?: string;
  /** Scale the cells to the container width (no month labels, no caption;
   *  the caller supplies its own). `caption` becomes the accessible name. */
  fill?: boolean;
}) {
  const t = strings[locale];
  const monthFmt = new Intl.DateTimeFormat(intlTag[locale], { month: "short" });
  const commits = (n: number) => plural(n, t.evolution.commit, t.evolution.commits, locale);
  const cols = weeks.length;
  const total = weeks.reduce((sum, w) => sum + w.total, 0);

  if (fill) {
    return (
      <figure className="m-0">
        <div
          role="img"
          aria-label={caption}
          className="grid w-full grid-flow-col grid-rows-7 gap-0.5 sm:gap-[3px]"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            aspectRatio: `${cols} / 7`,
          }}
        >
          {weeks.map((w) =>
            w.days.map((count, di) => (
              <span
                key={`${w.week}-${di}`}
                className="rounded-[2px]"
                style={{ backgroundColor: LEVELS[level(count)] }}
              />
            )),
          )}
        </div>
      </figure>
    );
  }

  // One month label at the first column where a new month begins.
  const labels: { col: number; text: string }[] = [];
  let prevMonth = -1;
  weeks.forEach((w, i) => {
    const d = new Date(w.week * 1000);
    const m = d.getMonth();
    if (m !== prevMonth) {
      labels.push({ col: i + 1, text: monthFmt.format(d) });
      prevMonth = m;
    }
  });

  return (
    <figure className="mt-8 overflow-x-auto">
      <div
        className="grid w-max gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${cols}, 11px)`,
          gridTemplateRows: "auto repeat(7, 11px)",
        }}
      >
        {labels.map((l) => (
          <span
            key={`${l.col}-${l.text}`}
            className="text-[10px] leading-none text-neutral-400"
            style={{ gridColumnStart: l.col, gridRow: 1 }}
          >
            {l.text}
          </span>
        ))}
        {weeks.map((w, ci) =>
          w.days.map((count, di) => (
            <span
              key={`${ci}-${di}`}
              title={commits(count)}
              className="rounded-[2px]"
              style={{
                gridColumnStart: ci + 1,
                gridRowStart: di + 2,
                backgroundColor: LEVELS[level(count)],
              }}
            />
          )),
        )}
      </div>
      <figcaption className="mt-2 text-xs text-neutral-500">
        {caption ?? t.calendar.caption(commits(total))}
      </figcaption>
    </figure>
  );
}
