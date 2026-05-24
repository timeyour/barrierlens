export type TargetDepartment = "物业" | "社区" | "商场" | "城管";

export type RiskLevel = "低" | "中" | "高";

export interface AnalysisResult {
  issueType: string;
  riskLevel: RiskLevel;
  affectedGroups: string[];
  sceneDescription: string;
  suggestion: string;
  targetDepartment: TargetDepartment;
  reportText: string;
}

export interface AnalysisRequest {
  imageBase64: string;
  targetDepartment: TargetDepartment;
  fileName?: string;
}

export const TARGET_DEPARTMENTS: TargetDepartment[] = [
  "物业",
  "社区",
  "商场",
  "城管",
];
