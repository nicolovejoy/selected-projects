import { CategoryView, categoryMetadata } from "@/components/pages/category";

export const metadata = categoryMetadata("music", "en");

export default function Page() {
  return <CategoryView category="music" locale="en" />;
}
