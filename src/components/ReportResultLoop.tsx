"use client";

import AnchorLink from "@/components/AnchorLink";
import Link from "next/link";
import { DISPATCH_DISCLAIMER } from "@/lib/dispatchScript";
import {
  REVIEW_STATUS_LABELS,
  type ReviewStatus,
} from "@/types/analysis";

const LOOP_STEPS: Array<{
  key: ReviewStatus | "saved";
  label: string;
}> = [
  { key: "saved", label: "已生成" },
  { key: "exported", label: "已递出" },
  { key: "reported", label: "已反馈" },
  { key: "review_pending", label: "待复查" },
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
  dispatchScriptEnabled?: boolean;
  dispatchCopySuccess?: boolean;
  onCopyDispatch?: () => void;
  savedRecordId?: string | null;
  onOpenArchive?: () => void;
}

export default function ReportResultLoop({
  reviewStatus,
  copyLabel,
  copySuccess,
  onCopy,
  onExport,
  onMarkReported,
  cloudReportId,
  analysisNote,
  dispatchScriptEnabled = false,
  dispatchCopySuccess = false,
  onCopyDispatch,
  savedRecordId,
  onOpenArchive,
}: ReportResultLoopProps) {
  const reported = reviewStatus === "reported" || stepDone(reviewStatus, "review_pending");

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900">跟进</h3>
        <span className="rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
          {REVIEW_STATUS_LABELS[reviewStatus]}
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
            </li>
          );
        })}
      </ol>

      {analysisNote && (
        <p className="mt-3 text-xs text-slate-600">{analysisNote}</p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {dispatchScriptEnabled && onCopyDispatch && (
          <button
            type="button"
            onClick={onCopyDispatch}
            className="btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            {dispatchCopySuccess ? "已复制 ✓" : "复制话术"}
          </button>
        )}
        <button
          type="button"
          onClick={onCopy}
          className={
            dispatchScriptEnabled
              ? "btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700"
              : "btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold"
          }
        >
          {copySuccess ? "已复制 ✓" : copyLabel}
        </button>
        <button
          type="button"
          onClick={onExport}
          className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          导出 PDF
        </button>
        {!reported && (
          <button
            type="button"
            onClick={onMarkReported}
            className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            已反馈
          </button>
        )}
        <AnchorLink
          href="#records"
          className="btn-secondary rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
        >
          时间线
        </AnchorLink>
        {savedRecordId && (
          <Link
            href={`/saved/${savedRecordId}`}
            onClick={onOpenArchive}
            className="btn-primary rounded-xl px-4 py-2.5 text-center text-sm font-semibold"
          >
            档案
          </Link>
        )}
        {cloudReportId && (
          <Link
            href={`/reports/${cloudReportId}`}
            className="btn-secondary rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
          >
            公开页
          </Link>
        )}
      </div>

      {dispatchScriptEnabled && (
        <p className="mt-3 text-[11px] text-slate-500">{DISPATCH_DISCLAIMER}</p>
      )}

      <p className="mt-3 text-[11px] text-slate-500">递出前请人工核对 · AI 仅供参考</p>
    </section>
  );
}
