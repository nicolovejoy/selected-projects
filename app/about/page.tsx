import About from "@/content/about.mdx";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <article className="prose prose-stone prose-lg mt-8 max-w-none">
        <About />
      </article>
    </div>
  );
}
