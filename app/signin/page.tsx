import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SignInForm } from "./form";

export const metadata = { title: "sign in" };

const ERRORS: Record<string, string> = {
  expired: "That link expired or was already used. Request a fresh one.",
  missing: "That link was incomplete. Request a fresh one.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect("/");

  const { error } = await searchParams;
  const errorMessage = error ? ERRORS[error] : undefined;

  return (
    <div className="min-h-[80dvh] bg-neutral-50">
      <div className="mx-auto flex max-w-sm flex-col px-5 pt-16 pb-20">
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {errorMessage}
          </div>
        )}
        <SignInForm />
        <p className="mt-6 text-center text-xs leading-relaxed text-neutral-400">
          Signing in lets you follow projects and join the conversation. We only
          store your email — see the tenets for how we treat it.
        </p>
      </div>
    </div>
  );
}
