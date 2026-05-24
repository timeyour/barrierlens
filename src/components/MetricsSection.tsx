"use client";

import ScrollReveal from "@/components/ScrollReveal";

const METRICS = [
  { label: "真实测试照片", target: "≥ 30 张" },
  { label: "盲道占用识别准确率", target: "≥ 85%" },
  { label: "误报率", target: "≤ 15%" },
  { label: "报告生成成功率", target: "≥ 95%" },
  { label: "平均生成时间", target: "≤ 8 秒" },
  { label: "用户操作步骤", target: "≤ 4 步" },
];

export default function MetricsSection() {
  return (
    <ScrollReveal>
      <section className="glass-card mt-8 overflow-hidden p-4 sm:mt-12 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 sm:text-xs">
          Hackathon Metrics
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
          量化目标
        </h2>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
          {METRICS.map((item, index) => (
            <ScrollReveal key={item.label} delay={index * 0.06}>
              <li className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-slate-200/80 backdrop-blur-sm">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-semibold text-emerald-700">{item.target}</span>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </section>
    </ScrollReveal>
  );
}
