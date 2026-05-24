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
}

export default function ProductPreview({ scrollProgress }: ProductPreviewProps) {
  const fallback = useMotionValue(0);
  const progress = scrollProgress ?? fallback;

  const phoneY = useTransform(progress, [0, 0.7], [0, -60]);
  const phoneOpacity = useTransform(progress, [0, 0.75], [1, 0]);
  const phoneScale = useTransform(progress, [0, 0.5], [1, 0.94]);

  return (
    <motion.div
      style={{ y: phoneY, opacity: phoneOpacity, scale: phoneScale }}
      className="relative mx-auto w-[280px] shrink-0 sm:w-[300px] lg:w-[320px]"
    >
      {/* 9:19.5 手机比例 */}
      <div className="relative aspect-[9/19.5] rounded-[2.25rem] bg-slate-950 p-[11px] shadow-2xl shadow-black/50 ring-1 ring-white/20">
        <div className="absolute left-1/2 top-[15px] z-20 h-[6px] w-[72px] -translate-x-1/2 rounded-full bg-black" />

        <div className="flex h-full flex-col overflow-hidden rounded-[1.65rem] bg-white">
          <div className="flex shrink-0 items-center justify-between bg-slate-50 px-4 pb-1.5 pt-8 text-[10px] font-medium text-slate-500">
            <span>9:41</span>
            <span>5G</span>
          </div>

          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <p className="text-[13px] font-bold text-slate-900">无碍 BarrierLens</p>
            <p className="text-[11px] text-slate-400">公众无障碍反馈</p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden p-3">
            <div className="overflow-hidden rounded-xl border border-dashed border-blue-200 bg-blue-50/60">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PHONE_PREVIEW_PHOTO_SRC}
                  alt="盲道被共享单车占用特写"
                  className={PHONE_PREVIEW_PHOTO_CLASS}
                />
              </div>
              <p className="py-2 text-center text-[11px] font-medium text-blue-700">
                已选现场照片
              </p>
            </div>

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
              生成反馈报告
            </div>

            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-800">
                  中风险
                </span>
                <span className="text-[10px] font-semibold text-slate-700">
                  盲道占用
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
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
