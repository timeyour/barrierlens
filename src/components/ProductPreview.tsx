"use client";

import { PHONE_PREVIEW_PHOTO_CLASS, PHONE_PREVIEW_PHOTO_SRC } from "@/config/imageDisplay";
import {
  motion,
  type MotionValue,
  useMotionValue,
  useTransform,
} from "framer-motion";

interface ProductPreviewProps {
  scrollProgress?: MotionValue<number>;
  className?: string;
  /** Hero 右侧浮层：内容更精简，高度更低 */
  variant?: "default" | "hero";
}

export default function ProductPreview({
  scrollProgress,
  className,
  variant = "default",
}: ProductPreviewProps) {
  const isHero = variant === "hero";
  const fallback = useMotionValue(0);
  const progress = scrollProgress ?? fallback;

  const phoneY = useTransform(progress, [0, 0.7], [0, isHero ? -40 : -60]);
  const phoneScale = useTransform(progress, [0, 0.5], [1, isHero ? 0.96 : 0.94]);

  return (
    <motion.div
      style={{ y: phoneY, scale: phoneScale }}
      className={
        className ??
        (isHero
          ? "relative mx-0 aspect-[9/19.5] h-[min(500px,calc(100vh-8rem))] w-auto shrink-0"
          : "relative mx-auto aspect-[9/19.5] w-[280px] shrink-0 sm:w-[300px] lg:w-[320px]")
      }
    >
      <div className="relative h-full w-full rounded-[2.25rem] bg-slate-950 p-[11px] shadow-2xl shadow-black/50 ring-1 ring-white/20">
        <div
          className={`absolute left-1/2 z-20 -translate-x-1/2 rounded-full bg-black ${
            isHero ? "top-[12px] h-[5px] w-[56px]" : "top-[15px] h-[6px] w-[72px]"
          }`}
        />

        <div
          className={`flex h-full flex-col overflow-hidden bg-white ${
            isHero ? "rounded-[1.45rem]" : "rounded-[1.65rem]"
          }`}
        >
          <div
            className={`flex shrink-0 items-center justify-between bg-slate-50 px-4 pb-1.5 text-[10px] font-medium text-slate-500 ${
              isHero ? "pt-6" : "pt-8"
            }`}
          >
            <span>9:41</span>
            <span>5G</span>
          </div>

          <motion.div className={`shrink-0 border-b border-slate-100 px-4 ${isHero ? "py-2" : "py-3"}`}>
            <p className={`font-bold text-slate-900 ${isHero ? "text-[12px]" : "text-[13px]"}`}>
              无碍 BarrierLens
            </p>
            <p className="text-[11px] text-slate-400">拍照 · AI 归档</p>
          </motion.div>

          <div
            className={`flex min-h-0 flex-1 flex-col overflow-hidden p-3 ${
              isHero ? "gap-2" : "gap-2.5"
            }`}
          >
            <div className="overflow-hidden rounded-xl border border-dashed border-blue-200 bg-blue-50/60">
              <div
                className={`relative w-full overflow-hidden bg-slate-100 ${
                  isHero ? "aspect-[4/3]" : "aspect-[5/4]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PHONE_PREVIEW_PHOTO_SRC}
                  alt="盲道被共享单车占用特写"
                  className={PHONE_PREVIEW_PHOTO_CLASS}
                />
              </div>
              <p
                className={`text-center font-medium text-blue-700 ${
                  isHero ? "py-1.5 text-[10px]" : "py-2 text-[11px]"
                }`}
              >
                已选现场照片
              </p>
            </div>

            {!isHero && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "物业", active: true },
                    { label: "社区", active: false },
                    { label: "商场", active: false },
                    { label: "城管", active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-lg py-2 text-center text-[11px] font-semibold ${
                        item.active
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 py-2.5 text-center text-[12px] font-semibold text-white">
                  生成记录
                </div>
              </>
            )}

            <div
              className={`rounded-xl bg-slate-50 ring-1 ring-slate-100 ${
                isHero ? "p-2.5" : "p-3"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-800">
                  中风险
                </span>
                <span className="text-[10px] font-semibold text-slate-700">盲道占用</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
                盲道被共享单车阻断，建议责任方及时清理…
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -inset-8 -z-10 rounded-[2.75rem] bg-gradient-to-br from-blue-500/30 to-emerald-500/20 blur-3xl" />
    </motion.div>
  );
}
