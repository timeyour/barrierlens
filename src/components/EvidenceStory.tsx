"use client";

import AnchorLink from "@/components/AnchorLink";
import { UI_ASSETS } from "@/config/uiAssets";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { migrateLegacyReviewStatus } from "@/lib/ledgerStatus";
import { getRecords } from "@/lib/recordStore";
import { useEffect, useState } from "react";

const STORY_STEPS = [
  {
    id: "blocked",
    step: "01",
    title: "过不去",
    body: "盲道被占、坡道受阻。",
    accent: "text-red-600",
  },
  {
    id: "capture",
    step: "02",
    title: "拍一张",
    body: "AI 帮你写清楚。",
    accent: "text-blue-600",
  },
  {
    id: "archive",
    step: "03",
    title: "存下来",
    body: "本机时间线归档。",
    accent: "text-amber-600",
  },
  {
    id: "advocate",
    step: "04",
    title: "递出去",
    body: "导出 · 跟进 · 复拍。",
    accent: "text-emerald-600",
  },
] as const;

const SLIDE_DWELL = 4.2;
const SLIDE_FADE = 0.55;

function StoryStats({ compact = false }: { compact?: boolean }) {
  const [stats, setStats] = useState({ total: 0, high: 0, pending: 0 });

  useEffect(() => {
    const sync = () => {
      const records = getRecords();
      setStats({
        total: records.length,
        high: records.filter((r) => r.riskLevel === "高").length,
        pending: records.filter((r) => {
          const status = migrateLegacyReviewStatus(r.reviewStatus);
          return status === "pending_verification" || status === "pending_remediation";
        }).length,
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
    <div className={`grid grid-cols-3 gap-1.5 ${compact ? "" : "mt-3 gap-2 sm:mt-4"}`}>
      {[
        { label: "累计记录", value: stats.total },
        { label: "高风险", value: stats.high },
        { label: "待跟进", value: stats.pending },
      ].map((item) => (
        <div
          key={item.label}
          className={`rounded-xl border border-white/60 bg-white/80 text-center shadow-sm backdrop-blur-sm ${
            compact ? "px-1.5 py-1.5" : "px-2 py-2 sm:px-3"
          }`}
        >
          <p className={`font-bold text-slate-900 ${compact ? "text-sm" : "text-base sm:text-lg"}`}>
            {item.value}
          </p>
          <p className="text-[9px] text-slate-500 sm:text-[10px]">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function StoryVisual({ index, compact = false }: { index: number; compact?: boolean }) {
  if (index === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={UI_ASSETS.overlay.front.src}
          alt="盲道占用示意"
          className={`w-full object-cover ${compact ? "aspect-[16/9] max-h-36" : "aspect-[16/10]"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-red-950/70 via-transparent to-transparent" />
        <p className="absolute bottom-2 left-2 rounded-md bg-red-600/90 px-2 py-1 text-[10px] font-semibold text-white sm:bottom-3 sm:left-3 sm:text-[11px]">
          路径状态：受阻
        </p>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div
        className={`rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg ${
          compact ? "p-2.5" : "p-3 sm:p-4"
        }`}
      >
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-blue-300 bg-white px-3 py-2">
          <span className={`shrink-0 rounded-lg bg-blue-100 ${compact ? "h-6 w-6" : "h-8 w-8"}`} />
          <span className="text-[11px] text-slate-600 sm:text-xs">现场照片 → 结构化 JSON</span>
        </div>
        <div className={`flex flex-wrap gap-1.5 ${compact ? "mt-2" : "mt-3 gap-2"}`}>
          {["盲道占用", "中风险", "视障人士 / 老年人"].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 sm:px-2.5 sm:py-1 sm:text-[11px]"
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
      <div
        className={`rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-white shadow-lg ${
          compact ? "p-2.5" : "p-3 sm:p-4"
        }`}
      >
        <StoryStats compact={compact} />
        {!compact && (
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
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-lg ${
        compact ? "p-2.5" : "p-3 sm:p-4"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 sm:text-[11px]">
        公众倡导摘要
      </p>
      <p className={`mt-2 leading-relaxed text-slate-700 ${compact ? "text-xs" : "text-sm"}`}>
        「地铁口盲道被共享单车占用，视障人士通行路径中断，建议高峰时段加强巡查。」
      </p>
      <p className="mt-2 text-[10px] text-slate-500 sm:mt-3 sm:text-[11px]">可复制 · 可导出 PDF</p>
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
        生成摘要
      </AnchorLink>
    );
  }
  return null;
}

export default function EvidenceStory({
  compact: compactProp,
  className = "",
}: {
  compact?: boolean;
  className?: string;
} = {}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const compact = compactProp ?? isMobile;

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
      className={`relative scroll-mt-20 ${compact ? "mb-0" : "mb-8 md:mb-12"} ${className}`}
      aria-label="无碍故事线"
      aria-live="polite"
    >
      <div className={`text-center ${compact ? "mb-2" : "mb-4 md:mb-6"}`}>
        <h2
          className={`font-bold tracking-tight text-slate-900 ${
            compact ? "text-xl" : "text-2xl sm:text-3xl"
          }`}
        >
          拍 · 存 · 递
        </h2>
      </div>

      <div
        className={`relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 shadow-sm ${
          compact
            ? "min-h-[min(380px,48svh)]"
            : "min-h-[min(440px,62vh)] sm:min-h-[min(480px,58vh)]"
        }`}
      >
        {STORY_STEPS.map((step, index) => {
          const isActive = activeIndex === index;
          if (!isActive) return null;
          return (
          <article
            key={`${step.id}-${activeIndex}`}
            className="story-slide-enter absolute inset-0 z-10 flex flex-col justify-center p-4 sm:p-6 lg:p-8"
            aria-hidden={false}
          >
            <div
              className={
                compact
                  ? "flex flex-col gap-3"
                  : "grid items-center gap-5 lg:grid-cols-2 lg:gap-10"
              }
            >
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest ${step.accent}`}>
                  {step.step}
                </p>
                <h3
                  className={`mt-1.5 font-bold text-slate-900 ${
                    compact ? "text-base" : "text-xl sm:text-2xl lg:text-3xl"
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`mt-1.5 leading-relaxed text-slate-600 ${
                    compact ? "text-xs" : "text-sm sm:mt-3 lg:text-base"
                  }`}
                >
                  {step.body}
                </p>
                {!compact && <StoryCta index={index} />}
              </div>
              <StoryVisual index={index} compact={compact} />
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
