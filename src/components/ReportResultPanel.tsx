import type { ReactNode } from "react";
import { formatLocationBrief } from "@/lib/locationValidation";
import type { AnalysisResult, AnalysisSource, RecordMode } from "@/types/analysis";
import AnalysisResultDetails, {
  ResultConclusionHeader,
} from "@/components/AnalysisResultDetails";
import AnalysisVerificationBanner from "@/components/AnalysisVerificationBanner";
import ReportCard from "@/components/ReportCard";
import ReportEvidenceLayout from "@/components/ReportEvidenceLayout";

export type ReportResultPanelResult = AnalysisResult & {
  imageDataUrl?: string;
  reviewImageDataUrl?: string;
  lat?: number | null;
  lng?: number | null;
};

interface ReportResultPanelProps {
  result: ReportResultPanelResult;
  recordMode: RecordMode;
  subtitle?: string;
  reportTitle: string;
  analysisSource?: AnalysisSource | null;
  topBarSlot?: ReactNode;
  loopSlot?: ReactNode;
  publishSlot?: ReactNode;
  footerSlot?: ReactNode;
  showLocationMap?: boolean;
}

export default function ReportResultPanel({
  result,
  recordMode,
  subtitle,
  reportTitle,
  analysisSource,
  topBarSlot,
  loopSlot,
  publishSlot,
  footerSlot,
  showLocationMap = true,
}: ReportResultPanelProps) {
  const locationBrief = formatLocationBrief(result.location);
  const showReportCard =
    Boolean(result.reportText) &&
    result.reportText.trim() !== result.problemSummary.trim() &&
    result.reportText.trim() !== (result.advocacyText || "").trim();

  const visualSection = (
    <details className="rounded-xl border border-slate-200 bg-white" open>
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">
        现场照片 · 位置与摘要
        {locationBrief !== "地点未标注" && (
          <span className="ml-2 text-xs font-normal text-slate-500">
            {locationBrief}
          </span>
        )}
      </summary>
      <div className="border-t border-slate-100 px-4 py-3">
        <ReportEvidenceLayout result={result} showLocationMap={showLocationMap} />
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
          诊断摘要叠在照片左侧 · 大致位置见下方地图
        </p>
      </div>
    </details>
  );

  const showVerificationBanner =
    analysisSource === "mock" ||
    analysisSource === "mock_fallback" ||
    result.needsHumanReview ||
    result.obstaclesInferredFromEvidence;

  return (
    <div className="space-y-4">
      {topBarSlot}

      <ResultConclusionHeader
        result={result}
        recordMode={recordMode}
        subtitle={subtitle}
      />

      {visualSection}

      {showVerificationBanner && (
        <AnalysisVerificationBanner
          analysisSource={analysisSource}
          needsHumanReview={result.needsHumanReview}
          obstaclesInferredFromEvidence={result.obstaclesInferredFromEvidence}
        />
      )}

      {loopSlot}

      {publishSlot}

      {showReportCard && (
        <ReportCard title={reportTitle} reportText={result.reportText} />
      )}

      <details className="rounded-xl border border-slate-200 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">
          展开完整诊断字段
        </summary>
        <div className="border-t border-slate-100 px-4 py-3">
          <AnalysisResultDetails result={result} recordMode={recordMode} />
        </div>
      </details>

      {footerSlot}
    </div>
  );
}
