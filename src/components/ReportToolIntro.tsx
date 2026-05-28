"use client";

import { getRecords } from "@/lib/recordStore";
import { useEffect, useState } from "react";

const FLOW = [
  { title: "拍照", desc: "现场或样例图" },
  { title: "选类", desc: "模式与责任方" },
  { title: "生成", desc: "结构化报告" },
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

  return (
    <header className="mb-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="section-eyebrow">开始记录</p>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
            拍照上传，生成无障碍通行证据
          </h2>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-slate-600 sm:text-base">
            盲道占用、入口受阻、通行链断点——Gemma 4 输出可归档、可复查的结构化报告。数据默认保存在本机。
          </p>
        </div>

        <dl className="flex flex-wrap gap-2 sm:gap-3">
          {[
            { label: "累计", value: stats.total },
            { label: "待跟进", value: stats.pending, accent: true },
            { label: "已整改", value: stats.fixed },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-center shadow-sm"
            >
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {item.label}
              </dt>
              <dd
                className={`font-mono text-lg font-semibold tabular-nums leading-none ${
                  item.accent ? "text-amber-700" : "text-slate-900"
                }`}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <ol className="step-timeline flex flex-wrap items-center gap-2 text-sm sm:gap-0">
        {FLOW.map((step, index) => (
          <li key={step.title} className="flex min-w-0 items-center gap-2 sm:flex-1">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-slate-900">{step.title}</span>
              <span className="block text-xs text-slate-500">{step.desc}</span>
            </span>
            {index < FLOW.length - 1 && (
              <span
                className="mx-2 hidden h-px flex-1 bg-slate-200 sm:block"
                aria-hidden
              />
            )}
          </li>
        ))}
      </ol>
    </header>
  );
}
