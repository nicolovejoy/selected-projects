"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { submitConnect, type ConnectFormState } from "./actions";
import { projects } from "@/lib/projects";

const initial: ConnectFormState = { ok: false };

export function ConnectForm() {
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
      <Field label="Name" name="name" required />
      <Field label="Email" name="email" type="email" required />

      <div>
        <label className="block text-sm font-medium">Project</label>
        <select
          name="project"
          defaultValue={presetProject}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="general">General — not project-specific</option>
          {projects.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">I&rsquo;m here to…</legend>
        <div className="mt-2 space-y-2 text-sm">
          <Checkbox name="intent" value="try" label="Try it out" />
          <Checkbox name="intent" value="ask" label="Ask a question" />
          <Checkbox name="intent" value="collaborate" label="Collaborate / build something" />
        </div>
      </fieldset>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <Field
        label="Anywhere we can find you online? (optional)"
        name="links"
        placeholder="LinkedIn, GitHub, personal site…"
      />

      <Honeypot />

      {state.message && !state.ok && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send"}
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

function Honeypot() {
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
        If you are human, leave this field empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
