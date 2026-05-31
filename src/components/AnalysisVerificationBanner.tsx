import type { AnalysisSource } from "@/types/analysis";

interface AnalysisVerificationBannerProps {
  analysisSource?: AnalysisSource | null;
  needsHumanReview?: boolean;
  obstaclesInferredFromEvidence?: boolean;
}

export default function AnalysisVerificationBanner({
  analysisSource,
  needsHumanReview,
  obstaclesInferredFromEvidence,
}: AnalysisVerificationBannerProps) {
  if (analysisSource === "mock") {
    return (
      <div
        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900"
        role="status"
      >
        当前为演示数据（未连接 AI），摘要可能与照片不符，请以现场照片为准并人工核对。
        <span className="mt-1 block text-[11px] text-amber-800/90">
          线上要启用 Gemma 4：Vercel → 项目 Settings → Environment Variables → 添加{" "}
          <strong>GEMINI_API_KEY</strong>（Google AI Studio 申请）和{" "}
          <strong>GEMMA_API_TIMEOUT_MS=55000</strong> → 保存后点 Redeploy 重新部署。
        </span>
      </div>
    );
  }

  if (analysisSource === "ollama") {
    return (
      <div
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-900"
        role="status"
      >
        本次由本机 Ollama（Gemma 4）分析，无需 Google API。请核对摘要是否与照片中的可见障碍一致。
      </div>
    );
  }

  if (analysisSource === "mock_fallback") {
    return (
      <div
        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900"
        role="status"
      >
        AI 暂不可用，已降级为演示数据，摘要可能与照片不符。
        <span className="mt-1 block text-[11px] text-amber-800/90">
          线上请在 Vercel 配置 GEMINI_API_KEY，并将 GEMMA_API_TIMEOUT_MS 设为 55000；本地需 VPN +
          GEMMA_API_PROXY。
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
        本次为 Gemma 4 真实识图结果，请核对是否与照片中的可见障碍一致。
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
