import Image from "next/image";
import Link from "next/link";
import {
  RECORD_MODES,
  SCENE_TYPE_LABELS,
  type RecordMode,
} from "@/types/analysis";
import type { CloudReportSummary } from "@/types/cloudReport";
import { displayLocationLabel } from "@/lib/locationValidation";

function formatCloudTime(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function riskBadgeClass(level: string): string {
  if (level === "高") return "bg-red-100 text-red-800";
  if (level === "中") return "bg-amber-100 text-amber-900";
  return "bg-emerald-100 text-emerald-800";
}

export default function PublicReportCard({ report }: { report: CloudReportSummary }) {
  const recordMode = report.record_mode as RecordMode;

  return (
    <Link
      href={`/reports/${report.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-md"
    >
      <div className="grid gap-0 sm:grid-cols-[140px_1fr]">
        <div className="relative aspect-[4/3] bg-slate-100 sm:aspect-auto sm:min-h-[120px]">
          {report.image_url ? (
            <Image
              src={report.image_url}
              alt={`${report.issue_type} 现场照片`}
              fill
              className="object-cover object-center"
              sizes="140px"
              unoptimized
            />
          ) : (
            <div className="flex h-full min-h-[120px] items-center justify-center px-3 text-center">
              <p className="text-[11px] leading-snug text-slate-500">无现场照片</p>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${riskBadgeClass(report.risk_level)}`}
            >
              {report.risk_level}风险
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
              {SCENE_TYPE_LABELS[report.scene_type as keyof typeof SCENE_TYPE_LABELS] ??
                report.scene_type}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
              {RECORD_MODES[recordMode]?.label ?? recordMode}
            </span>
          </div>
          <h2 className="mt-2 text-sm font-semibold text-slate-900 group-hover:text-blue-700">
            {report.issue_type}
          </h2>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
            {report.problem_summary ?? report.location}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            {displayLocationLabel(report.location)} · {formatCloudTime(report.created_at)}
          </p>
        </div>
      </div>
    </Link>
  );
}
