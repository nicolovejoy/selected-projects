import { CategoryView, categoryMetadata } from "@/components/pages/category";

export const metadata = categoryMetadata("art", "en");

export default function Page() {
  return <CategoryView category="art" locale="en" />;
}
