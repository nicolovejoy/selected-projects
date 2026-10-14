import Link from "next/link";
import { getOgPreview } from "@/lib/og";
import type { Project } from "@/lib/projects";
import { strings } from "@/content/strings";
import { localePath, type Locale } from "@/lib/i18n";

/** Cards for projects made through iBuild4You. Image precedence matches OgPreview. */
export async function BuiltWithGrid({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const images = await Promise.all(
    projects.map(
      async (p) =>
        p.cardImage ?? (p.url ? (await getOgPreview(p.url))?.image : undefined) ?? p.image,
    ),
  );

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
      {projects.map((p, i) => {
        const image = images[i];
        return (
          <li
            key={p.slug}
            className="overflow-hidden rounded-md border border-neutral-200 transition-colors hover:border-neutral-400"
          >
            <Link href={localePath(locale, `/projects/${p.slug}`)} className="block">
              {image && (
                <>
                  {/* Plain <img>: arbitrary external domains, no next/image remotePatterns. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt=""
                    className="aspect-[1200/630] w-full bg-neutral-100 object-cover"
                    loading="lazy"
                  />
                </>
              )}
              <div className="p-4">
                <span className="mono-label">{strings[locale].categories[p.category]}</span>
                <h3 className="mt-1 font-serif text-[1.375rem] leading-tight tracking-tight text-neutral-900">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm text-neutral-600">{p.tagline}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
