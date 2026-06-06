import { type NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await destroySession();
  // 303 so the browser follows the redirect as a GET, not a re-POST.
  return NextResponse.redirect(new URL("/", req.nextUrl.origin), 303);
}
