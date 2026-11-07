import type { ProjectStatus } from "@/lib/projects";

const color: Record<ProjectStatus, string> = {
  live: "text-emerald-700 dark:text-emerald-400",
  beta: "text-sky-700 dark:text-sky-400",
  alpha: "text-amber-700 dark:text-amber-400",
  demo: "text-violet-700 dark:text-violet-400",
  concept: "text-neutral-500",
};

/** Status as coloured mono text. `label` is the localized status word. */
export function StatusText({ status, label }: { status: ProjectStatus; label: string }) {
  return (
    <span className={`font-mono text-[11.5px] whitespace-nowrap ${color[status]}`}>{label}</span>
  );
}

/** Short facts as a faint mono row. */
export function FactsRow({ facts }: { facts: string[] }) {
  if (facts.length === 0) return null;
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 font-mono text-xs text-neutral-500 tabular-nums">
      {facts.map((f) => (
        <li key={f}>{f}</li>
      ))}
    </ul>
  );
}
