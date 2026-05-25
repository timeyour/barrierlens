"use client";

import AnchorLink from "@/components/AnchorLink";
import { HERO_VIDEO, UI_ASSETS } from "@/config/uiAssets";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import ProductPreview from "@/components/ProductPreview";

const TAGS = [
  "现场拍照",
  "AI 结构化分析",
  "风险地图",
  "证据导出",
];

export default function ParallaxVideoHero() {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const overlayDark = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 0.58, 0.72]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    void video.play().catch(() => {});
  }, []);

  return (
    <header ref={containerRef} className="relative md:h-[180vh] lg:h-[200vh]">
      <div className="relative min-h-[86svh] overflow-hidden md:sticky md:top-0 md:h-screen md:min-h-0">
        <div className="absolute inset-0 overflow-hidden">
          {/* 视频不能放在带 transform 的父级里，否则 iOS Safari 可能不渲染 */}
          <motion.video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-[50%_38%] md:object-[58%_42%] lg:object-[62%_42%]"
            style={isDesktop ? { scale: bgScale } : undefined}
            src={HERO_VIDEO}
            poster={UI_ASSETS.hero.src}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />

          <div className="absolute inset-0 md:hidden">
            <div className="absolute inset-0 bg-slate-950/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-950/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(37,99,235,0.14),transparent_55%)]" />
            <div className="noise-overlay absolute inset-0" />
          </div>

          <div className="absolute inset-0 hidden md:block">
            <motion.div
              className="absolute inset-0 bg-slate-950"
              style={{ opacity: overlayDark }}
            />
            <motion.div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/25 to-slate-950/85" />
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(37,99,235,0.3),transparent_55%)]"
              style={{ opacity: glowOpacity }}
            />
            <motion.div className="noise-overlay absolute inset-0" />
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-stretch justify-end gap-5 px-4 pb-6 pt-20 max-md:min-h-[86svh] md:h-full md:max-h-screen md:justify-center md:grid md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:items-center md:gap-6 md:pb-12 md:pt-24 md:px-6 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:gap-10 lg:pt-20">
          <div className="w-full max-w-xl md:max-w-none max-md:rounded-2xl max-md:border max-md:border-white/10 max-md:bg-slate-950/45 max-md:p-5 max-md:shadow-[0_20px_50px_rgba(2,6,23,0.35)] max-md:backdrop-blur-md">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-emerald-100 backdrop-blur-md md:mb-3 md:text-xs">
              公共空间无障碍 · 通行风险记录
            </div>
            <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-white md:text-4xl lg:text-5xl">
              无碍{" "}
              <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                BarrierLens
              </span>
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-blue-50/90 md:max-w-md md:text-lg lg:text-xl">
              <span className="md:hidden">
                拍现场、AI 归档、推动复查——把「过不去」变成可被看见的证据。
              </span>
              <span className="hidden md:inline">
                用 Gemma 4 识别盲道占用、入口受阻与通行链断点，生成可复查的现场证据
              </span>
            </p>
            <AnchorLink
              href="#tool"
              className="btn-primary mt-5 hidden items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white md:inline-flex"
            >
              开始记录
            </AnchorLink>
            <div className="mt-5 flex flex-col gap-3 md:hidden">
              <AnchorLink
                href="#tool"
                className="btn-primary inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-semibold text-white"
              >
                开始记录
              </AnchorLink>
              <AnchorLink
                href="#story"
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-white/90 backdrop-blur-sm"
              >
                了解完整闭环
              </AnchorLink>
            </div>
            <div className="mt-4 hidden flex-wrap gap-1.5 md:flex lg:mt-5 lg:gap-2">
              {TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-md lg:px-3 lg:py-1 lg:text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div
            className="pointer-events-none hidden max-h-[min(520px,calc(100vh-7rem))] items-center justify-end md:flex md:pr-2 lg:pr-4"
            aria-hidden
          >
            <ProductPreview scrollProgress={scrollYProgress} variant="hero" />
          </div>
        </div>

        <AnchorLink
          href="#story"
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-medium tracking-wide text-white/55 md:hidden"
        >
          <span>向下滑动</span>
          <span className="block h-5 w-px bg-gradient-to-b from-white/0 via-white/60 to-white/0" />
        </AnchorLink>

        <motion.div
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/60 md:flex"
          style={{ opacity: scrollHintOpacity }}
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">向下滚动 · 开始记录</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="block h-8 w-px bg-gradient-to-b from-white/0 via-white/70 to-white/0"
          />
        </motion.div>
      </div>
    </header>
  );
}
