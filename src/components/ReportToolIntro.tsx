"use client";

import { getRecords } from "@/lib/recordStore";
import { useEffect, useState } from "react";

const STEPS = [
  { n: "01", title: "拍照或选样例", desc: "上传现场照片，AI 读取空间冲突" },
  { n: "02", title: "选类别与模式", desc: "公众记录或物业自查，归类责任方" },
  { n: "03", title: "生成诊断报告", desc: "结构化输出，可归档、导出、复查" },
  { n: "04", title: "本机时间线", desc: "按地点聚合，跟踪整改状态" },
];

export default function ReportToolIntro() {
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
    { label: "本机累计记录", value: stats.total, tone: "text-slate-900" },
    { label: "待跟进", value: stats.pending, tone: "text-amber-700" },
    { label: "已整改", value: stats.fixed, tone: "text-emerald-700" },
  ];

  return (
    <div className="tool-card mb-8 overflow-hidden p-0">
      <div className="px-5 py-8 sm:px-10 sm:py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)] lg:items-start">
          <div>
            <p className="section-eyebrow">现场记录工具</p>
            <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              记录、查看无障碍空间问题
            </h2>
            <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-slate-600">
              如盲道占用、入口受阻、通行链断点——拍照即可生成结构化证据。记录默认保存在本机，对外分享前请核对内容并避免可识别路人面部、车牌。
            </p>
          </div>

          <dl className="divide-y divide-slate-200 border-y border-slate-200 lg:border-y-0 lg:border-l lg:pl-8">
            {statRows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0 lg:first:pt-0">
                <dt className="text-sm font-medium text-slate-600">{row.label}</dt>
                <dd className={`font-mono text-2xl font-semibold tabular-nums tracking-tight ${row.tone}`}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t border-slate-200/80 bg-slate-50/60 px-5 py-8 sm:px-10">
        <p className="section-eyebrow text-slate-500">如何记录一个问题</p>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="flex h-full gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-[10px] font-semibold text-slate-600">
                {step.n}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
