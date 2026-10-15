import { CategoryView, categoryMetadata } from "@/components/pages/category";

export const metadata = categoryMetadata("tools", "en");

export default function Page() {
  return <CategoryView category="tools" locale="en" />;
}
