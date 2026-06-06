"use server";

import { headers } from "next/headers";
import { createMagicToken } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";

export type SignInState = { sent: boolean; email?: string; error?: string };

export async function requestMagicLink(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { sent: false, error: "That email doesn't look right." };
  }

  try {
    const token = await createMagicToken(email);
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host");
    const url = `${proto}://${host}/api/auth/verify?token=${token}`;
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) console.log(`[auth] magic link for ${email}:\n${url}`);

    try {
      await sendMagicLink({ email, url });
    } catch (sendErr) {
      // In dev the console link above is the fallback (Resend domain unverified);
      // in production a failed send is a real error.
      if (!isDev) throw sendErr;
      console.warn("[auth] dev: email send failed — use the logged link above");
    }
  } catch (err) {
    console.error("[auth] magic link request failed", err);
    return { sent: false, error: "Couldn't send the link. Try again in a minute?" };
  }

  return { sent: true, email };
}
