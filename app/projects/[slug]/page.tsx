import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProject, getProjectBody, projects } from "@/lib/projects";
import { StatusBadge } from "@/components/status-badge";

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

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← All projects
      </Link>

      <header className="mt-8 border-b border-neutral-200 pb-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-2 text-lg text-neutral-600">{project.tagline}</p>
      </header>

      {project.image && (
        <Image
          src={project.image}
          alt={`${project.name} screenshot`}
          width={1600}
          height={1000}
          sizes="(min-width: 768px) 768px, 100vw"
          className="mt-8 h-auto w-full rounded-lg border border-neutral-200"
        />
      )}

      <article className="prose prose-stone prose-lg mt-8 max-w-none">
        <Body />
      </article>

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
    </div>
  );
}
