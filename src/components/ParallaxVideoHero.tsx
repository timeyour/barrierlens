"use client";

import AssetImage from "@/components/AssetImage";
import ProductPreview from "@/components/ProductPreview";
import { HERO_IMAGE_CLASS } from "@/config/imageDisplay";
import { UI_ASSETS } from "@/config/uiAssets";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const TAGS = [
  "Gemma 4 Hackathon",
  "AI for Social Good",
  "Accessibility Feedback",
];

export default function ParallaxVideoHero() {
  const containerRef = useRef<HTMLElement>(null);
  const { overlay } = UI_ASSETS;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const clearOpacity = useTransform(scrollYProgress, [0, 0.45, 0.75], [1, 0.35, 0]);
  const blockedOpacity = useTransform(scrollYProgress, [0.25, 0.55, 1], [0, 0.65, 1]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const textY = useTransform(scrollYProgress, [0, 0.85], [0, -140]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const overlayDark = useTransform(scrollYProgress, [0, 0.5, 1], [0.45, 0.55, 0.72]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <header ref={containerRef} className="relative h-[180vh] sm:h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ scale: bgScale }}
        >
          <motion.div className="absolute inset-0" style={{ opacity: clearOpacity }}>
            <AssetImage
              src={overlay.back.src}
              fallback={overlay.back.fallback}
              alt={overlay.back.alt}
              fill
              className={HERO_IMAGE_CLASS}
              priority
            />
          </motion.div>
          <motion.div className="absolute inset-0" style={{ opacity: blockedOpacity }}>
            <AssetImage
              src={overlay.front.src}
              fallback={overlay.front.fallback}
              alt={overlay.front.alt}
              fill
              className={HERO_IMAGE_CLASS}
              priority
            />
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-slate-950"
            style={{ opacity: overlayDark }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/90" />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(37,99,235,0.35),transparent_55%)]"
            style={{ opacity: glowOpacity }}
          />
          <div className="noise-overlay absolute inset-0" />
        </motion.div>

        <div className="relative mx-auto flex h-full max-w-6xl items-end px-4 pb-20 pt-28 sm:items-center sm:px-6 sm:pb-16 sm:pt-16 lg:gap-10">
          {/* 左侧文案 — 单独淡出 */}
          <motion.div
            className="max-w-xl flex-1 lg:max-w-2xl"
            style={{ y: textY, opacity: textOpacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-emerald-100 backdrop-blur-md sm:text-xs"
            >
              Gemma 4 开发者大赛 2026 · 赛道 D
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-[2rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
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
              className="mt-3 text-base text-blue-50/95 sm:mt-4 sm:text-xl"
            >
              让无障碍问题被看见、被记录、被反馈
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-2 text-xs text-slate-300 sm:text-sm"
            >
              向下滚动 · 见证盲道从畅通到占用
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-5 hidden flex-wrap gap-2 sm:flex"
            >
              {TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* 手机预览 — 独立动画，小屏隐藏避免挤压 */}
          <div className="hidden sm:block">
            <ProductPreview scrollProgress={scrollYProgress} />
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60"
          style={{ opacity: scrollHintOpacity }}
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
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
