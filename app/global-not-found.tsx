import "./globals.css";
import Link from "next/link";
import { RootShell } from "@/components/root-shell";

export const metadata = { title: "404 — the piano house project" };

/**
 * Unmatched URLs. With two root layouts there is no shared layout for Next's
 * default 404 to sit in, so this renders the English chrome itself. (A bad slug
 * under a real route, e.g. /fr/projects/nope, still 404s inside its own
 * language's layout via notFound().)
 */
export default function GlobalNotFound() {
  return (
    <RootShell locale="en">
      <div className="mx-auto max-w-2xl px-6 py-24">
        <p className="mono-label">404</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">This page could not be found.</h1>
        <p className="mt-4 text-sm text-neutral-600">
          <Link href="/" className="underline underline-offset-4">
            Home
          </Link>{" "}
          ·{" "}
          <Link href="/fr" className="underline underline-offset-4" hrefLang="fr">
            Accueil (français)
          </Link>
        </p>
      </div>
    </RootShell>
  );
}
