"use client";

import CompareSlider from "@/components/CompareSlider";
import SectionHeader from "@/components/SectionHeader";
import { ILLUSTRATION_NOTE } from "@/config/imageDisplay";
import ScrollReveal from "@/components/ScrollReveal";

export default function OverlayShowcase() {
  return (
    <ScrollReveal>
      <section className="glass-card overflow-hidden p-4 sm:p-6 lg:p-8">
        {/* 手机：精简文案 + 折叠对比图 */}
        <div className="md:hidden">
          <SectionHeader
            eyebrow="Problem"
            title="为什么需要记录？"
            description="单次反馈可能被忽略，归档后才有可被汇总的证据。"
          />
          <details className="mt-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">
              查看盲道畅通 / 占用对比示意
            </summary>
            <div className="border-t border-slate-200/80 p-3">
              <CompareSlider />
              <p className="mt-2 text-[11px] text-slate-400">{ILLUSTRATION_NOTE}</p>
            </div>
          </details>
        </div>

        {/* 桌面：保持原双栏布局 */}
        <div className="hidden gap-8 md:grid lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Problem"
              title="为什么需要记录？"
              description="微信发图可以提醒一次，但问题被忽略后，往往没有留下可被汇总的证据。"
            />
            <p className="-mt-4 rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 px-4 py-3 text-sm font-medium text-blue-900 ring-1 ring-blue-100">
              单次反馈可能被忽略，但每一条被归档的记录，都在推动问题被看见。
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              公众记录 → 倡导摘要 · 物业自查 → 内部整改单 · 本地时间线汇总
            </p>
            <p className="mt-2 text-[11px] text-slate-400">{ILLUSTRATION_NOTE}</p>
          </div>
          <CompareSlider />
        </div>
      </section>
    </ScrollReveal>
  );
}
