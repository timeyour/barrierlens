"use client";

import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";

const METRICS = [
  { label: "测试照片", value: "≥30", unit: "张", highlight: true },
  { label: "识别准确率", value: "≥85", unit: "%", highlight: false },
  { label: "误报率", value: "≤15", unit: "%", highlight: false },
  { label: "生成成功率", value: "≥95", unit: "%", highlight: false },
  { label: "平均耗时", value: "≤8", unit: "秒", highlight: false },
  { label: "操作步骤", value: "≤4", unit: "步", highlight: true },
];

export default function BentoMetrics() {
  return (
    <ScrollReveal>
      <section>
        <SectionHeader
          eyebrow="Hackathon Goals"
          title="量化目标"
          description="参赛 Demo 的可验证指标 — 小而完整，可测量。"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((m, i) => (
            <ScrollReveal key={m.label} delay={i * 0.05}>
              <div
                className={`bento-card p-5 ${m.highlight ? "sm:col-span-1 lg:row-span-1" : ""}`}
              >
                <p className="text-xs font-medium text-slate-500">{m.label}</p>
                <p className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {m.value}
                  </span>
                  <span className="text-sm font-medium text-emerald-600">
                    {m.unit}
                  </span>
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
