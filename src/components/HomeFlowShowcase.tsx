"use client";

import AnchorLink from "@/components/AnchorLink";
import {
  HOME_CONTENT_RAIL,
  HOME_SURFACE_CARD_DARK,
} from "@/config/homeLayout";
import { HOME_FLOW_ASSETS } from "@/config/uiAssets";
import Image from "next/image";

const CHAIN_STEPS = [
  {
    image: HOME_FLOW_ASSETS.capture.src,
    alt: HOME_FLOW_ASSETS.capture.alt,
    title: "上传照片",
    body: "现场或演示样例",
    href: "#tool",
  },
  {
    image: HOME_FLOW_ASSETS.report.src,
    alt: HOME_FLOW_ASSETS.report.alt,
    title: "Gemma 4 结构化",
    body: "生成 JSON 证据",
    href: "#tool",
  },
  {
    image: HOME_FLOW_ASSETS.review.src,
    alt: HOME_FLOW_ASSETS.review.alt,
    title: "本地时间线",
    body: "归档与状态跟踪",
    href: "#records",
  },
  {
    image: HOME_FLOW_ASSETS.report.src,
    alt: "导出与复查示意",
    title: "导出 / 复查",
    body: "Markdown · PDF",
    href: "#records",
  },
] as const;

interface HomeFlowShowcaseProps {
  snapScreen?: boolean;
}

export default function HomeFlowShowcase({ snapScreen = true }: HomeFlowShowcaseProps) {
  const snapClass = snapScreen
    ? "mobile-snap-screen mobile-snap-screen-scroll"
    : "mobile-no-snap";

  return (
    <section
      id="story"
      aria-label="使用流程"
      data-nav-surface="dark"
      className={`${snapClass} relative z-10 scroll-mt-20 border-b border-slate-800/80 bg-slate-950`}
    >
      <div className={`${HOME_CONTENT_RAIL} py-6 md:py-8`}>
        <div className={`relative overflow-hidden ${HOME_SURFACE_CARD_DARK}`}>
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <Image
              src={HOME_FLOW_ASSETS.heroBg.src}
              alt=""
              fill
              className="object-cover object-center scale-105"
              sizes="(max-width: 768px) 100vw, 1152px"
              priority={false}
            />
            <div className="absolute inset-0 bg-slate-950/72" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/55 to-slate-950/85" />
          </div>

          <div className="relative px-5 py-6 sm:px-8 sm:py-8 md:px-10">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300/90">
              怎么用
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {CHAIN_STEPS.map((step) => (
                <AnchorLink
                  key={step.title}
                  href={step.href}
                  className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/35 backdrop-blur-sm transition hover:border-white/20"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                    <Image
                      src={step.image}
                      alt={step.alt}
                      fill
                      className="object-cover object-center transition group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 50vw, 220px"
                    />
                  </div>
                  <div className="px-3 py-3">
                    <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                    <p className="mt-0.5 text-xs text-white/60">{step.body}</p>
                  </div>
                </AnchorLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
