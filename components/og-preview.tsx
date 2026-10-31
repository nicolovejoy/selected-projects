import { getOgPreview } from "@/lib/og";
import type { Project } from "@/lib/projects";
import { strings } from "@/content/strings";
import type { Locale } from "@/lib/i18n";

/**
 * Clickable preview of a project's live site — the same card you'd see sharing
 * the URL. Image precedence: curated cardImage > live OG scrape > legacy image
 * field > nothing rendered. A project with no url shows its curated image as a
 * plain figure. Async server component; wrap in <Suspense> so the OG fetch
 * doesn't block.
 */
export async function OgPreview({ project, locale }: { project: Project; locale: Locale }) {
  const alt = strings[locale].project.previewAlt(project.name);

  // No public URL (native app, unlisted tool): a curated cardImage still gets
  // shown, as a plain figure rather than a link to nowhere.
  if (!project.url) {
    const image = project.cardImage ?? project.image;
    if (!image) return null;
    return (
      <figure className="block w-full overflow-hidden rounded-xl border border-neutral-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={alt}
          className="aspect-[1200/630] w-full bg-neutral-100 object-cover"
          loading="lazy"
        />
      </figure>
    );
  }

  const og = await getOgPreview(project.url);
  const image = project.cardImage ?? og?.image ?? project.image;
  if (!image) return null;

  const title = og?.title ?? project.name;

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full overflow-hidden rounded-xl border border-neutral-200 transition hover:border-neutral-400"
    >
      {/* Plain <img>: arbitrary external domains, no next/image remotePatterns. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={alt}
        className="aspect-[1200/630] w-full bg-neutral-100 object-cover"
        loading="lazy"
      />
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="truncate text-sm text-neutral-700">{title}</span>
        <span className="shrink-0 text-xs text-neutral-400 group-hover:text-neutral-600">
          {new URL(project.url).hostname} ↗
        </span>
      </div>
    </a>
  );
}
