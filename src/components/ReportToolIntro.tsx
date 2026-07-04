"use client";

import { migrateLegacyReviewStatus } from "@/lib/ledgerStatus";
import { getRecords } from "@/lib/recordStore";
import { useEffect, useState } from "react";

const STEPS = [
  { n: "01", title: "上传照片" },
  { n: "02", title: "填写地点" },
  { n: "03", title: "选择模式" },
  { n: "04", title: "Gemma 4 分析" },
  { n: "05", title: "本地时间线" },
  { n: "06", title: "导出报告" },
  { n: "07", title: "后续复查" },
];

interface ReportToolIntroProps {
  variant?: "full" | "folded";
}

export default function ReportToolIntro({ variant = "full" }: ReportToolIntroProps) {
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0 });

  useEffect(() => {
    const sync = () => {
      const records = getRecords();
      setStats({
        total: records.length,
        pending: records.filter((r) => {
          const status = migrateLegacyReviewStatus(r.reviewStatus);
          return status === "pending_verification" || status === "pending_remediation";
        }).length,
        verified: records.filter(
          (r) => migrateLegacyReviewStatus(r.reviewStatus) === "verified",
        ).length,
      });
    };
    sync();
    window.addEventListener("barrierlens-record-saved", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("barrierlens-record-saved", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const statRows = [
    { label: "累计", value: stats.total, tone: "text-slate-900" },
    { label: "待跟进", value: stats.pending, tone: "text-amber-700" },
    { label: "已复查", value: stats.verified, tone: "text-emerald-700" },
  ];

  const body = (
    <>
      <div className="px-5 py-6 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Demo 主流程</h2>
            <p className="mt-1 text-xs text-slate-600">
              照片 → 结构化证据 → 时间线 → 导出 / 复查
            </p>
          </div>
          <dl className="flex gap-5 text-right">
            {statRows.map((row) => (
              <div key={row.label}>
                <dt className="text-[10px] text-slate-500">{row.label}</dt>
                <dd className={`font-mono text-lg font-semibold tabular-nums ${row.tone}`}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t border-slate-200/80 bg-slate-50/60 px-5 py-6 sm:px-8">
        <ol className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm"
            >
              <p className="font-mono text-[10px] text-slate-400">{step.n}</p>
              <p className="mt-1 text-xs font-semibold text-slate-900 sm:text-sm">
                {step.title}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </>
  );

  if (variant === "folded") {
    return (
      <details className="tool-card mb-8 overflow-hidden p-0">
        <summary className="cursor-pointer list-none px-5 py-4 sm:px-8 [&::-webkit-details-marker]:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">Demo 主流程</p>
            <dl className="flex gap-4 text-right">
              {statRows.map((row) => (
                <div key={row.label}>
                  <dt className="text-[10px] text-slate-500">{row.label}</dt>
                  <dd className={`font-mono text-lg font-semibold tabular-nums ${row.tone}`}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </summary>
        {body}
      </details>
    );
  }

  return <div className="tool-card mb-8 overflow-hidden p-0">{body}</div>;
}
