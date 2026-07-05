"use server";

import { headers } from "next/headers";
import { countRecentMagicTokens, createMagicToken } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";

export type SignInState = { sent: boolean; email?: string; error?: string };

const MAX_TOKENS_PER_EMAIL = 3; // per 15 min
const MAX_TOKENS_PER_IP = 10; // per 15 min

export async function requestMagicLink(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { sent: false, error: "That email doesn't look right." };
  }

  // Honeypot tripped → fake success, mint nothing, send nothing.
  if (String(formData.get("website") ?? "").trim()) {
    return { sent: true, email };
  }

  try {
    const h = await headers();
    const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;

    const recent = await countRecentMagicTokens(email, ip);
    if (recent.byEmail >= MAX_TOKENS_PER_EMAIL || recent.byIp >= MAX_TOKENS_PER_IP) {
      return {
        sent: false,
        error: "Too many sign-in links requested. Wait a few minutes and try again.",
      };
    }

    const token = await createMagicToken(email, ip);
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host");
    const url = `${proto}://${host}/api/auth/verify?token=${token}`;

    if (process.env.NODE_ENV !== "production") {
      // Dev never sends real mail; the console link is the whole flow.
      console.log(`[auth] magic link for ${email}:\n${url}`);
    } else {
      await sendMagicLink({ email, url });
    }
  } catch (err) {
    console.error("[auth] magic link request failed", err);
    return { sent: false, error: "Couldn't send the link. Try again in a minute?" };
  }

  return { sent: true, email };
}
