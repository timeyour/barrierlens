"use client";

import AnchorLink from "@/components/AnchorLink";
import { HERO_POSTER, HERO_VIDEO } from "@/config/uiAssets";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  bindHeroVideoPlayback,
  isWeChatBrowser,
} from "@/lib/weChatVideo";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import ProductPreview from "@/components/ProductPreview";

const TAGS = ["现场拍照", "AI 结构化分析", "证据归档", "合规导出"];

export default function ParallaxVideoHero() {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [videoReady, setVideoReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], isDesktop ? [1, 1.06] : [1, 1]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useLayoutEffect(() => {
    posterRef.current?.classList.toggle("hero-poster-wechat", isWeChatBrowser());
    const video = videoRef.current;
    if (!video) return;
    return bindHeroVideoPlayback(video, () => setVideoReady(true));
  }, []);

  const videoClassName =
    "hero-bg-video absolute inset-0 h-full w-full object-cover transition-opacity duration-700 " +
    (videoReady ? "opacity-100" : "opacity-0") +
    (isDesktop ? " object-[58%_42%] lg:object-[62%_42%]" : " object-[50%_32%]");

  const posterClassName =
    "absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 " +
    (videoReady ? "opacity-0" : "opacity-100");

  return (
    <header
      ref={containerRef}
      className="mobile-snap-screen mobile-snap-screen-fixed relative md:h-[180vh] lg:h-[200vh]"
    >
      <div className="relative h-[100svh] max-h-[100svh] overflow-hidden md:sticky md:top-0 md:h-screen md:max-h-none md:min-h-0">
        <div className="absolute inset-0 overflow-hidden bg-slate-950">
          {/* 加载占位：不用 <video poster>，避免微信 X5 一直显示静态图 */}
          <div
            ref={posterRef}
            aria-hidden
            className={posterClassName}
            style={{ backgroundImage: `url(${HERO_POSTER})` }}
          />

          <motion.div className="absolute inset-0 overflow-hidden" style={{ scale: bgScale }}>
            <video
              ref={videoRef}
              className={videoClassName}
              src={HERO_VIDEO}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disableRemotePlayback
              aria-hidden
              tabIndex={-1}
            />
          </motion.div>

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
            <div className="absolute inset-0 hidden bg-gradient-to-r from-slate-950/45 via-slate-950/10 to-transparent md:block" />
          </div>
        </div>

        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col justify-end px-4 pb-10 pt-20 max-md:pb-10 md:max-h-screen md:justify-center md:px-6 md:pb-12 md:pt-24 lg:pt-20">
          <div className="md:grid md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:items-center md:gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:gap-10">
            <div className="hero-copy w-full md:max-w-none">
              <div className="hero-tag mb-3 inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold text-blue-200 md:text-xs">
                公共空间无障碍 · 通行风险记录
              </div>
              <h1 className="text-[2rem] font-semibold leading-[1.08] tracking-tight text-white md:text-4xl lg:text-[2.65rem]">
                无碍 <span className="text-blue-100">BarrierLens</span>
              </h1>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/88 md:text-[17px]">
                不必懂规范条文——拍现场、AI 写清楚、本机留证据，把通行受阻变成可跟进的记录。
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <AnchorLink
                  href="#tool"
                  className="btn-primary inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-semibold sm:w-auto sm:px-6"
                >
                  开始记录
                </AnchorLink>
                <AnchorLink
                  href="#story"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/35 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/20 sm:w-auto"
                >
                  了解完整闭环
                </AnchorLink>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5 lg:mt-5 lg:gap-2">
                {TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="hero-tag px-2.5 py-0.5 text-[11px] font-medium text-white/90 lg:px-3 lg:py-1 lg:text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="mt-4 text-center text-[10px] font-medium tracking-wide text-white/50 md:hidden">
                向下滑动
                <span className="mx-auto mt-1 block h-4 w-px bg-gradient-to-b from-transparent via-white/40 to-transparent" />
              </p>
            </div>

            <div
              className="pointer-events-none mt-6 hidden max-h-[min(480px,calc(100vh-8rem))] items-center justify-end md:mt-0 md:flex md:pr-2 lg:pr-4"
              aria-hidden
            >
              <div className="rounded-2xl border border-white/15 bg-white/5 p-2 shadow-2xl shadow-black/20 backdrop-blur-sm">
                <ProductPreview scrollProgress={scrollYProgress} variant="hero" />
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/70 md:flex"
          style={{ opacity: scrollHintOpacity }}
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">向下滚动 · 开始记录</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="block h-8 w-px bg-gradient-to-b from-transparent via-white/60 to-transparent"
          />
        </motion.div>
      </div>
    </header>
  );
}
