import Link from "next/link";
import {
  RECORD_MODES,
  REVIEW_STATUS_LABELS,
  SCENE_TYPE_LABELS,
  type RecordMode,
} from "@/types/analysis";
import type { CloudReport } from "@/types/cloudReport";
import AnalysisResultView from "@/components/AnalysisResult";
import ReportCard from "@/components/ReportCard";
import ReportLocationMap from "@/components/ReportLocationMap";
import SpatialDiagnosisTags from "@/components/SpatialDiagnosisTags";

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
  const diagnosis = {
    ...report.diagnosis,
    imageDataUrl: report.image_url ?? undefined,
    location: report.location,
    recordMode: report.record_mode as RecordMode,
  };
  const recordMode = (report.record_mode as RecordMode) ?? "public";
  const reportTitle =
    recordMode === "public" ? "公众倡导摘要" : "物业巡查整改单";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            公开上报
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {report.issue_type}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {formatCloudTime(report.created_at)} ·{" "}
            {RECORD_MODES[recordMode].label}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SpatialDiagnosisTags record={diagnosis} />
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
            {SCENE_TYPE_LABELS[diagnosis.sceneType]}
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
            {REVIEW_STATUS_LABELS[diagnosis.reviewStatus]}
          </span>
        </div>
      </div>

      <ReportLocationMap
        location={report.location}
        lat={report.lat}
        lng={report.lng}
      />

      <div className="tool-card p-6 sm:p-10">
        <h2 className="text-lg font-bold text-slate-900">结构化诊断</h2>
        <p className="mt-1 text-sm text-slate-500">
          AI 生成的无障碍通行风险证据
        </p>
        <div className="mt-6">
          <AnalysisResultView result={diagnosis} recordMode={recordMode} />
        </div>
        {report.report_text && (
          <div className="mt-6">
            <ReportCard title={reportTitle} reportText={report.report_text} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/reports" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
          返回公开列表
        </Link>
        <Link href="/#tool" className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
          我也要上报
        </Link>
      </div>
    </div>
  );
}
