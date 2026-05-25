"use client";

import AnchorLink from "@/components/AnchorLink";
import { HERO_VIDEO } from "@/config/uiAssets";
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
    video.defaultMuted = true;
    video.playsInline = true;
    video.controls = false;
    video.disablePictureInPicture = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("x5-playsinline", "");
    video.setAttribute("x5-video-player-type", "h5-page");

    const tryPlay = () => {
      void video.play().catch(() => {});
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("loadeddata", tryPlay);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) tryPlay();
      },
      { threshold: 0.2 },
    );
    observer.observe(video);

    const onFirstTouch = () => tryPlay();
    document.addEventListener("touchstart", onFirstTouch, { once: true, passive: true });
    document.addEventListener("visibilitychange", tryPlay);

    return () => {
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("loadeddata", tryPlay);
      observer.disconnect();
      document.removeEventListener("touchstart", onFirstTouch);
      document.removeEventListener("visibilitychange", tryPlay);
    };
  }, [isDesktop]);

  const videoClassName =
    "hero-bg-video absolute inset-0 h-full w-full object-cover " +
    (isDesktop ? "object-[58%_42%] lg:object-[62%_42%]" : "object-[50%_32%]");

  return (
    <header
      ref={containerRef}
      className="mobile-snap-screen mobile-snap-screen-fixed relative md:h-[180vh] lg:h-[200vh]"
    >
      <div className="relative h-[100svh] max-h-[100svh] overflow-hidden md:sticky md:top-0 md:h-screen md:max-h-none md:min-h-0">
        <div className="absolute inset-0 overflow-hidden">
          {isDesktop ? (
            <motion.div
              className="absolute inset-0 overflow-hidden"
              style={{ scale: bgScale }}
            >
              <video
                ref={videoRef}
                className={videoClassName}
                src={HERO_VIDEO}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden
                tabIndex={-1}
              />
            </motion.div>
          ) : (
            <video
              ref={videoRef}
              className={videoClassName}
              src={HERO_VIDEO}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden
              tabIndex={-1}
            />
          )}

          <div className="pointer-events-none absolute inset-0">
            {isDesktop ? (
              <>
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
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-slate-950/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-950/25 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(37,99,235,0.12),transparent_50%)]" />
              </>
            )}
            <div className="noise-overlay absolute inset-0" />
          </div>
        </div>

        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col items-stretch justify-end gap-5 px-4 pb-10 pt-20 max-md:pb-12 md:max-h-screen md:justify-center md:grid md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:items-center md:gap-6 md:pb-12 md:pt-24 md:px-6 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:gap-10 lg:pt-20">
          <div className="w-full max-w-xl md:max-w-none">
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
              <p className="pt-1 text-center text-[10px] font-medium tracking-wide text-white/50">
                向下滑动
                <span className="mx-auto mt-1 block h-4 w-px bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
              </p>
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
