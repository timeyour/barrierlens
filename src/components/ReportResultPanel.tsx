import type { ReactNode } from "react";
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
  loopSlot?: ReactNode;
  footerSlot?: ReactNode;
  showLocationMap?: boolean;
}

export default function ReportResultPanel({
  result,
  recordMode,
  subtitle,
  reportTitle,
  analysisSource,
  loopSlot,
  footerSlot,
  showLocationMap = true,
}: ReportResultPanelProps) {
  const hasCoords = result.lat != null && result.lng != null;

  return (
    <div className="space-y-5">
      <ResultConclusionHeader
        result={result}
        recordMode={recordMode}
        subtitle={subtitle}
      />

      <AnalysisVerificationBanner
        analysisSource={analysisSource}
        needsHumanReview={result.needsHumanReview}
      />

      <BarrierMap result={result} />

      {showLocationMap && hasCoords && result.location && (
        <ReportLocationMap
          location={result.location}
          lat={result.lat ?? null}
          lng={result.lng ?? null}
        />
      )}

      {result.reportText && (
        <ReportCard title={reportTitle} reportText={result.reportText} />
      )}

      {loopSlot}

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
