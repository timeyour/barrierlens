import type { AnalysisResult, Obstacle } from "@/types/analysis";

function obstacleFromEvidencePoint(point: string): Obstacle {
  return {
    name: point,
    position: "现场可见",
    blocks: "无障碍通行路径",
  };
}

/** Gemma 未返回 obstacles 时，用 evidencePoints 补全地图标注 */
export function ensureObstaclesFromEvidence(
  result: AnalysisResult,
): AnalysisResult {
  if (result.obstacles.length > 0) {
    return result;
  }
  if (result.evidencePoints.length === 0) {
    return result;
  }

  return {
    ...result,
    obstacles: result.evidencePoints.map(obstacleFromEvidencePoint),
    obstaclesInferredFromEvidence: true,
  };
}
