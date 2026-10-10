"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { submitConnect, type ConnectFormState } from "./actions";
import { strings } from "@/content/strings";
import type { Locale } from "@/lib/i18n";

const initial: ConnectFormState = { ok: false };

export function ConnectForm({
  email,
  locale,
  projects,
}: {
  email: string | null;
  locale: Locale;
  /** Passed from the server so lib/projects (and its MDX) stays out of the client bundle. */
  projects: { slug: string; name: string }[];
}) {
  const t = strings[locale].connect;
  const search = useSearchParams();
  const presetProject = search.get("project") ?? "general";
  const [state, action, pending] = useActionState(submitConnect, initial);

  if (state.ok) {
    return (
      <div className="mt-10 rounded-md border border-green-200 bg-green-50 p-6 text-green-900">
        {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="mt-10 space-y-5">
      <input type="hidden" name="locale" value={locale} />
      {email ? (
        <div>
          <span className="mono-label block">{t.from}</span>
          <span className="text-sm text-neutral-900">{email}</span>
        </div>
      ) : (
        <>
          <Field label={t.name} name="name" required />
          <Field label={t.email} name="email" type="email" required />
        </>
      )}

      <div>
        <label className="block text-sm font-medium">{t.project}</label>
        <select
          name="project"
          defaultValue={presetProject}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="general">{t.general}</option>
          {projects.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">{t.intent}</legend>
        <div className="mt-2 space-y-2 text-sm">
          <Checkbox name="intent" value="try" label={t.intents.try} />
          <Checkbox name="intent" value="ask" label={t.intents.ask} />
          <Checkbox name="intent" value="collaborate" label={t.intents.collaborate} />
        </div>
      </fieldset>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">{t.message}</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <Field
        label={t.links}
        name="links"
        placeholder={t.linksPlaceholder}
      />

      <Honeypot label={t.honeypot} />

      {state.message && !state.ok && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
      >
        {pending ? t.sending : t.send}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
    </div>
  );
}

function Checkbox({
  name,
  value,
  label,
}: {
  name: string;
  value: string;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" name={name} value={value} className="rounded" />
      <span>{label}</span>
    </label>
  );
}

function Honeypot({ label }: { label: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-10000px",
        top: "auto",
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
    >
      <label>
        {label}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
