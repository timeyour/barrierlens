import {
  OBSTACLE_NATURE_LABELS,
  SPATIAL_CONFLICT_LABELS,
  type AnalysisResult,
} from "@/types/analysis";
import { inferObstacleNature, inferSpatialCategory } from "@/lib/spatialDiagnosis";

const CATEGORY_STYLES = {
  native_design_defect: "bg-violet-100 text-violet-800",
  legacy_addition_conflict: "bg-orange-100 text-orange-800",
  capacity_demand_mismatch: "bg-cyan-100 text-cyan-800",
} as const;

const NATURE_STYLES = {
  static: "bg-slate-100 text-slate-700",
  dynamic: "bg-amber-100 text-amber-800",
} as const;

interface SpatialDiagnosisTagsProps {
  record: Partial<AnalysisResult>;
  compact?: boolean;
}

export default function SpatialDiagnosisTags({
  record,
  compact = false,
}: SpatialDiagnosisTagsProps) {
  const category = inferSpatialCategory(record);
  const nature = inferObstacleNature(record);

  return (
    <>
      <span
        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${CATEGORY_STYLES[category]} ${
          compact ? "" : ""
        }`}
      >
        冲突源：{SPATIAL_CONFLICT_LABELS[category]}
      </span>
      <span
        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${NATURE_STYLES[nature]}`}
      >
        物理属性：{OBSTACLE_NATURE_LABELS[nature]}
      </span>
    </>
  );
}

export { inferObstacleNature, inferSpatialCategory };
