import { SignInView, signinMetadata } from "@/components/pages/forms";

export const metadata = signinMetadata("fr");

export default function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <SignInView searchParams={searchParams} locale="fr" />;
}
