import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/lib/projects";

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
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← All projects
      </Link>

      <header className="mt-8 border-b border-neutral-200 pb-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
          <span className="text-xs uppercase tracking-wider text-neutral-500">
            {project.status}
          </span>
        </div>
        <p className="mt-2 text-lg text-neutral-600">{project.tagline}</p>
      </header>

      <div className="prose prose-neutral mt-8 max-w-none">
        {project.description.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
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
        <Link
          href={`/connect?project=${project.slug}`}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-500"
        >
          Get in touch about this
        </Link>
      </div>
    </article>
  );
}
