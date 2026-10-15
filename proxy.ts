import { NextResponse, type NextRequest } from "next/server";
import { PROJECT_SLUGS } from "@/lib/project-slugs";

const known = new Set(PROJECT_SLUGS);

/**
 * True 404s for unknown project slugs (#36). Under Cache Components the page
 * shell streams with a 200 before the body's notFound() can run, and
 * `dynamicParams = false` isn't available — so the check happens here, before
 * render. Rewriting to a path no route matches hands the request to
 * app/global-not-found.tsx, which answers 404 with the site chrome.
 */
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/").pop() ?? "";
  if (known.has(slug)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/_unknown-project", request.url));
}

export const config = {
  matcher: ["/projects/:slug", "/fr/projects/:slug"],
};
