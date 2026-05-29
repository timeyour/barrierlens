import type { AnalysisSource } from "@/types/analysis";

interface AnalysisVerificationBannerProps {
  analysisSource?: AnalysisSource | null;
  needsHumanReview?: boolean;
}

export default function AnalysisVerificationBanner({
  analysisSource,
  needsHumanReview,
}: AnalysisVerificationBannerProps) {
  if (analysisSource === "mock") {
    return (
      <div
        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900"
        role="status"
      >
        当前为演示数据（未连接 AI），摘要可能与照片不符，请以现场照片为准并人工核对。
      </div>
    );
  }

  if (analysisSource === "mock_fallback") {
    return (
      <div
        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900"
        role="status"
      >
        AI 暂不可用，已降级为演示数据。请核对诊断摘要是否与照片中的可见障碍物一致。
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

  return null;
}
