"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { strings } from "@/content/strings";
import { counterpartPath, localePath, type Locale } from "@/lib/i18n";

/**
 * "FR" on English pages, "EN" on French ones, pointing at the same page in the
 * other language. A plain <a>, not <Link>: the two languages are separate root
 * layouts, so crossing between them is a full page load either way.
 */
export function LangSwitch({ locale, className }: { locale: Locale; className?: string }) {
  const other: Locale = locale === "en" ? "fr" : "en";
  // Before the pathname is known, fall back to the other language's home page.
  return (
    <Suspense fallback={<SwitchLink locale={locale} href={localePath(other, "/")} className={className} />}>
      <Inner locale={locale} className={className} />
    </Suspense>
  );
}

function Inner({ locale, className }: { locale: Locale; className?: string }) {
  const pathname = usePathname();
  return <SwitchLink locale={locale} href={counterpartPath(pathname).path} className={className} />;
}

function SwitchLink({ locale, href, className }: { locale: Locale; href: string; className?: string }) {
  const { label, aria } = strings[locale].site.switchTo;
  return (
    <a
      href={href}
      hrefLang={locale === "en" ? "fr" : "en"}
      aria-label={aria}
      title={aria}
      className={className ?? "font-mono text-[11px] tracking-[0.1em] hover:text-neutral-900"}
    >
      {label}
    </a>
  );
}
