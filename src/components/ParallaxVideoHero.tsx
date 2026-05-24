"use client";

import { HERO_VIDEO } from "@/config/uiAssets";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ProductPreview from "@/components/ProductPreview";

const TAGS = [
  "Gemma 4 · 核心模型",
  "赛道 D · Social Good",
  "Multimodal Vision",
  "Citizen Evidence",
];

export default function ParallaxVideoHero() {
  const containerRef = useRef<HTMLElement>(null);
  const isMobile = useMediaQuery("(max-width: 767px)", true);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const textY = useTransform(scrollYProgress, [0, 0.85], [0, -140]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const overlayDark = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 0.58, 0.72]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <header ref={containerRef} className="relative md:h-[180vh] lg:h-[200vh]">
      <motion.div className="relative overflow-hidden md:sticky md:top-0 md:h-screen">
        {/* 手机：静态深色背景 */}
        <div className="absolute inset-0 md:hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(37,99,235,0.32),transparent_62%)]" />
          <div className="noise-overlay absolute inset-0" />
        </div>

        {/* 桌面：用户剪辑盲道占用现场视频循环 */}
        <motion.div
          className="absolute inset-0 hidden overflow-hidden md:block"
          style={{ scale: bgScale }}
        >
          <video
            className="absolute inset-0 h-full w-full object-cover object-[58%_42%] lg:object-[62%_42%]"
            src={HERO_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />
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
        </motion.div>

        <motion.div className="relative mx-auto flex w-full max-w-6xl flex-col items-stretch justify-center gap-5 px-4 pb-8 pt-[4.75rem] md:h-full md:max-h-screen md:grid md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:items-center md:gap-6 md:pb-12 md:pt-24 md:px-6 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:gap-10 lg:pt-20">
          <motion.div
            className="w-full max-w-xl md:max-w-none"
            style={isMobile ? undefined : { y: textY, opacity: textOpacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-emerald-100 backdrop-blur-md md:mb-3 md:text-xs"
            >
              <span className="md:hidden">赛道 D · 无障碍记录</span>
              <span className="hidden md:inline">Gemma 4 开发者大赛 2026 · 赛道 D</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-[1.75rem] font-bold leading-[1.12] tracking-tight text-white sm:text-5xl md:text-4xl lg:text-5xl"
            >
              无碍{" "}
              <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                BarrierLens
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 text-[15px] leading-relaxed text-blue-50/95 md:mt-3 md:max-w-md md:text-lg lg:text-xl"
            >
              <span className="md:hidden">记录盲道占用，归档证据，推动问题被看见</span>
              <span className="hidden md:inline">
                用 Gemma 4 记录盲道占用 · 归档证据 · 推动无障碍被看见
              </span>
            </motion.p>
            <a
              href="#tool"
              className="btn-primary mt-5 hidden items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white md:inline-flex"
            >
              开始记录
            </a>
            <a
              href="#tool"
              className="btn-primary mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-semibold text-white md:hidden"
            >
              开始记录
            </a>
            <p className="mt-3 text-center text-[11px] text-slate-400 md:hidden">
              上传现场照片 · AI 结构化归档
            </p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-4 hidden flex-wrap gap-1.5 md:flex lg:mt-5 lg:gap-2"
            >
              {TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-md lg:px-3 lg:py-1 lg:text-xs"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>
          <motion.div
            className="pointer-events-none hidden max-h-[min(520px,calc(100vh-7rem))] items-center justify-end md:flex md:pr-2 lg:pr-4"
            aria-hidden
          >
            <ProductPreview scrollProgress={scrollYProgress} variant="hero" />
          </motion.div>
        </motion.div>

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
      </motion.div>
    </header>
  );
}
