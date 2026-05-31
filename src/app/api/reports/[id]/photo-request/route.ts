import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { insertPhotoAccessRequest } from "@/lib/supabase/reports";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "云端未配置", code: "not_configured" },
      { status: 503 },
    );
  }

  let body: { message?: string; contact?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message || message.length < 4) {
    return NextResponse.json(
      { error: "请说明申请查看照片的原因（至少 4 个字）" },
      { status: 400 },
    );
  }

  const created = await insertPhotoAccessRequest({
    reportId: id,
    message,
    contact: body.contact,
  });

  if (!created) {
    return NextResponse.json({ error: "申请提交失败" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    id: created.id,
    message: "已登记申请。记录者会在本机档案中看到，并决定是否提供现场照片。",
  });
}
