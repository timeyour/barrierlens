"use client";

import AssetImage from "@/components/AssetImage";
import { SCENE_IMAGE_CLASS } from "@/config/imageDisplay";
import { UI_ASSETS } from "@/config/uiAssets";
import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

export default function CompareSlider() {
  const { back, front } = UI_ASSETS.overlay;
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(96, Math.max(4, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div className="space-y-3">
      <motion.div
        ref={containerRef}
        className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-2xl ring-1 ring-slate-200/80"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
      >
        <AssetImage
          src={back.src}
          fallback={back.fallback}
          alt={back.alt}
          fill
          className={SCENE_IMAGE_CLASS}
          sizes="(max-width: 768px) 100vw, 560px"
          priority
        />

        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <AssetImage
            src={front.src}
            fallback={front.fallback}
            alt={front.alt}
            fill
            className={SCENE_IMAGE_CLASS}
            sizes="(max-width: 768px) 100vw, 560px"
            priority
          />
        </div>

        <div
          className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.35)]"
          style={{ left: `${position}%` }}
        >
          <motion.div
            className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-slate-900/80 text-white shadow-xl backdrop-blur-sm"
            animate={{ scale: dragging.current ? 1.08 : 1 }}
          >
            ↔
          </motion.div>
        </div>

        <span className="absolute left-3 top-3 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
          畅通
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-red-500/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
          占用
        </span>
      </motion.div>

      <input
        type="range"
        min={4}
        max={96}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label="对比畅通与占用场景"
        className="compare-range w-full"
      />
      <p className="text-center text-[11px] text-slate-400">
        拖动滑块或图片，对比盲道状态
      </p>
    </div>
  );
}
