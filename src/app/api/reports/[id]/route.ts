import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getCloudReport } from "@/lib/supabase/reports";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "云端存储未配置", code: "not_configured" },
      { status: 503 },
    );
  }

  const report = await getCloudReport(id);
  if (!report) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }

  return NextResponse.json({ report });
}
