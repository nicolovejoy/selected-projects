import { CategoryView, categoryMetadata } from "@/components/pages/category";

export const metadata = categoryMetadata("music", "fr");

export default function Page() {
  return <CategoryView category="music" locale="fr" />;
}
