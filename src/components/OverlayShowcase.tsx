"use client";

import CompareSlider from "@/components/CompareSlider";
import SectionHeader from "@/components/SectionHeader";
import { ILLUSTRATION_NOTE } from "@/config/imageDisplay";
import ScrollReveal from "@/components/ScrollReveal";

export default function OverlayShowcase() {
  return (
    <ScrollReveal>
      <section className="glass-card overflow-hidden p-4 sm:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Problem"
              title="为什么需要无碍？"
              description="很多人看到无障碍问题，但不知道怎么描述、归谁管、怎么反馈。"
            />
            <p className="-mt-4 rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 px-4 py-3 text-sm font-medium text-blue-900 ring-1 ring-blue-100">
              我们把公众表达转成治理语言。
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              「这里过不去」→「盲道连续性被占用物阻断，影响视障人士安全通行…」
            </p>
            <p className="mt-2 text-[11px] text-slate-400">{ILLUSTRATION_NOTE}</p>
          </div>
          <CompareSlider />
        </div>
      </section>
    </ScrollReveal>
  );
}
