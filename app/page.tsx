import Link from "next/link";
import { projects } from "@/lib/projects";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section className="mb-16 max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Piano House
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          A workshop of small projects — tools, experiments, and things we&rsquo;re
          building together. Have a look around.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-500">
          Projects
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/projects/${p.slug}`}
                className="block rounded-lg border border-neutral-200 p-6 transition hover:border-neutral-400"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-medium">{p.name}</h3>
                  <span className="text-xs uppercase tracking-wider text-neutral-500">
                    {p.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-600">{p.tagline}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
