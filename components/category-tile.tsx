import Link from "next/link";
import type { FeedGroup } from "@/lib/feed";
import { Sparkline } from "@/components/sparkline";
import type { ProjectStatus } from "@/lib/projects";

const statusDot: Record<ProjectStatus, string> = {
  live: "bg-emerald-500",
  beta: "bg-sky-500",
  alpha: "bg-amber-500",
  demo: "bg-violet-500",
  concept: "bg-neutral-400",
};

/**
 * One quadrant of the home grid. Every project in the category gets a row with
 * an activity sparkline; a supporting line (the latest rollup summary, or the
 * tagline when nothing is published) appears from md up, where there's room.
 */
export function CategoryTile({ group }: { group: FeedGroup }) {
  const top = group.entries.slice(0, 3);
  const rest = group.entries.length - top.length;

  return (
    <Link
      href={`/${group.key}`}
      className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-3.5 transition hover:border-neutral-400 sm:p-5"
    >
      <h2 className="mono-label">{group.label}</h2>

      <ul className="mt-2.5 flex-1 space-y-2 sm:space-y-4">
        {top.map((e) => (
          <li key={e.project}>
            <div className="flex items-center gap-2">
              <span
                className={`size-1.5 shrink-0 rounded-full ${statusDot[e.status]}`}
                aria-hidden
              />
              <span className="text-sm font-medium text-neutral-900">{e.projectName}</span>
              <Sparkline values={e.spark} className="ml-auto" />
            </div>
            {/* max-md:hidden rather than `hidden md:…` — line-clamp sets its own
                display and won't reliably override display:none at equal specificity. */}
            <p className="mt-1 pl-3.5 text-xs leading-snug text-neutral-500 max-md:hidden md:line-clamp-2">
              {e.summary ?? e.tagline}
            </p>
          </li>
        ))}
      </ul>

      <p className="mono-label mt-3 max-sm:hidden group-hover:text-neutral-600">
        {rest > 0 ? `+${rest} more →` : "view →"}
      </p>
    </Link>
  );
}
