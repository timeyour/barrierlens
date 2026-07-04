import type { AnalysisResult, AnalysisSource } from "@/types/analysis";

export const HUMAN_REVIEW_DECLARATION =
  "AI 识别结果仅作为辅助参考，最终问题确认、责任划分和整改验收应由人工复核完成。";

export const PROJECT_METHODOLOGY =
  "BarrierLens 的核心不是替代人工判断，而是帮助现场问题留下证据、形成台账、推动整改闭环。";

export const EVIDENCE_CHAIN_TAGLINE = "照片 → 结构化证据 → 时间线 → 导出 / 复查";

export function buildEvidenceSummary(result: AnalysisResult): string {
  if (result.evidencePoints.length > 0) {
    return result.evidencePoints.join("；");
  }
  return result.problemSummary
    .replace(/^【疑似问题 · AI 辅助识别】/, "")
    .trim();
}

export function buildReviewHint(result: AnalysisResult): string {
  const reviewHints = result.suggestedActions.filter((action) =>
    /复查|复拍|复核|跟进|整改后|验收/.test(action),
  );
  if (reviewHints.length > 0) return reviewHints.join("；");
  if (result.recordMode === "inspection") {
    return "整改完成后请复拍对照，并在时间线更新复查状态。";
  }
  return "建议整改后复拍对照，并在时间线更新复查状态。";
}

export function formatAnalysisSourceLabel(
  source?: AnalysisSource | null,
  mockMode?: boolean,
): string {
  if (source === "gemma") return "gemma";
  if (source === "nvidia_nim") return "nvidia_nim";
  if (source === "ollama") return "ollama";
  if (source === "mock_fallback") return "demo-mock（接口降级）";
  if (source === "mock" || mockMode) return "demo-mock";
  return "未标注";
}
