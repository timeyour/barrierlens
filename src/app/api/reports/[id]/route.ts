import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { deleteCloudReport, getCloudReport } from "@/lib/supabase/reports";

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

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "云端存储未配置", code: "not_configured" },
      { status: 503 },
    );
  }

  let body: { localId?: string; reviewToken?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  const localId = body.localId?.trim();
  const reviewToken = body.reviewToken?.trim();

  if (!localId || !reviewToken) {
    return NextResponse.json({ error: "缺少档案校验信息" }, { status: 400 });
  }
  if (!/^[a-zA-Z0-9_-]{16,}$/.test(reviewToken)) {
    return NextResponse.json({ error: "复核凭证格式错误" }, { status: 400 });
  }

  const outcome = await deleteCloudReport({
    reportId: id,
    localId,
    reviewToken,
  });

  if (outcome === "not_found") {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }
  if (outcome === "forbidden") {
    return NextResponse.json({ error: "无权撤回此记录" }, { status: 403 });
  }
  if (outcome === "error") {
    return NextResponse.json({ error: "撤回失败" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
