import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { builtWithIbuild4you, getProject, getProjectBody, projectHistoryKey, projects } from "@/lib/projects";
import { strings } from "@/content/strings";
import { formatDate, localePath, plural, type Locale } from "@/lib/i18n";
import { getProjectHistory } from "@/lib/history";
import { getCommitActivity, getPublicRepo } from "@/lib/github";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { getNotes, isFollowing } from "@/lib/community";
import { FactsRow, StatusText } from "@/components/project-facts";
import { CardMedia } from "@/components/card-media";
import { getOgPreview } from "@/lib/og";
import { btn, btnPrimary } from "@/components/project/buttons";
import type { Project } from "@/lib/projects";
import { ContributionCalendar } from "@/components/contribution-calendar";
import { CollapsibleSection } from "@/components/collapsible-section";
import { Evolution } from "@/components/evolution";
import { FollowButton } from "@/components/project/follow-button";
import { LivePreviewLayout, LivePreviewTrigger } from "@/components/project/live-preview";
import { Notes } from "@/components/project/notes";
import { BuiltWithGrid } from "@/components/project/built-with-grid";

async function CommitGraph({ github, locale }: { github: string; locale: Locale }) {
  const weeks = await getCommitActivity(github);
  if (!weeks) return null;
  return <ContributionCalendar weeks={weeks} locale={locale} />;
}

/** Same image selection as the home cards: cardVideo / cardImage, else the OG
 *  scrape, else the legacy image field, else nothing (no text tile here). */
async function DetailMedia({ project }: { project: Project }) {
  const og = project.cardImage || !project.url ? null : await getOgPreview(project.url);
  const image = project.cardImage ?? og?.image ?? project.image ?? null;
  if (!image && !project.cardVideo) return null;
  return <CardMedia project={project} image={image} />;
}

// `export const revalidate = 86400` lived here but was inert — the page reads
// cookies() below, which forced dynamic rendering regardless. cacheComponents
// rejects the segment config outright; per-scope cacheLife replaces it.

export function projectStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function projectMetadata(params: Promise<{ slug: string }>, locale: Locale) {
  const { slug } = await params;
  const project = getProject(slug, locale);
  if (!project) return {};
  return {
    title: `${project.name} — ${strings[locale].site.title}`,
    description: project.tagline,
  };
}

