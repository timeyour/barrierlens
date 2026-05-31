import { NextResponse } from "next/server";
import {
  listPhotoAccessRequests,
  updatePhotoAccessRequestStatus,
} from "@/lib/supabase/reports";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import type { PhotoAccessRequestStatus } from "@/types/cloudReport";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ requests: [], configured: false });
  }

  const { searchParams } = new URL(request.url);
  const localId = searchParams.get("localId")?.trim();
  const reviewToken = searchParams.get("reviewToken")?.trim();

  if (!localId || !reviewToken) {
    return NextResponse.json({ error: "缺少档案校验信息" }, { status: 400 });
  }

  const requests = await listPhotoAccessRequests({
    reportId: id,
    localId,
    reviewToken,
  });

  return NextResponse.json({ requests, configured: true });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "云端未配置" }, { status: 503 });
  }

  let body: {
    requestId?: string;
    localId?: string;
    reviewToken?: string;
    status?: PhotoAccessRequestStatus;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  if (
    !body.requestId ||
    !body.localId ||
    !body.reviewToken ||
    (body.status !== "pending" && body.status !== "contacted")
  ) {
    return NextResponse.json({ error: "参数不完整" }, { status: 400 });
  }

  const ok = await updatePhotoAccessRequestStatus({
    reportId: id,
    requestId: body.requestId,
    localId: body.localId,
    reviewToken: body.reviewToken,
    status: body.status,
  });

  if (!ok) {
    return NextResponse.json({ error: "更新失败" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
