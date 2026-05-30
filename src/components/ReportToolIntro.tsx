"use client";

import { getRecords } from "@/lib/recordStore";
import { useEffect, useState } from "react";

const STEPS = [
  { n: "01", title: "拍照" },
  { n: "02", title: "选类型" },
  { n: "03", title: "生成报告" },
  { n: "04", title: "本机记录" },
];

interface ReportToolIntroProps {
  variant?: "full" | "folded";
}

export default function ReportToolIntro({ variant = "full" }: ReportToolIntroProps) {
  const [stats, setStats] = useState({ total: 0, pending: 0, fixed: 0 });

  useEffect(() => {
    const sync = () => {
      const records = getRecords();
      setStats({
        total: records.length,
        pending: records.filter((r) =>
          ["pending", "review_pending", "reported", "exported"].includes(r.reviewStatus),
        ).length,
        fixed: records.filter((r) => r.reviewStatus === "fixed").length,
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
    { label: "已整改", value: stats.fixed, tone: "text-emerald-700" },
  ];

  const body = (
    <>
      <div className="px-5 py-6 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">怎么记录</h2>
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
        <ol className="grid gap-2 sm:grid-cols-4">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm"
            >
              <p className="font-mono text-[10px] text-slate-400">{step.n}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{step.title}</p>
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
            <p className="text-sm font-semibold text-slate-900">记录说明</p>
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
