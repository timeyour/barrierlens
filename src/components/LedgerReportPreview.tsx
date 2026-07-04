"use client";

import type { LedgerReportData } from "@/lib/ledgerReport";
import { LEDGER_STATUS_LABELS, type LedgerStatus } from "@/types/analysis";

interface LedgerReportPreviewProps {
  report: LedgerReportData;
  onClose: () => void;
}

export default function LedgerReportPreview({
  report,
  onClose,
}: LedgerReportPreviewProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ledger-report-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
          <h2 id="ledger-report-title" className="text-base font-bold text-slate-900">
            巡检报告预览
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            关闭
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              巡检报告
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">
              {report.projectName}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              巡检时间：{report.generatedAt}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                <dt className="text-[11px] text-slate-500">问题总数</dt>
                <dd className="text-lg font-bold text-slate-900">
                  {report.totalCount}
                </dd>
              </div>
              <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                <dt className="text-[11px] text-slate-500">高风险</dt>
                <dd className="text-lg font-bold text-red-700">
                  {report.highRiskCount}
                </dd>
              </div>
              {(Object.keys(LEDGER_STATUS_LABELS) as LedgerStatus[]).map(
                (key) => (
                  <div
                    key={key}
                    className="rounded-lg bg-white p-3 ring-1 ring-slate-200"
                  >
                    <dt className="text-[11px] text-slate-500">
                      {LEDGER_STATUS_LABELS[key]}
                    </dt>
                    <dd className="text-lg font-bold text-slate-900">
                      {report.statusCounts[key]}
                    </dd>
                  </div>
                ),
              )}
            </dl>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-900">问题清单</h4>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-2 py-2 font-semibold">ID</th>
                    <th className="px-2 py-2 font-semibold">问题</th>
                    <th className="px-2 py-2 font-semibold">地点</th>
                    <th className="px-2 py-2 font-semibold">严重度</th>
                    <th className="px-2 py-2 font-semibold">状态</th>
                    <th className="px-2 py-2 font-semibold">复查结果</th>
                  </tr>
                </thead>
                <tbody>
                  {report.items.map((item) => (
                    <tr key={item.displayId} className="border-b border-slate-100">
                      <td className="px-2 py-2 font-mono text-[11px] text-slate-600">
                        {item.displayId}
                      </td>
                      <td className="px-2 py-2 font-medium text-slate-900">
                        {item.title}
                      </td>
                      <td className="max-w-[8rem] truncate px-2 py-2 text-slate-600">
                        {item.location}
                      </td>
                      <td className="px-2 py-2">{item.severity}</td>
                      <td className="px-2 py-2">{item.status}</td>
                      <td className="max-w-[10rem] truncate px-2 py-2 text-slate-600">
                        {item.reviewResult}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
            本报告由前端根据当前整改台账自动生成，AI
            描述均为「疑似问题 · 辅助识别」，正式汇报前请人工复核确认。
          </p>
        </div>
      </div>
    </div>
  );
}
