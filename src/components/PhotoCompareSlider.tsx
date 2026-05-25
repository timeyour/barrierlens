"use client";

import { useCallback, useRef, useState } from "react";

interface PhotoCompareSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function PhotoCompareSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = "反馈时",
  afterLabel = "整改后",
}: PhotoCompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

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

  const onPointerUp = () => setIsDragging(false);

  const layerClass = "absolute inset-0 h-full w-full object-cover";

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ring-1 ring-slate-200/80"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="img"
        aria-label={`${beforeLabel}与${afterLabel}对比`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterUrl}
          alt={afterLabel}
          className={layerClass}
          draggable={false}
        />
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeUrl}
            alt={beforeLabel}
            className={layerClass}
            draggable={false}
          />
        </div>

        <div
          className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.35)]"
          style={{ left: `${position}%` }}
        >
          <div
            className={`absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-slate-900/85 text-sm text-white shadow-lg backdrop-blur-sm transition-transform ${
              isDragging ? "scale-110" : ""
            }`}
          >
            ↔
          </div>
        </div>

        <span className="absolute left-3 top-3 z-20 rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
          {beforeLabel}
        </span>
        <span className="absolute right-3 top-3 z-20 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
          {afterLabel}
        </span>
      </div>

      <input
        type="range"
        min={4}
        max={96}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label={`拖动对比${beforeLabel}与${afterLabel}`}
        className="compare-range w-full"
      />
      <p className="text-center text-[10px] text-slate-400">
        拖动滑块或图片，对比整改前后现场
      </p>
    </div>
  );
}
