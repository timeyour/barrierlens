"use client";

import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";

const METRICS = [
  { label: "测试照片", value: "≥30", unit: "张" },
  { label: "盲道占用识别准确率", value: "≥85", unit: "%" },
  { label: "结构化生成成功率", value: "≥95", unit: "%" },
  { label: "平均分析耗时", value: "≤8", unit: "秒" },
  { label: "用户操作步骤", value: "≤4", unit: "步" },
  { label: "Demo 视频", value: "≤5", unit: "分钟" },
];

export default function BentoMetrics() {
  return (
    <ScrollReveal>
      <section className="mb-10 sm:mb-14">
        <SectionHeader
          eyebrow="Hackathon Goals"
          title="量化目标"
          description="对齐 Gemma 4 Hackathon 2026 可验证指标 — 小而完整，可测量，可写进技术报告。"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {METRICS.map((m, i) => (
            <ScrollReveal key={m.label} delay={i * 0.05}>
              <div className="bento-card flex aspect-square flex-col justify-center p-3 sm:p-4">
                <p className="text-[11px] font-medium leading-snug text-slate-500">
                  {m.label}
                </p>
                <p className="mt-2 flex items-baseline gap-0.5">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {m.value}
                  </span>
                  <span className="text-xs font-medium text-emerald-600 sm:text-sm">
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
