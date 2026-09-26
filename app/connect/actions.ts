"use server";

import { headers } from "next/headers";
import { projects } from "@/lib/projects";
import { db } from "@/lib/db";
import { sendConnectNotification } from "@/lib/email";
import { getSessionUser } from "@/lib/auth";
import {
  countRecentConnects,
  MAX_CONNECTS_PER_EMAIL_PER_HOUR,
  MAX_CONNECTS_PER_IP_PER_HOUR,
} from "@/lib/connect";

export type ConnectFormState = {
  ok: boolean;
  message?: string;
};

const THANKS = "Thanks — we'll be in touch.";

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
    return { ok: true, message: THANKS };
  }

  const sessionUser = await getSessionUser();
  const name = sessionUser ? (sessionUser.name ?? "") : String(formData.get("name") ?? "").trim();
  const email = sessionUser ? sessionUser.email : String(formData.get("email") ?? "").trim();
  const project = String(formData.get("project") ?? "general").trim();
  const intents = formData.getAll("intent").map(String);
  const message = String(formData.get("message") ?? "").trim();
  const links = String(formData.get("links") ?? "").trim() || null;

  if (!sessionUser && !name) {
    return { ok: false, message: "Name is required." };
  }
  if (!email || !message) {
    return { ok: false, message: "Email and message are required." };
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

  // Rate limit — over either key, drop it silently like the honeypot. Signed-in
  // users are keyed on their session email only; a shared network shouldn't
  // block them. A failed check fails open: better a burst than a lost message.
  try {
    const recent = await countRecentConnects(email, ip);
    const overEmail = recent.byEmail >= MAX_CONNECTS_PER_EMAIL_PER_HOUR;
    const overIp = !sessionUser && recent.byIp >= MAX_CONNECTS_PER_IP_PER_HOUR;
    if (overEmail || overIp) {
      console.warn(`[connect] rate limited (${overEmail ? "email" : "ip"})`);
      return { ok: true, message: THANKS };
    }
  } catch (err) {
    console.error("[connect] rate check failed", err);
  }

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

  return { ok: true, message: THANKS };
}
