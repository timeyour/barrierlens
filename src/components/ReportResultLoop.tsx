"use client";

import {
  REVIEW_STATUS_LABELS,
  type ReviewStatus,
} from "@/types/analysis";

const PROGRESS_LABELS = ["已生成", "已递出", "已反馈", "待复查"] as const;

function progressIndex(reviewStatus: ReviewStatus): number {
  switch (reviewStatus) {
    case "pending":
      return 0;
    case "exported":
      return 1;
    case "reported":
      return 2;
    case "review_pending":
    case "fixed":
    case "unfixed":
      return 3;
    default:
      return 0;
  }
}

interface ReportResultLoopProps {
  reviewStatus: ReviewStatus;
  recordMode: "public" | "inspection";
  copyLabel: string;
  copySuccess: boolean;
  onCopy: () => void;
  onExport: () => void;
  onMarkReported: () => void;
  analysisNote?: string | null;
  dispatchScriptEnabled?: boolean;
  dispatchCopySuccess?: boolean;
  onCopyDispatch?: () => void;
  exportError?: string | null;
  exporting?: boolean;
}

export default function ReportResultLoop({
  reviewStatus,
  copyLabel,
  copySuccess,
  onCopy,
  onExport,
  onMarkReported,
  analysisNote,
  dispatchScriptEnabled = false,
  dispatchCopySuccess = false,
  onCopyDispatch,
  exportError = null,
  exporting = false,
}: ReportResultLoopProps) {
  const step = progressIndex(reviewStatus);
  const reported = step >= 2;

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">递出与跟进</h3>
        <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
          {REVIEW_STATUS_LABELS[reviewStatus]}
        </span>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
        {PROGRESS_LABELS.map((label, index) => (
          <span key={label}>
            {index > 0 && <span className="text-slate-300"> · </span>}
            <span
              className={
                index <= step ? "font-medium text-emerald-700" : "text-slate-400"
              }
            >
              {index <= step ? "✓ " : ""}
              {label}
            </span>
          </span>
        ))}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={exporting}
          onClick={onExport}
          className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {exporting ? "正在导出…" : "导出 PDF"}
        </button>
        {dispatchScriptEnabled && onCopyDispatch ? (
          <button
            type="button"
            onClick={onCopyDispatch}
            className="btn-secondary rounded-lg px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {dispatchCopySuccess ? "已复制 ✓" : "复制话术"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onCopy}
            className="btn-secondary rounded-lg px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {copySuccess ? "已复制 ✓" : copyLabel}
          </button>
        )}
        {!reported && (
          <button
            type="button"
            onClick={onMarkReported}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            标记已反馈
          </button>
        )}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
        {analysisNote ? `${analysisNote.replace(/。$/, "")} · ` : ""}
        递出前请核对摘要与照片
        {dispatchScriptEnabled ? " · AI 仅供参考" : ""}
      </p>
      {exportError && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {exportError}
        </p>
      )}
    </section>
  );
}
