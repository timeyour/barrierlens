"use client";

import { getRecords } from "@/lib/recordStore";
import { useEffect, useState } from "react";

const STEPS = [
  { n: "1", title: "拍照或选样例", desc: "上传现场照片，AI 读取空间冲突" },
  { n: "2", title: "选类别与模式", desc: "公众记录或物业自查，归类责任方" },
  { n: "3", title: "生成诊断报告", desc: "结构化输出，可归档、导出、复查" },
  { n: "4", title: "本机时间线", desc: "按地点聚合，跟踪整改状态" },
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
    <div className="tool-card mb-6 overflow-hidden p-0">
      <div className="border-b border-slate-200 bg-white px-5 py-6 sm:px-8 sm:py-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          记录、查看无障碍空间问题
        </h2>
        <p className="mt-2 max-w-2xl text-base text-slate-600">
          如盲道占用、入口受阻、通行链断点——拍照即可生成结构化证据。记录默认保存在本机，对外分享前请核对内容并避免可识别路人面部、车牌。
        </p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          <li className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center">
            <p className="text-2xl font-bold tabular-nums text-slate-900">{stats.total}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-600">本机累计记录</p>
          </li>
          <li className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center">
            <p className="text-2xl font-bold tabular-nums text-amber-700">{stats.pending}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-600">待跟进</p>
          </li>
          <li className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center">
            <p className="text-2xl font-bold tabular-nums text-emerald-700">{stats.fixed}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-600">已整改</p>
          </li>
        </ul>
      </div>

      <div className="bg-slate-50/80 px-5 py-5 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          如何记录一个问题
        </p>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {step.n}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
