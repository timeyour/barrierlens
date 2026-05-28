"use client";

import AnchorLink from "@/components/AnchorLink";
import ProductPreview from "@/components/ProductPreview";
import { useLayoutEffect } from "react";

const STEPS = [
  { title: "拍照上传", desc: "现场或样例图" },
  { title: "AI 结构化", desc: "Gemma 4 多模态" },
  { title: "本机归档", desc: "可复查可导出" },
];

export default function OptimusHero() {
  useLayoutEffect(() => {
    document.documentElement.dataset.hero = "light";
    window.dispatchEvent(new Event("hero-theme-change"));
    return () => {
      delete document.documentElement.dataset.hero;
      window.dispatchEvent(new Event("hero-theme-change"));
    };
  }, []);

  return (
    <header className="mobile-snap-screen relative overflow-hidden border-b border-slate-200/80 bg-[#f7f8fb]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="page-grid absolute inset-0 opacity-70" />
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-blue-500/[0.07] blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-slate-400/[0.08] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:pb-20 lg:pt-32">
        <div className="lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-12 xl:gap-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Track D · 无障碍通行风险记录
            </div>

            <h1 className="mt-5 text-[2rem] font-semibold leading-[1.06] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.25rem]">
              把现场照片，
              <br />
              <span className="text-blue-700">变成可跟进的证据</span>
            </h1>

            <p className="mt-4 max-w-[55ch] text-base leading-relaxed text-slate-600 sm:text-[17px]">
              无碍 BarrierLens 用 Gemma 4 识别盲道占用与通行链断点，生成结构化报告并保存在本机时间线——不必懂规范，也能把「过不去」记录清楚。
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <AnchorLink
                href="#tool"
                className="btn-primary inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold"
              >
                开始记录
              </AnchorLink>
              <AnchorLink
                href="#story"
                className="inline-flex items-center justify-center text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
              >
                了解完整闭环
              </AnchorLink>
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-200 pt-6 sm:max-w-md">
              {STEPS.map((step) => (
                <div key={step.title}>
                  <dt className="text-xs font-semibold text-slate-900">{step.title}</dt>
                  <dd className="mt-0.5 text-[11px] text-slate-500">{step.desc}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mt-10 flex justify-center lg:mt-0 lg:justify-end">
            <div className="relative w-full max-w-[320px] sm:max-w-[360px]">
              <div className="absolute -inset-3 rounded-[2rem] border border-slate-200/80 bg-white/70 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)] backdrop-blur-sm" />
              <div className="relative flex justify-center p-4 sm:p-5">
                <ProductPreview variant="hero" className="relative mx-0 aspect-[9/19.5] h-[min(440px,62vh)] w-auto shrink-0 sm:h-[min(480px,64vh)]" />
              </div>

              <div className="absolute -left-2 top-8 hidden rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg sm:block lg:-left-8">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  分析来源
                </p>
                <p className="text-xs font-semibold text-slate-900">Gemma 4</p>
              </div>
              <div className="absolute -right-1 bottom-16 hidden rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg sm:block lg:-right-6">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  默认存储
                </p>
                <p className="text-xs font-semibold text-slate-900">本机时间线</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
