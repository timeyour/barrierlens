import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "该接口已废弃，请使用 Supabase Magic Link 登录。",
      code: "deprecated",
    },
    { status: 410 },
  );
}
