"use client";

import { useActionState } from "react";
import { requestMagicLink, type SignInState } from "./actions";

const initial: SignInState = { sent: false };

export function SignInForm() {
  const [state, action, pending] = useActionState(requestMagicLink, initial);

  if (state.sent) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-7 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-2xl">
          ✉️
        </div>
        <h1 className="mt-4 font-serif text-2xl tracking-tight">Check your email</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
          We sent a sign-in link to{" "}
          <span className="font-medium text-neutral-800">{state.email}</span>. It
          works once and expires in 15 minutes.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-7">
      <h1 className="font-serif text-3xl tracking-tight">Sign in</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
        Enter your email and we&rsquo;ll send a sign-in link. No password.
      </p>

      <form action={action} className="mt-6">
        {/* Honeypot — humans never see or fill this; the action fakes success if it's set. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
        />
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          className="w-full rounded-lg border border-neutral-300 px-3.5 py-3 text-[15px] outline-none placeholder:text-neutral-400 focus:border-neutral-900"
        />
        {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-3 w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send me a link"}
        </button>
      </form>

      {/* social login lands here later (Google, linked by verified email) */}
      <div className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        more ways soon
        <span className="h-px flex-1 bg-neutral-200" />
      </div>
      <button
        type="button"
        disabled
        className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-400"
      >
        <span className="font-mono text-base leading-none">G</span>
        Continue with Google
        <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] uppercase tracking-wide">
          soon
        </span>
      </button>
    </div>
  );
}
