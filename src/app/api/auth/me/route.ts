import { isAuthConfigured, readSessionFromRequest } from "@/lib/authSession";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = readSessionFromRequest(request);
  return NextResponse.json({
    configured: isAuthConfigured(),
    user,
  });
}
