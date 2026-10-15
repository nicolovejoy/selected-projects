import { CategoryView, categoryMetadata } from "@/components/pages/category";

export const metadata = categoryMetadata("products", "en");

export default function Page() {
  return <CategoryView category="products" locale="en" />;
}
