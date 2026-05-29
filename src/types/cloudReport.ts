import type { AnalysisResult, AnalysisSource } from "@/types/analysis";

export interface CloudReport {
  id: string;
  created_at: string;
  local_id: string | null;
  location: string;
  lat: number | null;
  lng: number | null;
  scene_type: string;
  issue_type: string;
  risk_level: string;
  record_mode: string;
  target_department: string | null;
  problem_summary: string | null;
  report_text: string | null;
  path_status: string | null;
  review_status: string;
  image_url: string | null;
  diagnosis: AnalysisResult;
  analysis_source: AnalysisSource | null;
}

export type CloudReportSummary = Pick<
  CloudReport,
  | "id"
  | "created_at"
  | "location"
  | "lat"
  | "lng"
  | "scene_type"
  | "issue_type"
  | "risk_level"
  | "record_mode"
  | "problem_summary"
  | "image_url"
  | "review_status"
>;
