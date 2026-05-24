"use client";

import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";

const STEPS = [
  {
    num: "01",
    title: "拍照上传",
    desc: "记录盲道占用等现场情况",
    accent: "from-blue-500/15 to-blue-500/0",
    icon: "📷",
  },
  {
    num: "02",
    title: "标注地点与模式",
    desc: "公众记录 或 物业自查",
    accent: "from-emerald-500/15 to-emerald-500/0",
    icon: "📍",
  },
  {
    num: "03",
    title: "Gemma 4 分析",
    desc: "结构化标注风险、影响与建议",
    accent: "from-violet-500/15 to-violet-500/0",
    icon: "✨",
  },
  {
    num: "04",
    title: "归档与导出",
    desc: "写入时间线，导出倡导摘要或整改单",
    accent: "from-amber-500/15 to-amber-500/0",
    icon: "📋",
  },
];

export default function HowItWorks() {
  return (
    <ScrollReveal>
      <section className="mb-10 sm:mb-14">
        <SectionHeader
          eyebrow="How it works"
          title="四步完成问题记录"
          description="不是替你去投诉，而是让问题被看见、被记录、可被汇总。"
          align="center"
        />
        <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 0.08} className="h-full">
              <div className="bento-card relative flex h-full min-h-[168px] flex-col overflow-hidden p-4 sm:p-5">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${step.accent}`}
                />
                <div
                  className="relative mb-3 flex aspect-square w-12 shrink-0 items-center justify-center rounded-xl bg-white/80 text-xl shadow-sm ring-1 ring-slate-200/80"
                  aria-hidden
                >
                  {step.icon}
                </div>
                <p className="relative font-mono text-xs font-semibold text-blue-600">
                  {step.num}
                </p>
                <h3 className="relative mt-2 text-base font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="relative mt-1.5 flex-1 text-sm leading-snug text-slate-600">
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
