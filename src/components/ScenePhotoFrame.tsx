"use client";

import type { ReactNode } from "react";
import type { AnalysisResult } from "@/types/analysis";

type ScenePhotoSize = "compact" | "hero" | "default" | "expanded" | "split";

type SceneConfig = {
  mainPath: string;
  riskPath: string;
  pin: { x: number; y: number };
  zones: Array<{ x: number; y: number; w: number; h: number; label: string }>;
  obstaclePoints: Array<{ x: number; y: number }>;
};

interface ScenePhotoFrameProps {
  mapPhoto: string;
  alt: string;
  dense?: boolean;
  expanded?: boolean;
  size?: ScenePhotoSize;
  usingUserPhoto?: boolean;
  /** 叠在照片左侧的诊断摘要 */
  overlay?: ReactNode;
  blockedPath?: string;
  statusLabel?: string;
  activeStatus?: AnalysisResult["pathStatus"];
  dangerColor?: string;
  obstacles?: AnalysisResult["obstacles"];
  markerPoints?: Array<{ x: number; y: number }>;
  pinPoint?: { x: number; y: number };
  config?: SceneConfig;
}

function resolveSize(
  size: ScenePhotoSize | undefined,
  dense: boolean,
  expanded: boolean,
): ScenePhotoSize {
  if (size) return size;
  if (expanded) return "expanded";
  if (dense) return "compact";
  return "default";
}

const SIZE_CLASS: Record<ScenePhotoSize, string> = {
  compact: "aspect-[4/3] max-h-52 rounded-lg",
  hero: "aspect-[4/3] min-h-[12rem] w-full rounded-none sm:min-h-[15rem]",
  split: "absolute inset-0 h-full w-full rounded-none",
  default: "aspect-[16/10] rounded-xl",
  expanded: "aspect-[4/3] max-h-[min(72vh,calc(100dvh-11rem))] rounded-xl",
};

export default function ScenePhotoFrame({
  mapPhoto,
  alt,
  dense = false,
  expanded = false,
  size,
  usingUserPhoto = true,
  overlay,
}: ScenePhotoFrameProps) {
  const resolved = resolveSize(size, dense, expanded);
  const hasOverlay = Boolean(overlay);

  return (
    <div
      className={`relative overflow-hidden bg-slate-900 ${
        resolved === "split" ? "h-full w-full" : SIZE_CLASS[resolved]
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mapPhoto}
        alt={alt}
        className="absolute inset-0 h-full w-full object-contain"
        draggable={false}
      />

      {hasOverlay && (
        <>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[min(46%,11.5rem)] bg-gradient-to-r from-slate-950/95 via-slate-950/82 to-slate-950/0 sm:w-[min(42%,13rem)]"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex w-[min(46%,11.5rem)] flex-col p-2 sm:w-[min(42%,13rem)] sm:p-2.5">
            {overlay}
          </div>
        </>
      )}

      {!usingUserPhoto && (
        <span className="absolute right-2 top-2 z-30 rounded bg-slate-900/70 px-1.5 py-0.5 text-[9px] text-white">
          示意底图
        </span>
      )}

      {hasOverlay && (
        <span className="pointer-events-none absolute bottom-2 right-2 z-30 rounded bg-black/45 px-1.5 py-0.5 text-[9px] text-white/90">
          左侧为示意摘要
        </span>
      )}
    </div>
  );
}

export type { SceneConfig, ScenePhotoSize };
