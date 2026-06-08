import Link from "next/link";
import Image from "next/image";
import { projects, projectHistoryKey } from "@/lib/projects";
import { getProjectHistory } from "@/lib/history";
import { StatusBadge } from "@/components/status-badge";

export const metadata = { title: "projects" };

export default async function ProjectsPage() {
  // Sort by most recent work; projects with no history fall to the end.
  const withActivity = await Promise.all(
    projects.map(async (p) => ({
      p,
      last: (await getProjectHistory(projectHistoryKey(p))).lastActivityAt ?? "",
    })),
  );
  const ordered = withActivity
    .sort((a, b) => b.last.localeCompare(a.last))
    .map((x) => x.p);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">projects</h1>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2">
        {ordered.map((p) => {
          const bg = p.cardImage;
          return (
            <li key={p.slug}>
              <Link
                href={`/projects/${p.slug}`}
                className="group relative isolate flex h-64 flex-col justify-between overflow-hidden rounded-lg border border-neutral-200 p-8 transition hover:border-neutral-400"
              >
                {bg && (
                  <>
                    <Image
                      src={bg}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="-z-10 object-cover transition group-hover:scale-[1.02]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 bg-gradient-to-t from-white via-white/85 to-white/40"
                    />
                  </>
                )}
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-medium">{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm text-neutral-700">{p.tagline}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
