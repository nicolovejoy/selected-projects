import type { CommitWeek } from "@/lib/github";

// GitHub's 5-level green scale.
const LEVELS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

function level(n: number): number {
  if (n <= 0) return 0;
  if (n <= 2) return 1;
  if (n <= 5) return 2;
  if (n <= 9) return 3;
  return 4;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ContributionCalendar({ weeks }: { weeks: CommitWeek[] }) {
  const cols = weeks.length;
  const total = weeks.reduce((sum, w) => sum + w.total, 0);

  // One month label at the first column where a new month begins.
  const labels: { col: number; text: string }[] = [];
  let prevMonth = -1;
  weeks.forEach((w, i) => {
    const m = new Date(w.week * 1000).getMonth();
    if (m !== prevMonth) {
      labels.push({ col: i + 1, text: MONTHS[m] });
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
              title={`${count} commit${count === 1 ? "" : "s"}`}
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
        {total} commit{total === 1 ? "" : "s"} in the last year
      </figcaption>
    </figure>
  );
}
