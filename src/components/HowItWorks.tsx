"use client";

import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";

const STEPS = [
  {
    num: "01",
    title: "上传现场照片",
    desc: "拍下盲道占用，无需专业设备",
    accent: "from-blue-500/10 to-blue-500/0",
  },
  {
    num: "02",
    title: "选择反馈对象",
    desc: "物业 / 社区 / 商场 / 城管",
    accent: "from-emerald-500/10 to-emerald-500/0",
  },
  {
    num: "03",
    title: "Gemma 4 分析",
    desc: "识别占用、评估风险、生成建议",
    accent: "from-violet-500/10 to-violet-500/0",
  },
  {
    num: "04",
    title: "复制或导出",
    desc: "一键获得可提交的专业反馈文本",
    accent: "from-amber-500/10 to-amber-500/0",
  },
];

export default function HowItWorks() {
  return (
    <ScrollReveal>
      <section className="mb-10 sm:mb-14">
        <SectionHeader
          eyebrow="How it works"
          title="四步完成无障碍反馈"
          description="像顶级 SaaS 产品一样简单 — 上传、选择、生成、提交。"
          align="center"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 0.08}>
              <div
                className={`bento-card relative overflow-hidden p-5 ${i === 0 ? "lg:col-span-1" : ""}`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${step.accent}`}
                />
                <p className="relative font-mono text-xs font-semibold text-blue-600">
                  {step.num}
                </p>
                <h3 className="relative mt-3 text-base font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="relative mt-1.5 text-sm text-slate-600">
                  {step.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
