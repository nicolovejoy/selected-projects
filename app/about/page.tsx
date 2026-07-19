import About, { metadata as aboutMetadata } from "@/content/about.mdx";

type AboutMeta = { title: string };
const aboutMeta = aboutMetadata as AboutMeta;

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{aboutMeta.title}</h1>
      <article className="prose prose-stone dark:prose-invert prose-lg mt-8 max-w-none">
        <About />
      </article>
    </div>
  );
}
