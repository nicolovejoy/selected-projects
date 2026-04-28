"use server";

import { projects } from "@/lib/projects";

export type ConnectFormState = {
  ok: boolean;
  message?: string;
};

export async function submitConnect(
  _prev: ConnectFormState,
  formData: FormData,
): Promise<ConnectFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const project = String(formData.get("project") ?? "").trim();
  const intents = formData.getAll("intent").map(String);
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { ok: false, message: "Name, email, and message are required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "That email doesn't look right." };
  }
  if (project && project !== "general" && !projects.some((p) => p.slug === project)) {
    return { ok: false, message: "Unknown project." };
  }

  // TODO: write to Turso (connect_submissions table) and send email via Resend.
  // For now, log so the form is functional end-to-end in dev.
  console.log("[connect] submission", { name, email, project, intents, message });

  return { ok: true, message: "Thanks — we'll be in touch." };
}
