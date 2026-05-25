"use client";

import AnchorLink from "@/components/AnchorLink";
import { UI_ASSETS } from "@/config/uiAssets";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { getRecords } from "@/lib/recordStore";
import { useEffect, useState } from "react";

const STORY_STEPS = [
  {
    id: "blocked",
    step: "01",
    title: "这里过不去",
    body: "盲道被占、坡道受阻——单次投诉容易被忽略，但问题会反复出现。",
    accent: "text-red-600",
  },
  {
    id: "capture",
    step: "02",
    title: "拍一张，AI 帮你写清楚",
    body: "上传现场照片，Gemma 4 输出问题类型、风险等级与可传播摘要，不用自己组织长文。",
    accent: "text-blue-600",
  },
  {
    id: "archive",
    step: "03",
    title: "攒成证据链",
    body: "每条记录归档到本机时间线，按地点聚合——分散发现变成可被汇总的证据。",
    accent: "text-amber-600",
  },
  {
    id: "advocate",
    step: "04",
    title: "推动被看见",
    body: "导出倡导摘要或巡查整改单，交给物业、社区或媒体——让整改有迹可循。",
    accent: "text-emerald-600",
  },
] as const;

const SLIDE_DWELL = 4.2;
const SLIDE_FADE = 0.55;

function StoryStats() {
  const [stats, setStats] = useState({ total: 0, high: 0, pending: 0 });

  useEffect(() => {
    const sync = () => {
      const records = getRecords();
      setStats({
        total: records.length,
        high: records.filter((r) => r.riskLevel === "高").length,
        pending: records.filter((r) =>
          ["pending", "review_pending", "reported"].includes(r.reviewStatus),
        ).length,
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
    <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4">
      {[
        { label: "累计记录", value: stats.total },
        { label: "高风险", value: stats.high },
        { label: "待跟进", value: stats.pending },
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/60 bg-white/80 px-2 py-2 text-center shadow-sm backdrop-blur-sm sm:px-3"
        >
          <p className="text-base font-bold text-slate-900 sm:text-lg">{item.value}</p>
          <p className="text-[10px] text-slate-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function StoryVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={UI_ASSETS.overlay.front.src}
          alt="盲道占用示意"
          className="aspect-[16/10] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-red-950/70 via-transparent to-transparent" />
        <p className="absolute bottom-3 left-3 rounded-md bg-red-600/90 px-2 py-1 text-[11px] font-semibold text-white">
          路径状态：受阻
        </p>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-lg sm:p-4">
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-blue-300 bg-white px-3 py-2">
          <span className="h-8 w-8 shrink-0 rounded-lg bg-blue-100" />
          <span className="text-xs text-slate-600">现场照片 → 结构化 JSON</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["盲道占用", "中风险", "视障人士 / 老年人"].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-white p-3 shadow-lg sm:p-4">
        <StoryStats />
        <div className="mt-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2"
              style={{ marginLeft: `${(i - 1) * 8}px` }}
            >
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-[11px] text-slate-600">地点聚合 · 记录 #{i}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-3 shadow-lg sm:p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
        公众倡导摘要
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        「地铁口盲道被共享单车占用，视障人士通行路径中断，建议高峰时段加强巡查。」
      </p>
      <p className="mt-3 text-[11px] text-slate-500">可复制 · 可导出 Markdown</p>
    </div>
  );
}

function StoryCta({ index }: { index: number }) {
  if (index === 1) {
    return (
      <AnchorLink
        href="#tool"
        className="btn-primary mt-4 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold text-white sm:mt-5"
      >
        开始记录
      </AnchorLink>
    );
  }
  if (index === 2) {
    return (
      <AnchorLink
        href="#records"
        className="btn-secondary mt-4 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700 sm:mt-5"
      >
        查看时间线
      </AnchorLink>
    );
  }
  if (index === 3) {
    return (
      <AnchorLink
        href="#tool"
        className="btn-primary mt-4 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold text-white sm:mt-5"
      >
        生成倡导摘要
      </AnchorLink>
    );
  }
  return null;
}

export default function EvidenceStory() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const intervalMs = Math.round((SLIDE_DWELL + SLIDE_FADE) * 1000);
    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % STORY_STEPS.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  return (
    <section
      id="story"
      className="relative mb-8 scroll-mt-20 md:mb-12"
      aria-label="无碍故事线"
      aria-live="polite"
    >
      <div className="mb-4 text-center md:mb-6">
        <p className="section-eyebrow">Story</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          从「过不去」到「被看见」
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
          四步自动循环 · 看一条记录如何变成可复查、可导出的无障碍证据
        </p>
      </div>

      <div className="relative min-h-[min(480px,78vh)] overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 shadow-sm sm:min-h-[min(520px,72vh)]">
        {STORY_STEPS.map((step, index) => {
          const isActive = activeIndex === index;
          return (
          <article
            key={step.id}
            className={`absolute inset-0 flex flex-col justify-center p-4 transition-all duration-500 ease-out sm:p-6 lg:p-8 ${
              isActive
                ? "z-10 translate-y-0 opacity-100"
                : "pointer-events-none z-0 translate-y-3 opacity-0"
            }`}
            aria-hidden={!isActive}
          >
            <div className="grid items-center gap-5 lg:grid-cols-2 lg:gap-10">
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest ${step.accent}`}>
                  {step.step}
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:mt-3 lg:text-base">
                  {step.body}
                </p>
                <StoryCta index={index} />
              </div>
              <StoryVisual index={index} />
            </div>
          </article>
          );
        })}

        <div
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2"
          role="tablist"
          aria-label="故事步骤"
        >
          {STORY_STEPS.map((step, index) => (
            <span
              key={step.id}
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={step.title}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? "w-8 bg-blue-600"
                  : "w-4 bg-slate-300/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
