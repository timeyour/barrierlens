import { analyzeImage } from "@/lib/gemma";
import { prepareUploadImageForGemma } from "@/lib/serverImageUtils";
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
    const { imageBase64, sourceBuffer } = await prepareUploadImageForGemma(
      buffer,
      mimeType,
    );

    const startedAt = performance.now();
    const demoSample = formData.get("demoSample") === "1";

    const analysis = await analyzeImage({
      imageBase64,
      sourceBuffer,
      targetDepartment,
      recordMode,
      location: locationResult.location,
      fileName: image.name,
      demoSample,
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
    const detail = error instanceof Error ? error.message : String(error);
    const message = formatAnalyzeErrorMessage(detail);
    return analyzeApiErrorResponse(request, 500, "INTERNAL_ERROR", message);
  }
}

function formatAnalyzeErrorMessage(detail: string): string {
  if (/timeout|abort/i.test(detail)) {
    return "分析超时：上传照片在 Vercel 60 秒内未完成 Gemma 推理。演示请先点「使用样例图」（标签应显示「样例图」），约 2 秒出结果；若仍是自拍，请点清除后重选样例图。";
  }
  if (/样例图分析失败/i.test(detail)) {
    return detail;
  }
  if (/HTTP 500|Internal error encountered|InternalServerError/i.test(detail)) {
    return "Google Gemma API 暂时故障（500）。请稍后重试，或先点「使用样例图」完成演示。";
  }
  if (detail.startsWith("Gemma 分析失败")) {
    return detail;
  }
  if (/Gemma API HTTP|Missing GEMINI/i.test(detail)) {
    return `Gemma 分析失败：${detail}`;
  }
  if (detail.length > 0 && detail.length <= 280) {
    return `分析失败：${detail}`;
  }
  return "分析失败，请稍后重试";
}
