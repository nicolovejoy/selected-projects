/**
 * Locale plumbing. English lives at the unprefixed URLs it always has; French
 * mirrors every reader-facing route under /fr. The two languages are separate
 * root layouts (app/(en) and app/(fr)), so there is no [lang] param, no proxy,
 * and no change to how the English routes prerender.
 *
 * Chrome strings live in content/strings.ts; long-form copy in content/ (en)
 * and content/fr/ (fr).
 */

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

/** BCP-47 tag for Intl date/number formatting. */
export const intlTag: Record<Locale, string> = { en: "en-US", fr: "fr-FR" };

/** Prefix a site-internal path for the given locale: ("fr", "/about") → "/fr/about". */
export function localePath(locale: Locale, path: string): string {
  if (locale === "en") return path;
  return path === "/" ? "/fr" : `/fr${path}`;
}

/** The same page in the other language. Input is a pathname as the browser sees it. */
export function counterpartPath(pathname: string): { locale: Locale; path: string } {
  if (pathname === "/fr" || pathname.startsWith("/fr/")) {
    return { locale: "en", path: pathname.slice(3) || "/" };
  }
  return { locale: "fr", path: localePath("fr", pathname) };
}

/** Format a date-ish string ("YYYY-MM-DD HH:MM:SS" UTC from SQLite, or ISO). */
export function formatDate(
  iso: string,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" },
): string {
  const normalized = /^\d{4}-\d{2}-\d{2} \d/.test(iso) ? iso.replace(" ", "T") + "Z" : iso;
  return new Date(normalized).toLocaleDateString(intlTag[locale], opts);
}

/** "1 session" / "3 sessions". French treats 0 and 1 as singular (CLDR "one"). */
export function plural(n: number, one: string, other: string, locale: Locale): string {
  const form = new Intl.PluralRules(intlTag[locale]).select(n);
  return `${n} ${form === "one" ? one : other}`;
}
