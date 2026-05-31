import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { insertCloudReport, listCloudReports } from "@/lib/supabase/reports";
import type { AnalysisResult, AnalysisSource } from "@/types/analysis";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitRaw = Number(searchParams.get("limit"));
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(Math.floor(limitRaw), 30)
      : 30;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { reports: [], configured: false },
      { status: 200 },
    );
  }

  const reports = await listCloudReports(limit);
  return NextResponse.json({ reports, configured: true });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "云端存储未配置", code: "not_configured" },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  const image = formData.get("image");
  const payloadRaw = formData.get("payload");

  if (!(image instanceof File) || typeof payloadRaw !== "string") {
    return NextResponse.json({ error: "缺少图片或诊断数据" }, { status: 400 });
  }

  let payload: {
    localId: string;
    location: string;
    reviewToken?: string;
    diagnosis: AnalysisResult;
    analysisSource?: AnalysisSource | null;
  };

  try {
    payload = JSON.parse(payloadRaw) as typeof payload;
  } catch {
    return NextResponse.json({ error: "诊断数据格式错误" }, { status: 400 });
  }

  if (!payload.localId || !payload.diagnosis || !payload.reviewToken?.trim()) {
    return NextResponse.json({ error: "诊断数据不完整" }, { status: 400 });
  }

  const inserted = await insertCloudReport({
    localId: payload.localId,
    location: payload.location || "地点未标注",
    reviewToken: payload.reviewToken.trim(),
    diagnosis: payload.diagnosis,
    analysisSource: payload.analysisSource,
    imageFile: image,
  });

  if (!inserted) {
    return NextResponse.json({ error: "云端保存失败" }, { status: 500 });
  }

  return NextResponse.json({
    id: inserted.report.id,
    url: `/reports/${inserted.report.id}`,
    reviewToken: inserted.reviewToken,
  });
}
