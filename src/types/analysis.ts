export type TargetDepartment = "物业" | "社区" | "商场" | "城管";

export type RiskLevel = "低" | "中" | "高";

/** 公众记录：证据归档与倡导；物业自查：内部巡查整改 */
export type RecordMode = "public" | "inspection";

export interface AnalysisResult {
  issueType: string;
  riskLevel: RiskLevel;
  affectedGroups: string[];
  sceneDescription: string;
  suggestion: string;
  targetDepartment: TargetDepartment;
  /** 主展示文本，随 recordMode 切换 */
  reportText: string;
  advocacyText: string;
  inspectionText: string;
  location?: string;
  recordMode?: RecordMode;
  recordedAt?: string;
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