export async function ProjectView({
  params,
  locale,
}: {
  params: Promise<{ slug: string }>;
  locale: Locale;
}) {
  const { slug } = await params;
  const project = getProject(slug, locale);
  const Body = getProjectBody(slug, locale);
  const t = strings[locale].project;
  if (!project || !Body) notFound();

  const history = await getProjectHistory(projectHistoryKey(project));
  const user = await getSessionUser();
  const admin = isAdmin(user);
  // Strip authorId before it crosses to the client; delete rights resolve here.
  const notes = (await getNotes(slug)).map(({ authorId, ...n }) => ({
    ...n,
    canDelete: admin || (!!user && authorId === user.id),
  }));
  const following = user ? await isFollowing(user.id, slug) : false;
  const repo = project.github ? await getPublicRepo(project.github) : null;
  // embed: true requires url (validated in check-content.mjs), so this is
  // the "permitted" switch from issue #12.
  const embedUrl = project.embed ? (project.embedUrl ?? project.url) : undefined;

  const builtWith = slug === "ibuild4you" ? builtWithIbuild4you(locale) : [];

  const hasEvolution =
    history.totalSessions > 0 || history.weekly.length > 0 || history.recent.length > 0;
  const latestWeek =
    [...history.weekly].sort((a, b) => b.weekOf.localeCompare(a.weekOf))[0] ?? null;

  const body = (
    // @container: kept so the split view (#12) can squeeze this into a narrow
    // column; the header is single-column now, so nothing here reflows by width.
    <div className="@container mx-auto max-w-3xl px-6 py-16">
      <Link href={localePath(locale, "/")} className="text-[13px] text-neutral-500 hover:text-neutral-900">
        {t.allProjects}
      </Link>

      <header className="mt-8">
        {(project.cardVideo || project.cardImage || project.image || project.url) && (
          <Suspense
            fallback={<div className="aspect-[1200/630] w-full animate-pulse rounded-[2px] bg-neutral-100" />}
          >
            <DetailMedia project={project} />
          </Suspense>
        )}
        <div className="mt-5 flex items-baseline gap-3">
          <h1 className="m-0 font-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] max-[560px]:text-[2.2rem]">
            {project.name}
          </h1>
          <StatusText status={project.status} label={strings[locale].status[project.status]} />
        </div>
        <p className="mt-3 mb-0">{project.tagline}</p>
        {project.hard && <p className="mt-1 mb-0 text-sm text-neutral-600">{project.hard}</p>}
        {project.facts && project.facts.length > 0 && (
          <div className="mt-2.5">
            <FactsRow facts={project.facts} />
          </div>
        )}

        <p className="mt-4 mb-0 text-[13px] text-neutral-500">
          {t.summaryLine.kind(strings[locale].categories[project.category], strings[locale].status[project.status])}
          {latestWeek &&
            ` ${t.summaryLine.latest(
              formatDate(latestWeek.weekOf, locale, { month: "short", day: "numeric" }),
              plural(
                latestWeek.sessionCount,
                strings[locale].feed.session,
                strings[locale].feed.sessions,
                locale,
              ),
            )}`}
          {project.ibuild4you && (
            <>
              {" "}
              <Link
                href={localePath(locale, "/projects/ibuild4you")}
                className="underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
              >
                {t.builtWith}
              </Link>
            </>
          )}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {project.url && (
            <a href={project.url} className={btnPrimary} target="_blank" rel="noopener noreferrer">
              {t.visitSite}
            </a>
          )}
          {repo && (
            <a href={repo.htmlUrl} className={btn} target="_blank" rel="noopener noreferrer">
              {t.codeOnGithub}
            </a>
          )}
          {embedUrl && <LivePreviewTrigger url={embedUrl} locale={locale} />}
          <FollowButton project={slug} following={following} signedIn={!!user} locale={locale} />
          <Link href={`${localePath(locale, "/connect")}?project=${project.slug}`} className={btn}>
            {t.getInTouch}
          </Link>
        </div>
      </header>

      <CollapsibleSection title={t.sections.about} defaultOpen>
        <article className="prose prose-stone dark:prose-invert prose-lg max-w-none">
          <Body />
        </article>
      </CollapsibleSection>

      {builtWith.length > 0 && (
        <CollapsibleSection title={t.sections.builtWith} defaultOpen>
          <p className="font-serif italic text-neutral-600 mb-5">{t.builtWithIntro}</p>
          <Suspense fallback={<div className="h-40 animate-pulse rounded-md bg-neutral-100" />}>
            <BuiltWithGrid projects={builtWith} locale={locale} />
          </Suspense>
        </CollapsibleSection>
      )}

      {(hasEvolution || project.github) && (
        <CollapsibleSection title={t.sections.evolution}>
          {hasEvolution && <Evolution history={history} locale={locale} />}
          {project.github && (
            <Suspense
              fallback={<div className="mt-8 h-[100px] animate-pulse rounded-lg bg-neutral-100" />}
            >
              <CommitGraph github={project.github} locale={locale} />
            </Suspense>
          )}
        </CollapsibleSection>
      )}

      <CollapsibleSection title={t.sections.notes}>
        <Notes
          locale={locale}
          project={slug}
          notes={notes}
          currentName={user?.name ?? null}
          signedIn={!!user}
        />
      </CollapsibleSection>
    </div>
  );

  if (!embedUrl) return body;
  return (
    <LivePreviewLayout name={project.name} url={embedUrl} locale={locale}>
      {body}
    </LivePreviewLayout>
  );
}
