import type {
  AnalysisResult,
  ObstacleNature,
  SpatialConflictCategory,
} from "@/types/analysis";

export function inferSpatialCategory(
  record: Partial<AnalysisResult>,
): SpatialConflictCategory {
  if (record.category) return record.category;
  if (record.sceneType === "access_route_discontinuity") {
    return record.obstacleNature === "dynamic"
      ? "legacy_addition_conflict"
      : "native_design_defect";
  }
  if (record.sceneType === "accessible_entrance_blocked") {
    return "legacy_addition_conflict";
  }
  return "capacity_demand_mismatch";
}

export function inferObstacleNature(record: Partial<AnalysisResult>): ObstacleNature {
  if (record.obstacleNature) return record.obstacleNature;
  if (record.sceneType === "tactile_paving_blocked") return "dynamic";
  return "static";
}
