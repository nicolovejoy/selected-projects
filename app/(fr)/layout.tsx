import "../globals.css";
import { RootShell, rootMetadata } from "@/components/root-shell";

export const metadata = rootMetadata("fr");

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell locale="fr">{children}</RootShell>;
}
