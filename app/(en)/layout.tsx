import "../globals.css";
import { RootShell, rootMetadata } from "@/components/root-shell";

export const metadata = rootMetadata("en");

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell locale="en">{children}</RootShell>;
}
