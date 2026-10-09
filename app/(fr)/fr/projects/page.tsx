import { redirect } from "next/navigation";

// Mirrors app/(en)/projects/page.tsx: the home feed is the project index.
export default function ProjectsPage() {
  redirect("/fr");
}
