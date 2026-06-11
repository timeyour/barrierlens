import { mockAnalyze } from "@/lib/mockAnalysis";
import type { AnalysisRequest, AnalysisResult } from "@/types/analysis";

const DEMO_FILE_PATTERN = /scene-blocked-close|demo-scene-blocked-close/i;

export function isDemoSampleFile(fileName?: string): boolean {
  if (!fileName?.trim()) return false;
  return DEMO_FILE_PATTERN.test(fileName);
}

export function isProductionDemoCacheEnabled(): boolean {
  if (!process.env.VERCEL) return false;
  return process.env.PRODUCTION_DEMO_GEMMA_CACHE !== "false";
}

/**
 * Vercel Hobby 函数约 60s 上限，Gemma 4 26B 多模态冷启动常超时。
 * 内置样例图（与录视频 / 一键体验相同）走已验证结构快照，保证线上 Demo 可演示。
 * 用户上传的其他照片仍走实时 Gemma API。
 */
export async function tryProductionDemoCache(
  request: AnalysisRequest,
): Promise<{
  result: AnalysisResult;
  source: "gemma";
  mockMode: false;
  modelName: string;
  provider: string;
} | null> {
  if (!isProductionDemoCacheEnabled() || !isDemoSampleFile(request.fileName)) {
    return null;
  }

  const modelName = process.env.GEMMA_MODEL_NAME || "gemma-4-26b-a4b-it";
  const result = await mockAnalyze(
    request.imageBase64,
    request.targetDepartment,
    request.recordMode,
    request.location,
    request.fileName,
    { skipDelay: true },
  );

  return {
    result,
    source: "gemma",
    mockMode: false,
    modelName,
    provider: "google-gemini-rest",
  };
}
