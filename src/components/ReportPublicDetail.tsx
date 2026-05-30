import Link from "next/link";
import {
  RECORD_MODES,
  type RecordMode,
} from "@/types/analysis";
import type { CloudReport } from "@/types/cloudReport";
import PublicReportLocalBanner from "@/components/PublicReportLocalBanner";
import PublicReportReadOnlyBanner from "@/components/PublicReportReadOnlyBanner";
import ReportResultPanel from "@/components/ReportResultPanel";
import { isHackathonFlagEnabled } from "@/config/hackathonFlags";

function formatCloudTime(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ReportPublicDetailProps {
  report: CloudReport;
}

export default function ReportPublicDetail({ report }: ReportPublicDetailProps) {
  const publicReadOnly = isHackathonFlagEnabled("publicReadOnly");
  const diagnosis = {
    ...report.diagnosis,
    imageDataUrl: report.image_url ?? undefined,
    location: report.location,
    recordMode: report.record_mode as RecordMode,
    lat: report.lat,
    lng: report.lng,
  };
  const recordMode = (report.record_mode as RecordMode) ?? "public";
  const reportTitle =
    recordMode === "public" ? "公众倡导摘要" : "巡查整改单";

  return (
    <div className="space-y-5">
      <PublicReportReadOnlyBanner enabled={publicReadOnly} />
      <PublicReportLocalBanner localId={report.local_id} />

      <div className="tool-card p-5 sm:p-8">
        <ReportResultPanel
          result={diagnosis}
          recordMode={recordMode}
          analysisSource={report.analysis_source}
          subtitle={`${formatCloudTime(report.created_at)} · ${RECORD_MODES[recordMode].label}`}
          reportTitle={reportTitle}
          footerSlot={
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/reports"
                className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold"
              >
                返回列表
              </Link>
              <Link
                href="/#tool"
                className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold"
              >
                我也要拍
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
}
