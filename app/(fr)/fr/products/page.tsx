import { CategoryView, categoryMetadata } from "@/components/pages/category";

export const metadata = categoryMetadata("products", "fr");

export default function Page() {
  return <CategoryView category="products" locale="fr" />;
}
