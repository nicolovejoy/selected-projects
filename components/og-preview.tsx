import { getOgPreview } from "@/lib/og";
import type { Project } from "@/lib/projects";

/**
 * Clickable preview of a project's live site — the same card you'd see sharing
 * the URL. Falls back to the project's own image, then renders nothing.
 * Async server component; wrap in <Suspense> so the OG fetch doesn't block.
 */
export async function OgPreview({ project }: { project: Project }) {
  if (!project.url) return null;

  const og = await getOgPreview(project.url);
  const image = og?.image ?? project.image ?? project.cardImage;
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
        alt={`${project.name} preview`}
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
