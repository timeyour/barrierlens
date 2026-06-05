import { analyzeImage } from "@/lib/gemma";
import { sanitizeLocationForStorage } from "@/lib/locationValidation";
import {
  corsHeaders,
  isTeamApiAuthorized,
  teamApiUnauthorizedResponse,
  withCors,
} from "@/lib/teamApiAuth";
import { NextResponse } from "next/server";
import type { RecordMode, TargetDepartment } from "@/types/analysis";

// 本地 Ollama 多模态常需 90–180s；Vercel 线上走 Google 通常 <60s
export const maxDuration = 300;

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  if (!isTeamApiAuthorized(request)) {
    return teamApiUnauthorizedResponse(request);
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const targetDepartment = formData.get("targetDepartment") as TargetDepartment;
    const recordMode = (formData.get("recordMode") as RecordMode) || "public";
    const locationRaw = (formData.get("location") as string) || undefined;
    const location = sanitizeLocationForStorage(locationRaw) || undefined;

    if (!image || !targetDepartment) {
      return withCors(
        request,
        NextResponse.json({ error: "缺少图片或场景归类" }, { status: 400 }),
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const mimeType = image.type || "image/jpeg";
    const imageBase64 = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const startedAt = performance.now();
    const analysis = await analyzeImage({
      imageBase64,
      targetDepartment,
      recordMode,
      location,
      fileName: image.name,
    });
    const analysisTimeMs = Math.round(performance.now() - startedAt);

    return withCors(
      request,
      NextResponse.json({
        ...analysis.result,
        mockMode: analysis.mockMode,
        analysisSource: analysis.source,
        modelName: analysis.modelName,
        model: analysis.modelName,
        provider: analysis.provider,
        fallbackReason: analysis.fallbackReason,
        analysisTimeMs,
      }),
    );
  } catch (error) {
    console.error("Analysis failed:", error);
    return withCors(
      request,
      NextResponse.json({ error: "分析失败，请稍后重试" }, { status: 500 }),
    );
  }
}
