import { ConnectView, connectMetadata } from "@/components/pages/forms";

export const metadata = connectMetadata("fr");

export default function Page() {
  return <ConnectView locale="fr" />;
}
