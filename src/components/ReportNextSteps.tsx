"use client";

import AnchorLink from "@/components/AnchorLink";
import {
  buildReportNextSteps,
  NEXT_STEPS_DISCLAIMER,
} from "@/lib/reportNextSteps";
import { RECORD_MODES, type RecordMode, type TargetDepartment } from "@/types/analysis";

interface ReportNextStepsProps {
  recordMode: RecordMode;
  targetDepartment: TargetDepartment;
  exportedMarked?: boolean;
}

export default function ReportNextSteps({
  recordMode,
  targetDepartment,
  exportedMarked = false,
}: ReportNextStepsProps) {
  const steps = buildReportNextSteps(recordMode, targetDepartment);
  const modeLabel = RECORD_MODES[recordMode].label;

  return (
    <div className="tool-card overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">建议下一步</h2>
        <p className="mt-1 text-sm text-slate-600">
          {modeLabel} · 归类 {targetDepartment} · 报告生成后的跟进指引
        </p>
      </div>

      <ol className="divide-y divide-slate-100 px-5 py-2 sm:px-6">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3 py-3.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
        {exportedMarked && (
          <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            已在时间线将该记录标记为<strong>「已导出」</strong>。递出后请在
            <AnchorLink href="#records" className="font-semibold underline">
              问题记录
            </AnchorLink>
            中更新为「已反馈」。
          </p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-slate-500">{NEXT_STEPS_DISCLAIMER}</p>
          <AnchorLink
            href="#records"
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
          >
            打开问题记录
          </AnchorLink>
        </div>
      </div>
    </div>
  );
}
