import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

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

import { Nav, Footer } from "@/components/nav";

export const metadata: Metadata = {
  title: "Piano House",
  description: "Explorations in AI and vibe-coding.",
  metadataBase: new URL("https://pianohouseproject.org"),
  openGraph: {
    title: "Piano House",
    description: "Explorations in AI and vibe-coding.",
    url: "https://pianohouseproject.org",
    siteName: "Piano House",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Piano House",
    description: "Explorations in AI and vibe-coding.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
