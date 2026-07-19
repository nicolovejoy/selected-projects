import type { ProjectStatus } from "@/lib/projects";

// Dots stay -500 (readable on both themes); the label text lifts to -400 in
// dark so the saturated -700 shades don't sink into the dark surface.
const styles: Record<ProjectStatus, { dot: string; text: string }> = {
  live: { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  beta: { dot: "bg-sky-500", text: "text-sky-700 dark:text-sky-400" },
  alpha: { dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  demo: { dot: "bg-violet-500", text: "text-violet-700 dark:text-violet-400" },
  concept: { dot: "bg-neutral-400", text: "text-neutral-500" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = styles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs uppercase tracking-wider ${s.text}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}
