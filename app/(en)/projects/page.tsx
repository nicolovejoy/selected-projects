import { redirect } from "next/navigation";

// The home feed is the project index (one card per project, more detail than
// this page ever had), so the standalone list retired 2026-07-05. The route
// stays as a redirect because old links to /projects are in the wild.
export default function ProjectsPage() {
  redirect("/");
}
