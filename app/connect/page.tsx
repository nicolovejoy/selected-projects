import { Suspense } from "react";
import { ConnectForm } from "./form";
import Connect, { metadata as connectMetadata } from "@/content/connect.mdx";
import { site } from "@/content/site";
import { getSessionUser } from "@/lib/auth";

type ConnectMeta = { title: string };
const connectMeta = connectMetadata as ConnectMeta;

export const metadata = {
  title: `${connectMeta.title} — ${site.title}`,
};

export default async function ConnectPage() {
  const user = await getSessionUser();
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{connectMeta.title}</h1>
      <div className="mt-3 text-neutral-600">
        <Connect />
      </div>
      <Suspense>
        <ConnectForm email={user?.email ?? null} />
      </Suspense>
    </div>
  );
}
