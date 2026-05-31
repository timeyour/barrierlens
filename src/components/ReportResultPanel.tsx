import type { ReactNode } from "react";
import { sanitizeLocationForStorage, formatLocationBrief } from "@/lib/locationValidation";
import type { AnalysisResult, AnalysisSource, RecordMode } from "@/types/analysis";
import AnalysisResultDetails, {
  ResultConclusionHeader,
} from "@/components/AnalysisResultDetails";
import AnalysisVerificationBanner from "@/components/AnalysisVerificationBanner";
import BarrierMap from "@/components/BarrierMap";
import ReportCard from "@/components/ReportCard";
import ReportLocationMap from "@/components/ReportLocationMap";

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
  const locationLabel = sanitizeLocationForStorage(result.location);
  const locationBrief = formatLocationBrief(result.location);
  const showReportCard =
    Boolean(result.reportText) &&
    result.reportText.trim() !== result.problemSummary.trim() &&
    result.reportText.trim() !== (result.advocacyText || "").trim();

  const visualSection = (
    <details className="rounded-xl border border-slate-200 bg-white" open>
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">
        风险地图 · 现场标注
        {locationBrief !== "地点未标注" && (
          <span className="ml-2 text-xs font-normal text-slate-500">
            {locationBrief}
          </span>
        )}
      </summary>
      <div className="border-t border-slate-100 px-4 py-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-stretch">
          <div className="min-w-0">
            <p className="mb-1.5 text-[11px] font-medium text-slate-500">现场照片</p>
            <BarrierMap result={result} compact dense />
          </div>
          {showLocationMap && (
            <div className="min-w-0">
              <ReportLocationMap
                location={locationLabel || "已定位路段"}
                lat={result.lat ?? null}
                lng={result.lng ?? null}
                dense
              />
            </div>
          )}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
          点击照片或地图可放大核对 · 标注为示意，非精确测绘
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
