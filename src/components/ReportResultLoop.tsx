"use client";

import AnchorLink from "@/components/AnchorLink";
import Link from "next/link";
import {
  REVIEW_STATUS_LABELS,
  type ReviewStatus,
} from "@/types/analysis";

const LOOP_STEPS: Array<{
  key: ReviewStatus | "saved";
  label: string;
  hint: string;
}> = [
  { key: "saved", label: "已生成", hint: "记录与照片已保存" },
  { key: "exported", label: "已递出", hint: "复制或导出摘要" },
  { key: "reported", label: "已反馈", hint: "确认已交给责任方" },
  { key: "review_pending", label: "待复查", hint: "到期后再拍复拍" },
];

function stepDone(reviewStatus: ReviewStatus, key: (typeof LOOP_STEPS)[number]["key"]) {
  if (key === "saved") return true;
  const order: ReviewStatus[] = [
    "pending",
    "exported",
    "reported",
    "review_pending",
    "fixed",
    "unfixed",
  ];
  const current = order.indexOf(reviewStatus);
  const target =
    key === "exported"
      ? 1
      : key === "reported"
        ? 2
        : key === "review_pending"
          ? 3
          : 0;
  if (reviewStatus === "fixed" || reviewStatus === "unfixed") return true;
  return current >= target;
}

interface ReportResultLoopProps {
  reviewStatus: ReviewStatus;
  recordMode: "public" | "inspection";
  copyLabel: string;
  copySuccess: boolean;
  onCopy: () => void;
  onExport: () => void;
  onMarkReported: () => void;
  cloudReportId?: string | null;
  analysisNote?: string | null;
}

export default function ReportResultLoop({
  reviewStatus,
  recordMode,
  copyLabel,
  copySuccess,
  onCopy,
  onExport,
  onMarkReported,
  cloudReportId,
  analysisNote,
}: ReportResultLoopProps) {
  const reported = reviewStatus === "reported" || stepDone(reviewStatus, "review_pending");

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">跟进闭环</h3>
          <p className="mt-1 text-xs text-slate-600">
            生成只是开始，递出 → 反馈 → 复拍，记录才有用。
          </p>
        </div>
        <span className="rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
          当前：{REVIEW_STATUS_LABELS[reviewStatus]}
        </span>
      </div>

      <ol className="mt-4 grid gap-2 sm:grid-cols-4">
        {LOOP_STEPS.map((step) => {
          const done = stepDone(reviewStatus, step.key);
          return (
            <li
              key={step.key}
              className={`rounded-lg border px-3 py-2.5 text-center ${
                done
                  ? "border-emerald-200 bg-emerald-50/80"
                  : "border-slate-200 bg-white/80"
              }`}
            >
              <p
                className={`text-xs font-semibold ${done ? "text-emerald-800" : "text-slate-700"}`}
              >
                {done ? "✓ " : ""}
                {step.label}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                {step.hint}
              </p>
            </li>
          );
        })}
      </ol>

      {analysisNote && (
        <p className="mt-3 text-xs text-slate-600">{analysisNote}</p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onCopy}
          className="btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          {copySuccess ? "已复制 ✓" : copyLabel}
        </button>
        <button
          type="button"
          onClick={onExport}
          className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          导出 Markdown
        </button>
        {!reported && (
          <button
            type="button"
            onClick={onMarkReported}
            className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            标记已反馈
          </button>
        )}
        <AnchorLink
          href="#records"
          className="btn-secondary rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
        >
          去时间线 · 上传复拍
        </AnchorLink>
        {cloudReportId && (
          <Link
            href={`/reports/${cloudReportId}`}
            className="btn-secondary rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
          >
            公开详情
          </Link>
        )}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        {recordMode === "inspection"
          ? "内部整改：派单后请在时间线上传整改复拍，完成前后对比。"
          : "公众记录：复制摘要发给物业/社区/12345 后点「已反馈」；约 7 天后同一地点再拍。"}
        AI 输出须人工核对后再对外使用。
      </p>
    </section>
  );
}
