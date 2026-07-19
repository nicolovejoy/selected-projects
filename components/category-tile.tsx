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
 * One quadrant of the home grid. Shows up to three projects: name + activity
 * sparkline everywhere, plus a two-line summary only once there's room for it,
 * so all four tiles still fit a phone screen without scrolling.
 */
export function CategoryTile({ group }: { group: FeedGroup }) {
  const top = group.entries.slice(0, 3);
  const rest = group.entries.length - top.length;

  return (
    <Link
      href={`/${group.key}`}
      className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-400 sm:p-5"
    >
      <h2 className="mono-label">{group.label}</h2>

      <ul className="mt-3 flex-1 space-y-2 sm:space-y-3">
        {top.map((e) => (
          <li key={e.project}>
            <div className="flex items-center gap-2">
              <span className={`size-1.5 shrink-0 rounded-full ${statusDot[e.status]}`} aria-hidden />
              <span className="truncate text-[13px] font-medium text-neutral-900 sm:text-sm">
                {e.projectName}
              </span>
              <Sparkline values={e.spark} className="ml-auto" />
            </div>
            {e.summary && (
              <p className="mt-1 hidden pl-3.5 text-xs leading-snug text-neutral-500 lg:line-clamp-2">
                {e.summary}
              </p>
            )}
          </li>
        ))}
      </ul>

      <p className="mono-label mt-3 group-hover:text-neutral-600">
        {rest > 0 ? `+${rest} more →` : "view →"}
      </p>
    </Link>
  );
}
