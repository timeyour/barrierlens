export type TargetDepartment = "物业" | "社区" | "商场" | "城管";

export type RiskLevel = "低" | "中" | "高";

/** 三元空间冲突品类 */
export type SpatialConflictCategory =
  | "native_design_defect"
  | "legacy_addition_conflict"
  | "capacity_demand_mismatch";

/** 障碍物物理属性 */
export type ObstacleNature = "static" | "dynamic";

export type SceneType =
  | "tactile_paving_blocked"
  | "accessible_entrance_blocked"
  | "access_route_discontinuity"
  | "no_issue";
export type PathStatus = "clear" | "partial" | "blocked";
export type AnalysisSource = "gemma" | "ollama" | "mock" | "mock_fallback";
export type ReviewStatus =
  | "pending"
  | "exported"
  | "reported"
  | "review_pending"
  | "fixed"
  | "unfixed";

/** 公众记录：证据归档与倡导；物业自查：内部巡查整改 */
export type RecordMode = "public" | "inspection";

export interface Obstacle {
  name: string;
  position: string;
  blocks: string;
}

export interface AnalysisResult {
  hasIssue: boolean;
  category: SpatialConflictCategory;
  obstacleNature: ObstacleNature;
  managementAction: string;
  sceneType: SceneType;
  locationType: string;
  obstacles: Obstacle[];
  blockedPath: string;
  pathStatus: PathStatus;
  problemSummary: string;
  evidencePoints: string[];
  issueType: string;
  riskLevel: RiskLevel;
  affectedGroups: string[];
  sceneDescription: string;
  suggestion: string;
  responsibleParty: string[];
  suggestedActions: string[];
  confidence: number;
  needsHumanReview: boolean;
  reviewStatus: ReviewStatus;
  reviewNote?: string;
  reviewedAt?: string;
  targetDepartment: TargetDepartment;
  /** 主展示文本，随 recordMode 切换 */
  reportText: string;
  advocacyText: string;
  inspectionText: string;
  location?: string;
  recordMode?: RecordMode;
  recordedAt?: string;
  /** obstacles 为空时由 evidencePoints 补全 */
  obstaclesInferredFromEvidence?: boolean;
}

export interface AnalysisRequest {
  imageBase64: string;
  targetDepartment: TargetDepartment;
  recordMode: RecordMode;
  location?: string;
  fileName?: string;
}

export interface StoredRecord extends AnalysisResult {
  id: string;
  location: string;
  recordMode: RecordMode;
  recordedAt: string;
  /** 归档时的现场反馈照片（压缩 data URL） */
  imageDataUrl?: string;
  /** 整改复查时上传的复拍照片 */
  reviewImageDataUrl?: string;
  /** 上报时浏览器定位（供档案页 OSM 地图） */
  lat?: number | null;
  lng?: number | null;
  /** 用户确认公开后写入的云端记录 ID */
  cloudReportId?: string;
  /** 档案页拉取「照片复核申请」时校验用（仅存本机） */
  reviewToken?: string;
}

export const TARGET_DEPARTMENTS: TargetDepartment[] = [
  "物业",
  "社区",
  "商场",
  "城管",
];

export const RECORD_MODES: Record<
  RecordMode,
  { label: string; hint: string }
> = {
  public: {
    label: "公众记录",
    hint: "归档证据、生成倡导摘要，供公益组织或公众传播",
  },
  inspection: {
    label: "物业自查",
    hint: "生成内部巡查整改单，便于物业/商场主动整改",
  },
};

export const SPATIAL_CONFLICT_LABELS: Record<SpatialConflictCategory, string> = {
  native_design_defect: "设计硬伤",
  legacy_addition_conflict: "加建冲突",
  capacity_demand_mismatch: "容量错配",
};

export const OBSTACLE_NATURE_LABELS: Record<ObstacleNature, string> = {
  static: "静态受阻",
  dynamic: "动态占用",
};

export const SCENE_TYPE_LABELS: Record<SceneType, string> = {
  tactile_paving_blocked: "盲道占用",
  accessible_entrance_blocked: "入口/坡道受阻",
  access_route_discontinuity: "通行链断点",
  no_issue: "未发现明显问题",
};

export const PATH_STATUS_LABELS: Record<PathStatus, string> = {
  clear: "可通行",
  partial: "部分受阻",
  blocked: "阻断",
};

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "待处理",
  exported: "已导出",
  reported: "已反馈",
  review_pending: "待复查",
  fixed: "已整改",
  unfixed: "未整改",
};
