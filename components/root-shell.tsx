import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import Script from "next/script";
import { Nav, Footer } from "@/components/nav";
import { strings } from "@/content/strings";
import { localePath, type Locale } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const ORIGIN = "https://pianohouseproject.org";

/** Root-layout metadata for one language. Both root layouts call this. */
export function rootMetadata(locale: Locale): Metadata {
  const site = strings[locale].site;
  return {
    title: site.title,
    description: site.description,
    metadataBase: new URL(ORIGIN),
    openGraph: {
      title: site.title,
      description: site.description,
      url: `${ORIGIN}${localePath(locale, "/")}`,
      siteName: site.title,
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
    },
  };
}

/**
 * The <html>/<body> chrome shared by the English and French root layouts.
 * They are separate root layouts (app/(en)/layout.tsx, app/(fr)/layout.tsx) so
 * each can set its own `lang` without a dynamic [lang] segment; switching
 * languages is therefore a full page load, which is fine for a toggle.
 */
export function RootShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-fg">
        <Nav locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
        <Script src="https://prompt-labs.org/beacon.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
