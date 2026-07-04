import type { AnalysisSource } from "@/types/analysis";

interface AnalysisVerificationBannerProps {
  analysisSource?: AnalysisSource | null;
  modelName?: string | null;
  needsHumanReview?: boolean;
  obstaclesInferredFromEvidence?: boolean;
}

export default function AnalysisVerificationBanner({
  analysisSource,
  modelName,
  needsHumanReview,
  obstaclesInferredFromEvidence,
}: AnalysisVerificationBannerProps) {
  if (analysisSource === "mock") {
    return (
      <div
        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900"
        role="status"
      >
        <strong>analysisSource=demo-mock</strong> · 当前为比赛演示样例数据（未连接 Gemma 4），摘要可能与照片不符。建议人工复核。
      </div>
    );
  }

  if (analysisSource === "nvidia_nim") {
    return (
      <div
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-900"
        role="status"
      >
        <strong>analysisSource=nvidia_nim</strong>
        {modelName ? ` · 模型 ${modelName}` : ""} · 本次由 NVIDIA NIM（Gemma 4）分析。请核对摘要是否与照片一致。
      </div>
    );
  }

  if (analysisSource === "ollama") {
    return (
      <div
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-900"
        role="status"
      >
        <strong>analysisSource=ollama</strong>
        {modelName ? ` · 模型 ${modelName}` : ""} · 本次由本机 Ollama（Gemma 兼容模型）分析，用于本地复现，非线上 Production 默认路径。请核对摘要是否与照片一致。
      </div>
    );
  }

  if (analysisSource === "mock_fallback") {
    return (
      <div
        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900"
        role="status"
      >
        <strong>analysisSource=mock_fallback</strong> · AI 暂不可用，已降级为演示数据，摘要可能与照片不符。
        <span className="mt-1 block text-[11px] text-amber-800/90">
          这不代表 Gemma 4 真实识图能力。Production 应设 <strong>ALLOW_MOCK_FALLBACK=false</strong>，失败直接报错而非 silent 降级。
        </span>
      </div>
    );
  }

  if (analysisSource === "gemma") {
    return (
      <div
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-900"
        role="status"
      >
        AI 识别结果仅作为辅助参考，建议人工复核后再登记台账。
      </div>
    );
  }

  if (needsHumanReview) {
    return (
      <div
        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900"
        role="status"
      >
        模型置信度偏低，请核对摘要是否准确描述了照片中的可见障碍。
      </div>
    );
  }

  if (obstaclesInferredFromEvidence) {
    return (
      <div
        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-900"
        role="status"
      >
        模型未单独列出 obstacles，已根据 evidencePoints 补全地图标注，请对照照片核对。
      </div>
    );
  }

  return null;
}
