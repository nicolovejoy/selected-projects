import { type NextRequest, NextResponse } from "next/server";
import { consumeMagicToken, findOrCreateUser, createSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const base = req.nextUrl.origin;
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/signin?error=missing", base));

  const email = await consumeMagicToken(token);
  if (!email) return NextResponse.redirect(new URL("/signin?error=expired", base));

  const userId = await findOrCreateUser(email);
  await createSession(userId);
  return NextResponse.redirect(new URL("/", base));
}
