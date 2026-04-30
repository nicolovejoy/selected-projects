import Link from "next/link";
import Image from "next/image";
import { projects } from "@/lib/projects";
import { StatusBadge } from "@/components/status-badge";
import Home, { metadata as homeMetadata } from "@/content/home.mdx";
import { heroes, homeHero, heroGradient } from "@/content/heroes";

type HomeMeta = { title: string };
const homeMeta = homeMetadata as HomeMeta;

export default function HomePage() {
  const fade = heroes[homeHero];
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-neutral-100">
        <div className="absolute inset-0 -z-10">
          <Image
            src={`/${homeHero}.jpg`}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: fade.objectPosition }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: heroGradient(fade) }}
          />
        </div>

        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <div className="max-w-xl">
            <h1
              className="text-4xl font-semibold tracking-tight sm:text-5xl"
              style={{ color: fade.titleColor }}
            >
              {homeMeta.title}
            </h1>
            <div className="mt-4 text-lg" style={{ color: fade.subtitleColor }}>
              <Home />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-sm font-medium tracking-wider text-neutral-500">
          projects
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
