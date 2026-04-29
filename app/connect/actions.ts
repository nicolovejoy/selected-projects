"use server";

import { headers } from "next/headers";
import { projects } from "@/lib/projects";
import { db } from "@/lib/db";
import { sendConnectNotification } from "@/lib/email";

export type ConnectFormState = {
  ok: boolean;
  message?: string;
};

function truncateIp(raw: string | null): string | null {
  if (!raw) return null;
  const first = raw.split(",")[0]?.trim();
  if (!first) return null;
  if (first.includes(":")) {
    const parts = first.split(":").filter(Boolean);
    return parts.slice(0, 3).join(":") + "::";
  }
  const parts = first.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  return null;
}

function decodeHeader(v: string | null): string | null {
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export async function submitConnect(
  _prev: ConnectFormState,
  formData: FormData,
): Promise<ConnectFormState> {
  // Honeypot — bots fill this; humans don't see it. Pretend success and drop.
  if (String(formData.get("website") ?? "").length > 0) {
    return { ok: true, message: "Thanks — we'll be in touch." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const project = String(formData.get("project") ?? "general").trim();
  const intents = formData.getAll("intent").map(String);
  const message = String(formData.get("message") ?? "").trim();
  const links = String(formData.get("links") ?? "").trim() || null;

  if (!name || !email || !message) {
    return { ok: false, message: "Name, email, and message are required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "That email doesn't look right." };
  }
  if (project !== "general" && !projects.some((p) => p.slug === project)) {
    return { ok: false, message: "Unknown project." };
  }

  const h = await headers();
  const userAgent = h.get("user-agent");
  const referer = h.get("referer");
  const ip = truncateIp(h.get("x-forwarded-for"));
  const geoCity = decodeHeader(h.get("x-vercel-ip-city"));
  const geoRegion = decodeHeader(h.get("x-vercel-ip-country-region"));
  const geoCountry = h.get("x-vercel-ip-country");
  const id = crypto.randomUUID();

  try {
    await db().execute({
      sql: `INSERT INTO connect_submissions
              (id, name, email, project, intents, message, user_agent,
               ip, geo_city, geo_region, geo_country, referer, links)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, name, email, project, JSON.stringify(intents), message, userAgent,
        ip, geoCity, geoRegion, geoCountry, referer, links,
      ],
    });
  } catch (err) {
    console.error("[connect] db insert failed", err);
    return { ok: false, message: "Something broke saving that. Try again in a minute?" };
  }

  try {
    await sendConnectNotification({
      name, email, project, intents, message, links,
      ip, geoCity, geoRegion, geoCountry, referer, userAgent,
    });
  } catch (err) {
    console.error("[connect] email send failed", err);
  }

  return { ok: true, message: "Thanks — we'll be in touch." };
}
