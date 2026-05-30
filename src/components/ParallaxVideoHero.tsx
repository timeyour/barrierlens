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

    const showVideo = () => setVideoReady(true);
    const hideVideo = () => setVideoReady(false);

    video.addEventListener("playing", showVideo);
    video.addEventListener("error", hideVideo);

    const unbind = bindHeroVideoPlayback(video, showVideo);
    return () => {
      video.removeEventListener("playing", showVideo);
      video.removeEventListener("error", hideVideo);
      unbind();
    };
  }, []);

  const videoClassName =
    "hero-bg-video absolute inset-0 h-full w-full object-cover transition-opacity duration-700 " +
    (videoReady ? "opacity-100" : "opacity-0") +
    " object-center";

  const posterClassName =
    "absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 " +
    (videoReady ? "opacity-0" : "opacity-100");

  return (
    <header
      ref={containerRef}
      className="mobile-snap-screen mobile-snap-screen-fixed relative md:h-[160vh] lg:h-[180vh]"
    >
      <div className="relative h-[100svh] max-h-[100svh] overflow-hidden md:sticky md:top-0 md:h-screen md:max-h-none md:min-h-0">
        <div className="absolute inset-0 overflow-hidden bg-slate-950">
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
          </motion.div>

          <div className="pointer-events-none absolute inset-0 bg-slate-950/55" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-slate-950/40" />
        </div>

        <div className="relative z-10 flex h-full items-center justify-center px-4 py-20 md:px-6">
          <HeroKineticType />
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/45 md:flex"
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
