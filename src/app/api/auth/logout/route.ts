import { AUTH_COOKIE_NAME, sessionCookieOptions } from "@/lib/authSession";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.set(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=; ${sessionCookieOptions(0)}`,
  );
  return response;
}
