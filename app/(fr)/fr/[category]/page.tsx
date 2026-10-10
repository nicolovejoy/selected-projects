import type { Metadata } from "next";
import { CategoryView, categoryMetadata, categoryStaticParams } from "@/components/pages/category";

// Fails the build if a future change reintroduces a blocking read on this route
// (e.g. an uncached fetch or a cookie read outside Suspense) instead of failing silently.
// `samples` models an anonymous visitor on the "music" category (the root layout's Nav
// reads the session cookie too) — the signed-in path isn't covered by this check.
// `samples` is undocumented under `prefetch: "static"` (instant.md types it only on
// `'runtime'`, and cookie `value` as `string`) — works in 16.2.4 since the config
// parser reads it regardless of mode, but that's version-dependent.
export const unstable_instant = {
  prefetch: "static",
  samples: [{ cookies: [{ name: "ph_session", value: null }], params: { category: "music" } }],
};

export const generateStaticParams = categoryStaticParams;

type Props = { params: Promise<{ category: string }> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata(params, "fr");
}

export default function Page({ params }: Props) {
  return <CategoryView params={params} locale="fr" />;
}
