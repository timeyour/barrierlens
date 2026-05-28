"use client";

import EvidenceStory from "@/components/EvidenceStory";
import V2ScenarioCards from "@/components/V2ScenarioCards";

/** 预览分支：把叙事收进折叠区，工具区成为首屏主路径 */
export default function StoryFold() {
  return (
    <details id="story" className="tool-card group mt-16 overflow-hidden scroll-mt-20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 marker:content-none sm:px-8">
        <div>
          <p className="section-eyebrow text-slate-500">背景 · 可选阅读</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            了解完整闭环与典型场景
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium text-slate-500 transition group-open:rotate-180">
          展开
        </span>
      </summary>
      <div className="border-t border-slate-200/80 bg-slate-50/40 px-4 py-6 sm:px-6">
        <EvidenceStory />
        <div className="mt-6">
          <V2ScenarioCards embedded />
        </div>
      </div>
    </details>
  );
}
