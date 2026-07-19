import type { ProjectHistory } from "@/lib/history";

function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function headline(history: ProjectHistory): string | undefined {
  if (history.totalSessions === 0 || !history.firstActivityAt) return undefined;
  const firstSeen = formatMonthYear(history.firstActivityAt);
  const sessions = `${history.totalSessions} session${history.totalSessions === 1 ? "" : "s"}`;
  const commits = history.weekly.reduce((sum, w) => sum + w.commitCount, 0);
  const commitText = commits > 0 ? ` · ${commits} commit${commits === 1 ? "" : "s"}` : "";
  return `Active since ${firstSeen} · ${sessions}${commitText}`;
}

export function Evolution({ history }: { history: ProjectHistory }) {
  const head = headline(history);
  const hasWeekly = history.weekly.length > 0;
  const hasRecent = history.recent.length > 0;
  if (!head && !hasWeekly && !hasRecent) return null;

  return (
    <>
      {head && <p className="text-sm text-neutral-600">{head}</p>}

      <div className="mono-label mt-4">
        ↳ from claude · auto-generated at each session handoff
      </div>

      {hasWeekly && (
        <ol className="mt-4 space-y-5">
          {history.weekly.map((w) => (
            <li key={w.weekOf} className="border-l-2 border-neutral-200 pl-4">
              <div className="text-xs uppercase tracking-wide text-neutral-500">
                week of {formatRelative(w.weekOf)}
                {w.sessionCount > 0 && (
                  <span className="ml-2 text-neutral-400">
                    · {w.sessionCount} session{w.sessionCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <p className="mt-1 italic text-neutral-500 leading-relaxed">{w.publicSummary}</p>
            </li>
          ))}
        </ol>
      )}

      {!hasWeekly && hasRecent && (
        <ol className="mt-4 space-y-4">
          {history.recent.map((s) => (
            <li key={s.sessionId} className="border-l-2 border-neutral-200 pl-4">
              <div className="text-xs uppercase tracking-wide text-neutral-500">
                {formatRelative(s.startedAt)}
              </div>
              <p className="mt-1 italic text-neutral-500 leading-relaxed">{s.publicSummary}</p>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
