"use client";

import { useEffect, useRef } from "react";
import AssetImage from "@/components/AssetImage";
import { UI_ASSETS } from "@/config/uiAssets";
import { SCENE_IMAGE_CLASS, ILLUSTRATION_NOTE } from "@/config/imageDisplay";

function SceneBadge({
  label,
  variant,
}: {
  label: string;
  variant: "clear" | "blocked";
}) {
  return (
    <span
      className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-md sm:left-3 sm:top-3 sm:px-3 sm:text-xs ${
        variant === "clear" ? "bg-emerald-500" : "bg-red-500"
      }`}
    >
      {label}
    </span>
  );
}

export default function OverlayShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const onScroll = () => {
      if (window.innerWidth < 1024) return;

      const rect = section.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(0, 1 - rect.top / (window.innerHeight * 0.8)),
      );

      if (backRef.current) {
        const y = prefersReduced ? 0 : progress * 20 - 10;
        backRef.current.style.transform = `translateY(${y}px) scale(1.03)`;
      }
      if (frontRef.current) {
        const y = prefersReduced ? 0 : progress * -28 + 14;
        const rotate = prefersReduced ? 0 : progress * 1.5 - 0.75;
        frontRef.current.style.transform = `translateY(${y}px) rotate(${rotate}deg)`;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const { back, front } = UI_ASSETS.overlay;

  return (
    <section
      ref={sectionRef}
      className="mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40 sm:mb-10 sm:rounded-3xl sm:shadow-xl"
    >
      <div className="flex flex-col lg:grid lg:grid-cols-2">
        {/* 移动端：文字在上，对比图在下 */}
        <div className="order-1 flex flex-col justify-center p-4 sm:p-6 lg:order-2 lg:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 sm:text-xs">
            问题被看见
          </p>
          <h2 className="mt-1.5 text-lg font-bold text-slate-900 sm:mt-2 sm:text-2xl">
            为什么需要无碍？
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            很多人看到无障碍问题，但不知道怎么描述、归谁管、怎么反馈。
          </p>
          <p className="mt-3 rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 px-3 py-2.5 text-sm font-medium text-blue-900 ring-1 ring-blue-100 sm:mt-4 sm:px-4 sm:py-3">
            我们把公众表达转成治理语言。
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            「这里过不去」→「盲道连续性被占用物阻断，影响视障人士安全通行…」
          </p>
          <p className="mt-2 text-[11px] text-slate-400">{ILLUSTRATION_NOTE}</p>
        </div>

        {/* 移动端：左右对比 */}
        <div className="order-2 grid grid-cols-2 gap-2 p-3 pt-0 sm:gap-3 sm:p-4 sm:pt-0 lg:hidden">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-md">
            <AssetImage
              src={back.src}
              fallback={back.fallback}
              alt={back.alt}
              fill
              className={SCENE_IMAGE_CLASS}
              sizes="50vw"
              priority
            />
            <SceneBadge label="畅通" variant="clear" />
          </div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-md ring-2 ring-red-200">
            <AssetImage
              src={front.src}
              fallback={front.fallback}
              alt={front.alt}
              fill
              className={SCENE_IMAGE_CLASS}
              sizes="50vw"
              priority
            />
            <SceneBadge label="占用" variant="blocked" />
          </div>
        </div>

        {/* 桌面端：叠加动效 */}
        <div className="relative hidden min-h-[360px] overflow-hidden bg-slate-100 lg:order-1 lg:block">
          <div
            ref={backRef}
            className="overlay-layer absolute inset-4 overflow-hidden rounded-2xl shadow-md transition-transform duration-100 ease-out will-change-transform"
          >
            <AssetImage
              src={back.src}
              fallback={back.fallback}
              alt={back.alt}
              fill
              className={SCENE_IMAGE_CLASS}
              sizes="50vw"
              priority
            />
            <div className="absolute inset-0 bg-blue-900/10" />
          </div>

          <div
            ref={frontRef}
            className="overlay-layer absolute bottom-6 left-8 w-[76%] overflow-hidden rounded-2xl border-4 border-white shadow-2xl transition-transform duration-100 ease-out will-change-transform"
          >
            <div className="relative aspect-[4/3] w-full">
              <AssetImage
                src={front.src}
                fallback={front.fallback}
                alt={front.alt}
                fill
                className={SCENE_IMAGE_CLASS}
                sizes="380px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
              <SceneBadge label="盲道占用" variant="blocked" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
