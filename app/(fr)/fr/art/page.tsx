import { CategoryView, categoryMetadata } from "@/components/pages/category";

export const metadata = categoryMetadata("art", "fr");

export default function Page() {
  return <CategoryView category="art" locale="fr" />;
}
