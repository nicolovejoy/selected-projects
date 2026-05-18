import Tenets, { metadata as tenetsMetadata } from "@/content/tenets.mdx";

type TenetsMeta = { title: string };
const tenetsMeta = tenetsMetadata as TenetsMeta;

export default function TenetsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{tenetsMeta.title}</h1>
      <article className="prose prose-stone prose-lg mt-8 max-w-none">
        <Tenets />
      </article>
    </div>
  );
}
