import {
  PATH_STATUS_LABELS,
  SCENE_TYPE_LABELS,
  type AnalysisResult,
} from "@/types/analysis";

/** Gemma 结构化输出（用于展示 / 复制，不含长文本报告） */
export function toGemmaStructuredJson(result: AnalysisResult) {
  return {
    hasIssue: result.hasIssue,
    sceneType: result.sceneType,
    sceneTypeLabel: SCENE_TYPE_LABELS[result.sceneType],
    locationType: result.locationType,
    location: result.location,
    obstacles: result.obstacles,
    blockedPath: result.blockedPath,
    pathStatus: result.pathStatus,
    pathStatusLabel: PATH_STATUS_LABELS[result.pathStatus],
    problemSummary: result.problemSummary,
    evidencePoints: result.evidencePoints,
    issueType: result.issueType,
    riskLevel: result.riskLevel,
    affectedGroups: result.affectedGroups,
    responsibleParty: result.responsibleParty,
    suggestedActions: result.suggestedActions,
    confidence: result.confidence,
    needsHumanReview: result.needsHumanReview,
    reviewStatus: result.reviewStatus,
    targetDepartment: result.targetDepartment,
    recordMode: result.recordMode,
  };
}

export function formatGemmaJson(result: AnalysisResult): string {
  return JSON.stringify(toGemmaStructuredJson(result), null, 2);
}
