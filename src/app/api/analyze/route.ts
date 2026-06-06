import { analyzeImage } from "@/lib/gemma";
import {
  analyzeApiErrorResponse,
  parseRecordMode,
  parseTargetDepartment,
  resolveAnalyzeLocation,
  validateAnalyzeImage,
} from "@/lib/analyzeApiValidation";
import { isHackathonFlagEnabled } from "@/config/hackathonFlags";
import {
  corsHeaders,
  isTeamApiAuthorized,
  teamApiUnauthorizedResponse,
  withCors,
} from "@/lib/teamApiAuth";
import { NextResponse } from "next/server";

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
    const imageResult = validateAnalyzeImage(formData.get("image"));
    if (!imageResult.ok) {
      const status =
        imageResult.code === "IMAGE_TOO_LARGE"
          ? 413
          : imageResult.code === "IMAGE_UNSUPPORTED"
            ? 415
            : 400;
      return analyzeApiErrorResponse(
        request,
        status,
        imageResult.code,
        imageResult.message,
      );
    }

    const targetDepartment = parseTargetDepartment(formData.get("targetDepartment"));
    if (!targetDepartment) {
      return analyzeApiErrorResponse(
        request,
        400,
        "INVALID_REQUEST",
        "缺少或无效的场景归类",
      );
    }

    const recordMode = parseRecordMode(formData.get("recordMode"));
    if (!recordMode) {
      return analyzeApiErrorResponse(
        request,
        400,
        "INVALID_REQUEST",
        "无效的记录模式",
      );
    }
    const locationRequired = isHackathonFlagEnabled("locationRequired");
    const locationResult = resolveAnalyzeLocation({
      locationRaw: formData.get("location"),
      locationRequired,
    });
    if (!locationResult.ok) {
      return analyzeApiErrorResponse(
        request,
        422,
        locationResult.code,
        locationResult.message,
      );
    }

    const { file: image, mimeType } = imageResult;
    const buffer = Buffer.from(await image.arrayBuffer());
    const imageBase64 = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const startedAt = performance.now();
    const analysis = await analyzeImage({
      imageBase64,
      targetDepartment,
      recordMode,
      location: locationResult.location,
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
    const message =
      error instanceof Error && /timeout|abort/i.test(error.message)
        ? "分析超时，请稍后重试或使用样例图"
        : "分析失败，请稍后重试";
    return analyzeApiErrorResponse(request, 500, "INTERNAL_ERROR", message);
  }
}
