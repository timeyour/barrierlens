"use client";

import {
  SceneBlockedIllustration,
  SceneClearIllustration,
} from "@/components/SceneCompareIllustrations";
import {
  COMPARE_BLOCKED_CLASS,
  COMPARE_CLEAR_CLASS,
} from "@/config/imageDisplay";
import { UI_ASSETS } from "@/config/uiAssets";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

function ComparePhotoLayer({
  side,
  className,
}: {
  side: "clear" | "blocked";
  className: string;
}) {
  const asset =
    side === "clear" ? UI_ASSETS.overlay.back : UI_ASSETS.overlay.front;
  const objectClass =
    side === "clear" ? COMPARE_CLEAR_CLASS : COMPARE_BLOCKED_CLASS;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset.src}
      alt={asset.alt}
      className={`${className} ${objectClass}`}
      draggable={false}
    />
  );
}

export default function CompareSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const usePhotos = useMediaQuery("(min-width: 768px)", false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(96, Math.max(4, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateFromClientX(e.clientX);
  };

  const onPointerUp = () => {
    setIsDragging(false);
  };

  const layerClass = "absolute inset-0 h-full w-full";

  return (
    <motion.div className="space-y-3">
      <motion.div
        ref={containerRef}
        className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-200/80"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
        role="img"
        aria-label="盲道畅通与占用对比"
      >
        {usePhotos ? (
          <ComparePhotoLayer side="blocked" className={layerClass} />
        ) : (
          <SceneBlockedIllustration className={layerClass} />
        )}

        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {usePhotos ? (
            <ComparePhotoLayer side="clear" className={layerClass} />
          ) : (
            <SceneClearIllustration className={layerClass} />
          )}
        </div>

        <div
          className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.35)]"
          style={{ left: `${position}%` }}
        >
          <motion.div
            className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-slate-900/80 text-white shadow-xl backdrop-blur-sm"
            animate={{ scale: isDragging ? 1.08 : 1 }}
          >
            ↔
          </motion.div>
        </div>

        <span className="absolute left-3 top-3 z-20 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
          畅通
        </span>
        <span className="absolute right-3 top-3 z-20 rounded-full bg-red-500/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
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
    </motion.div>
  );
}
