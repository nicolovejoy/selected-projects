import type { ProjectStatus } from "@/lib/projects";

const styles: Record<ProjectStatus, { dot: string; text: string }> = {
  live: { dot: "bg-emerald-500", text: "text-emerald-700" },
  beta: { dot: "bg-sky-500", text: "text-sky-700" },
  alpha: { dot: "bg-amber-500", text: "text-amber-700" },
  demo: { dot: "bg-violet-500", text: "text-violet-700" },
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
