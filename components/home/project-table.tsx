import Link from "next/link";
import { StatusText } from "@/components/project-facts";
import type { HomeEntry } from "@/lib/feed";
import { strings } from "@/content/strings";
import { localePath, type Locale } from "@/lib/i18n";

export function ProjectTable({ entries, locale }: { entries: HomeEntry[]; locale: Locale }) {
  const t = strings[locale].home.table;
  const th = "pr-3 pb-2 text-left text-xs font-medium text-neutral-500 border-b border-neutral-900";
  const td = "max-[600px]:block max-[600px]:border-0 max-[600px]:py-0.5 max-[600px]:pr-0 align-top border-b border-neutral-200 py-3.5 pr-3";
  return (
    <table className="mt-1 block w-full border-collapse min-[601px]:table">
      <thead className="max-[600px]:hidden">
        <tr>
          <th className={th}>{t.project}</th>
          <th className={th}>{t.state}</th>
          <th className={th}>{t.what}</th>
          <th className={`${th} text-right`}>{t.facts}</th>
        </tr>
      </thead>
      <tbody className="max-[600px]:block">
        {entries.map((e) => (
          <tr
            key={e.project}
            className="max-[600px]:block max-[600px]:border-b max-[600px]:border-neutral-200 max-[600px]:py-3"
          >
            <td className={`${td} min-[601px]:w-[1%] font-serif text-[19px] font-medium min-[601px]:whitespace-nowrap`}>
              <Link
                href={localePath(locale, `/projects/${e.project}`)}
                className="hover:underline hover:underline-offset-4"
              >
                {e.projectName}
              </Link>
            </td>
            <td className={`${td} min-[601px]:w-[1%] min-[601px]:whitespace-nowrap`}>
              <StatusText status={e.status} label={strings[locale].status[e.status]} />
            </td>
            <td className={td}>
              {e.tagline}
              {e.hard && <small className="mt-0.5 block text-sm text-neutral-600">{e.hard}</small>}
            </td>
            <td
              className={`${td} min-[601px]:w-[1%] font-mono text-xs text-neutral-500 tabular-nums min-[601px]:text-right min-[601px]:whitespace-nowrap`}
            >
              {e.facts.map((f) => (
                <div key={f}>{f}</div>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
