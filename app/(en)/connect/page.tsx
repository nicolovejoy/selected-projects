import { ConnectView, connectMetadata } from "@/components/pages/forms";

export const metadata = connectMetadata("en");

export default function Page() {
  return <ConnectView locale="en" />;
}
