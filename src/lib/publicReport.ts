import { fuzzLocationForPublic } from "@/lib/locationValidation";
import type { AnalysisResult } from "@/types/analysis";
import type { CloudReport, CloudReportSummary } from "@/types/cloudReport";

function isNoIssueText(raw: string | null | undefined): boolean {
  const text = raw?.trim().toLowerCase() ?? "";
  return (
    text === "none" ||
    text === "no_issue" ||
    text.includes("无明显障碍物") ||
    text.includes("未发现明显问题")
  );
}

function normalizeNoIssueDiagnosis(diagnosis: AnalysisResult): AnalysisResult {
  if (diagnosis.hasIssue !== false && !isNoIssueText(diagnosis.issueType)) {
    return diagnosis;
  }
  return {
    ...diagnosis,
    hasIssue: false,
    issueType: "未发现明显问题",
    sceneType: "no_issue",
    pathStatus: "clear",
    riskLevel: "低",
    obstacles: [],
  };
}

export function sanitizeDiagnosisForPublic(
  diagnosis: AnalysisResult,
  exactLocation?: string | null,
): AnalysisResult {
  const cleanDiagnosis = normalizeNoIssueDiagnosis(diagnosis);
  const fuzzy = fuzzLocationForPublic(exactLocation ?? diagnosis.location);
  return {
    ...cleanDiagnosis,
    location: fuzzy,
    blockedPath: cleanDiagnosis.blockedPath
      ? fuzzLocationForPublic(cleanDiagnosis.blockedPath)
      : cleanDiagnosis.blockedPath,
  };
}

export function toPublicCloudReport(report: CloudReport): CloudReport {
  const fuzzy = fuzzLocationForPublic(report.location);
  const diagnosis = normalizeNoIssueDiagnosis(report.diagnosis);
  const noIssue = diagnosis.hasIssue === false || isNoIssueText(report.issue_type);
  return {
    id: report.id,
    created_at: report.created_at,
    local_id: report.local_id,
    location: fuzzy,
    lat: null,
    lng: null,
    scene_type: noIssue ? "no_issue" : report.scene_type,
    issue_type: noIssue ? "未发现明显问题" : report.issue_type,
    risk_level: noIssue ? "低" : report.risk_level,
    record_mode: report.record_mode,
    target_department: report.target_department,
    problem_summary: report.problem_summary,
    report_text: report.report_text,
    path_status: noIssue ? "clear" : report.path_status,
    review_status: report.review_status,
    image_url: report.image_url,
    diagnosis: sanitizeDiagnosisForPublic(diagnosis, report.location),
    analysis_source: report.analysis_source,
  };
}

export function toPublicCloudReportSummary(
  report: CloudReportSummary,
): CloudReportSummary {
  const noIssue = isNoIssueText(report.issue_type);
  return {
    id: report.id,
    created_at: report.created_at,
    location: fuzzLocationForPublic(report.location),
    lat: null,
    lng: null,
    scene_type: noIssue ? "no_issue" : report.scene_type,
    issue_type: noIssue ? "未发现明显问题" : report.issue_type,
    risk_level: noIssue ? "低" : report.risk_level,
    record_mode: report.record_mode,
    problem_summary: report.problem_summary,
    image_url: report.image_url,
    review_status: report.review_status,
  };
}
