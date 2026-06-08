import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProject, getProjectBody, projectHistoryKey, projects } from "@/lib/projects";
import { getProjectHistory } from "@/lib/history";
import { getCommitActivity, getPublicRepo } from "@/lib/github";
import { getSessionUser } from "@/lib/auth";
import { getNotes, isFollowing } from "@/lib/community";
import { StatusBadge } from "@/components/status-badge";
import { ContributionCalendar } from "@/components/contribution-calendar";
import { CollapsibleSection } from "@/components/collapsible-section";
import { OgPreview } from "@/components/og-preview";
import { Evolution } from "@/components/evolution";
import { FollowButton } from "./follow-button";
import { Notes } from "./notes";

async function CommitGraph({ github }: { github: string }) {
  const weeks = await getCommitActivity(github);
  if (!weeks) return null;
  return <ContributionCalendar weeks={weeks} />;
}

export const revalidate = 86400;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  const Body = getProjectBody(slug);
  if (!project || !Body) notFound();

  const history = await getProjectHistory(projectHistoryKey(project));
  const user = await getSessionUser();
  const notes = await getNotes(slug);
  const following = user ? await isFollowing(user.id, slug) : false;
  const repo = project.github ? await getPublicRepo(project.github) : null;

  const hasEvolution =
    history.totalSessions > 0 || history.weekly.length > 0 || history.recent.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← All projects
      </Link>

      {/* Above the fold: title + actions on the left, live-site preview on the right. */}
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <header>
            <div className="flex items-baseline justify-between gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="mt-2 text-lg text-neutral-600">{project.tagline}</p>
            {(project.url || repo) && (
              <div className="mt-4 flex flex-wrap gap-3">
                {project.url && (
                  <a
                    href={project.url}
                    className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit site
                  </a>
                )}
                {repo && (
                  <a
                    href={repo.htmlUrl}
                    className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Code on GitHub
                  </a>
                )}
              </div>
            )}
          </header>

          <div className="mt-4 flex flex-wrap gap-3">
            <FollowButton project={slug} following={following} signedIn={!!user} />
            <Link
              href={`/connect?project=${project.slug}`}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-500"
            >
              Get in touch about this
            </Link>
          </div>
        </div>

        {project.url && (
          <div className="shrink-0 sm:w-80">
            <Suspense
              fallback={
                <div className="aspect-[1200/630] w-full animate-pulse rounded-xl bg-neutral-100" />
              }
            >
              <OgPreview project={project} />
            </Suspense>
          </div>
        )}
      </div>

      <CollapsibleSection title="about" defaultOpen>
        <article className="prose prose-stone prose-lg max-w-none">
          <Body />
        </article>
      </CollapsibleSection>

      {(hasEvolution || project.github) && (
        <CollapsibleSection title="evolution">
          {hasEvolution && <Evolution history={history} />}
          {project.github && (
            <Suspense
              fallback={<div className="mt-8 h-[100px] animate-pulse rounded-lg bg-neutral-100" />}
            >
              <CommitGraph github={project.github} />
            </Suspense>
          )}
        </CollapsibleSection>
      )}

      <CollapsibleSection title="notes">
        <Notes
          project={slug}
          notes={notes}
          currentName={user?.name ?? null}
          signedIn={!!user}
        />
      </CollapsibleSection>
    </div>
  );
}
