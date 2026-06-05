"use client";

import HeroKineticType from "@/components/HeroKineticType";
import { HERO_POSTER, HERO_VIDEO } from "@/config/uiAssets";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  bindHeroVideoPlayback,
  isWeChatBrowser,
} from "@/lib/weChatVideo";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";

type HeroVariant = "full" | "workbench";

interface ParallaxVideoHeroProps {
  /** workbench：短头图 + 背景视频，不 sticky，不挡 #tool 表单 */
  variant?: HeroVariant;
  /** mixed 首页：占满首屏 100svh，不拉 160vh 视差轨道 */
  singleViewport?: boolean;
}

function HeroVideoLayer({ overlayClassName = "bg-slate-950/55" }: { overlayClassName?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useLayoutEffect(() => {
    posterRef.current?.classList.toggle("hero-poster-wechat", isWeChatBrowser());
    const video = videoRef.current;
    if (!video) return;

    const showVideo = () => setVideoReady(true);
    const hideVideo = () => setVideoReady(false);

    const markReady = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        showVideo();
      }
    };

    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", markReady);
    video.addEventListener("playing", showVideo);
    video.addEventListener("error", hideVideo);

    const unbind = bindHeroVideoPlayback(video, showVideo);
    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("playing", showVideo);
      video.removeEventListener("error", hideVideo);
      unbind();
    };
  }, []);

  const posterClassName =
    "absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 " +
    (videoReady ? "opacity-0" : "opacity-100");

  const videoClassName =
    "hero-bg-video absolute inset-0 h-full w-full object-cover transition-opacity duration-500 " +
    (videoReady ? "opacity-100" : "opacity-0") +
    " object-center";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-slate-950">
      <div
        ref={posterRef}
        aria-hidden
        className={posterClassName}
        style={{ backgroundImage: `url(${HERO_POSTER})` }}
      />
      <video
        ref={videoRef}
        className={videoClassName}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disableRemotePlayback
        aria-hidden
        tabIndex={-1}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <div className={`pointer-events-none absolute inset-0 ${overlayClassName}`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-slate-950/40" />
    </div>
  );
}

function WorkbenchHero() {
  return (
    <header className="mobile-no-snap relative z-0 overflow-hidden border-b border-white/10 bg-slate-950">
      <div className="relative min-h-[42svh] sm:min-h-[46svh] md:min-h-[50vh]">
        <HeroVideoLayer overlayClassName="bg-slate-950/65" />
        <div className="pointer-events-none relative z-10 flex min-h-[42svh] items-center justify-center px-4 py-14 sm:min-h-[46svh] sm:py-16 md:min-h-[50vh] md:py-20">
          <div className="pointer-events-auto mx-auto max-w-3xl">
            <HeroKineticType />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function ParallaxVideoHero({
  variant = "full",
  singleViewport = false,
}: ParallaxVideoHeroProps) {
  if (variant === "workbench") {
    return <WorkbenchHero />;
  }

  return <FullParallaxHero singleViewport={singleViewport} />;
}

function FullParallaxHero({ singleViewport = false }: { singleViewport?: boolean }) {
  const containerRef = useRef<HTMLElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], isDesktop ? [1, 1.06] : [1, 1]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  if (singleViewport) {
    return (
      <header className="mobile-no-snap relative z-0 h-[100svh] min-h-[100svh] max-h-[100svh] overflow-hidden" data-nav-surface="hero">
        <HeroVideoLayer />
        <div className="pointer-events-none relative z-10 flex h-full items-center justify-center px-4 py-20 md:px-6">
          <div className="pointer-events-auto">
            <HeroKineticType />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      ref={containerRef}
      className="mobile-snap-screen mobile-snap-screen-fixed relative z-0 md:h-[160vh] lg:h-[180vh]"
      data-nav-surface="hero"
    >
      <div className="relative h-[100svh] max-h-[100svh] overflow-hidden pointer-events-none md:sticky md:top-0 md:h-screen md:max-h-none md:min-h-0">
        <motion.div className="absolute inset-0 overflow-hidden" style={{ scale: bgScale }}>
          <HeroVideoLayer />
        </motion.div>

        <div className="pointer-events-none relative z-10 flex h-full items-center justify-center px-4 py-20 md:px-6">
          <div className="pointer-events-auto">
            <HeroKineticType />
          </div>
        </div>

        <motion.div
          className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/45 md:flex"
          style={{ opacity: scrollHintOpacity }}
        >
          <span className="text-[10px] uppercase tracking-[0.28em]">scroll</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="block h-8 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent"
          />
        </motion.div>
      </div>
    </header>
  );
}
