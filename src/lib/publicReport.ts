import { fuzzLocationForPublic } from "@/lib/locationValidation";
import type { AnalysisResult } from "@/types/analysis";
import type { CloudReport, CloudReportSummary } from "@/types/cloudReport";

export function sanitizeDiagnosisForPublic(
  diagnosis: AnalysisResult,
  exactLocation?: string | null,
): AnalysisResult {
  const fuzzy = fuzzLocationForPublic(exactLocation ?? diagnosis.location);
  return {
    ...diagnosis,
    location: fuzzy,
    blockedPath: diagnosis.blockedPath
      ? fuzzLocationForPublic(diagnosis.blockedPath)
      : diagnosis.blockedPath,
  };
}

export function toPublicCloudReport(report: CloudReport): CloudReport {
  const fuzzy = fuzzLocationForPublic(report.location);
  return {
    ...report,
    location: fuzzy,
    lat: null,
    lng: null,
    image_url: null,
    diagnosis: sanitizeDiagnosisForPublic(report.diagnosis, report.location),
  };
}

export function toPublicCloudReportSummary(
  report: CloudReportSummary,
): CloudReportSummary {
  return {
    ...report,
    location: fuzzLocationForPublic(report.location),
    lat: null,
    lng: null,
    image_url: null,
  };
}
