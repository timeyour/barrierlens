"use client";

import { useEffect, useRef, useState } from "react";
import AssetImage from "@/components/AssetImage";
import Interactive3DScene from "./Interactive3DScene";
import { HERO_IMAGE_CLASS } from "@/config/imageDisplay";
import { UI_ASSETS } from "@/config/uiAssets";

const TAGS = [
  "Gemma 4 Hackathon",
  "AI for Social Good",
  "Accessibility Feedback",
];

const VIDEO_SRC =
  "https://videos.pexels.com/video-files/855414/855414-sd_640_360_30fps.mp4";

export default function ParallaxVideoHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { hero } = UI_ASSETS;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (isMobile) setVideoFailed(true);
  }, [isMobile]);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || !videoReady || videoFailed || isMobile) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      video.pause();
      return;
    }

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrollRange = section.offsetHeight - window.innerHeight;
      if (scrollRange <= 0 || !video.duration) return;

      const progress = Math.min(1, Math.max(0, -rect.top / scrollRange));
      if (Math.abs(video.currentTime - progress * video.duration) > 0.08) {
        video.currentTime = progress * video.duration;
      }
    };

    const onLoaded = () => {
      video.pause();
      onScroll();
    };

    video.addEventListener("loadedmetadata", onLoaded);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      window.removeEventListener("scroll", onScroll);
    };
  }, [videoReady, videoFailed, isMobile]);

  const showVideo = videoReady && !videoFailed && !isMobile;

  return (
    <header
      ref={sectionRef}
      className="relative min-h-[72vh] overflow-hidden border-b border-blue-900/20 sm:min-h-[88vh] lg:min-h-[92vh]"
    >
      <div className="absolute inset-0">
        <AssetImage
          src={hero.src}
          fallback={hero.fallback}
          alt={hero.alt}
          fill
          className={HERO_IMAGE_CLASS}
          priority
        />
        {!isMobile && !videoFailed && (
          <video
            ref={videoRef}
            className={`hero-video absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              showVideo ? "opacity-100" : "opacity-0"
            }`}
            src={VIDEO_SRC}
            muted
            playsInline
            preload="metadata"
            onLoadedData={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/45 to-slate-950/85 sm:from-slate-950/70 sm:via-blue-950/55 sm:to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,rgba(37,99,235,0.25),transparent_60%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-4 pb-10 pt-24 sm:min-h-[88vh] sm:justify-center sm:px-6 sm:py-16 lg:min-h-[92vh] lg:flex-row lg:items-center lg:gap-12 lg:pb-16">
        <div className="max-w-2xl animate-fade-up">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-100 backdrop-blur-sm sm:mb-4 sm:text-xs">
            Gemma 4 开发者大赛 2026 · 赛道 D
          </div>
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            无碍{" "}
            <span className="bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">
              BarrierLens
            </span>
          </h1>
          <p className="mt-3 text-base leading-snug text-blue-50 sm:mt-4 sm:text-xl">
            让无障碍问题被看见、被记录、被反馈
          </p>
          <p className="mt-1.5 text-xs text-slate-300 sm:mt-2 sm:text-sm">
            基于 Gemma 4 的公众无障碍反馈生成工具
          </p>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-6 sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md sm:text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden animate-fade-up-delayed lg:flex lg:shrink-0">
          <Interactive3DScene />
        </div>
      </div>
    </header>
  );
}
