import { Suspense } from "react";
import { ConnectForm } from "./form";

export const metadata = {
  title: "Connect — Piano House",
};

export default function ConnectPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Connect</h1>
      <p className="mt-3 text-neutral-600">
        We're glad you are here! If you would like to try something, ask a
        question, or build with us, drop us a note.
      </p>
      <Suspense>
        <ConnectForm />
      </Suspense>
    </div>
  );
}
