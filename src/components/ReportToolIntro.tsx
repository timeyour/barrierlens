"use client";

import { getRecords } from "@/lib/recordStore";
import { useEffect, useState } from "react";

const STEPS = [
  { title: "拍照或选样例", desc: "上传现场照片" },
  { title: "选类别与模式", desc: "公众记录或物业自查" },
  { title: "生成诊断报告", desc: "结构化 AI 输出" },
  { title: "本机时间线", desc: "跟踪整改状态" },
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
    <div className="tool-card mb-6 px-5 py-8 sm:px-8 sm:py-9">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="section-eyebrow" id="tool-heading">
            现场记录工具
          </p>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-slate-900">
            记录、查看无障碍空间问题
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            盲道占用、入口受阻、通行链断点——拍照生成结构化证据。记录保存在本机，分享前请核对并避免可识别面部、车牌。
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:shrink-0 lg:pt-6">
          {[
            { label: "累计", value: stats.total },
            { label: "待跟进", value: stats.pending, warn: true },
            { label: "已整改", value: stats.fixed },
          ].map((item) => (
            <div key={item.label} className="stat-pill min-w-[4.5rem] text-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p
                className={`font-mono text-lg font-semibold tabular-nums leading-tight ${
                  item.warn ? "text-amber-700" : "text-slate-900"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <nav aria-label="如何记录一个问题" className="mt-8 border-t border-slate-200 pt-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          如何记录一个问题
        </p>
        <ol className="flow-steps mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="min-w-0 pr-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <p className="mt-2 text-sm font-semibold text-slate-900">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{step.desc}</p>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
