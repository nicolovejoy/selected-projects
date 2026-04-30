import Link from "next/link";
import Image from "next/image";
import { projects } from "@/lib/projects";
import { StatusBadge } from "@/components/status-badge";

export default function Home() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-neutral-100">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/piano-house.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-right"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-white from-30% via-white/85 via-50% to-transparent to-70%"
          />
        </div>

        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <div className="max-w-xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Piano House Project
            </h1>
            <p className="mt-4 text-lg text-neutral-700">
              An evolving exploration of the brave new world of AI and
              vibe-coding — tools, experiments, and things we&rsquo;re building
              together to learn, explore, and have fun. Have a look around.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
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
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-2 text-sm text-neutral-600">{p.tagline}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
