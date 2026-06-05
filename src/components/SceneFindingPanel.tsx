"use client";

import type { AnalysisResult } from "@/types/analysis";
import { PATH_STATUS_LABELS } from "@/types/analysis";

interface SceneFindingPanelProps {
  blockedPath: string;
  statusLabel: string;
  activeStatus: AnalysisResult["pathStatus"];
  dangerColor: string;
  obstacles: AnalysisResult["obstacles"];
  dense?: boolean;
  /** card=独立卡片 embedded=证据区底栏 overlay=叠在照片左侧 */
  variant?: "card" | "embedded" | "overlay";
}

export default function SceneFindingPanel({
  blockedPath,
  statusLabel,
  activeStatus,
  dangerColor,
  obstacles,
  dense = false,
  variant = "card",
}: SceneFindingPanelProps) {
  const isOverlay = variant === "overlay";
  const isEmbedded = variant === "embedded";

  const titleClass = isOverlay
    ? dense
      ? "text-[9px]"
      : "text-[10px]"
    : dense
      ? "text-[11px]"
      : "text-xs";
  const bodyClass = isOverlay
    ? dense
      ? "text-[9px] leading-snug"
      : "text-[10px] leading-snug"
    : dense
      ? "text-[11px] leading-snug"
      : "text-sm leading-relaxed";

  const rootClass = isOverlay
    ? "flex h-full min-h-0 flex-col text-slate-100"
    : isEmbedded
      ? "flex h-full flex-col"
      : "flex h-full flex-col rounded-lg border border-slate-200 bg-slate-50 p-3";

  const titleColor = isOverlay ? "text-slate-200" : "text-slate-800";
  const hintColor = isOverlay ? "text-slate-400" : "text-slate-500";
  const itemClass = isOverlay
    ? "rounded-md bg-white/10 px-2 py-1.5 ring-1 ring-white/10"
    : "rounded-lg border border-slate-200/90 bg-white px-3 py-2.5 shadow-sm";

  return (
    <div className={rootClass} aria-label="诊断摘要">
      <p className={`font-semibold ${titleClass} ${titleColor}`}>诊断摘要</p>
      {!isOverlay && (
        <p className={`mt-0.5 ${hintColor} ${dense ? "text-[10px]" : "text-[11px]"}`}>
          {isEmbedded ? "对照上方照片核对" : "对照照片核对"}
        </p>
      )}

      {obstacles.length > 0 ? (
        <ul className={`mt-1.5 min-h-0 flex-1 space-y-1.5 overflow-y-auto ${bodyClass}`}>
          {obstacles.map((obstacle, index) => (
            <li key={`${obstacle.name}-${index}`} className={itemClass}>
              <div className="flex items-start gap-1.5">
                <span
                  className={`mt-1 shrink-0 rounded-full bg-red-500 ${isOverlay ? "size-1.5" : "size-2"}`}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className={`font-medium ${isOverlay ? "text-white" : "text-slate-900"}`}>
                    {obstacle.name}
                  </p>
                  {obstacle.position && (
                    <p className={`mt-0.5 ${isOverlay ? "text-slate-300" : "text-slate-600"}`}>
                      {obstacle.position}
                    </p>
                  )}
                  {!isOverlay && obstacle.blocks && (
                    <p className="mt-1 text-slate-500">影响：{obstacle.blocks}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p
          className={`mt-1.5 min-h-0 flex-1 overflow-y-auto ${itemClass} ${bodyClass} ${
            isOverlay ? "text-slate-200" : "text-slate-700"
          }`}
        >
          {blockedPath}
        </p>
      )}

      <div
        className={`mt-1.5 shrink-0 border-t pt-1.5 ${isOverlay ? "border-white/15" : "border-slate-200/80"} ${
          isOverlay ? "text-[9px]" : dense ? "text-[11px]" : "text-xs"
        }`}
      >
        <p className={isOverlay ? "line-clamp-2 text-slate-300" : "text-slate-600"}>
          {isOverlay ? blockedPath : <>受阻路径 <span className="text-slate-800">{blockedPath}</span></>}
        </p>
        <p className="mt-0.5 font-medium" style={{ color: isOverlay ? dangerColor : dangerColor }}>
          {statusLabel} · {PATH_STATUS_LABELS[activeStatus]}
        </p>
      </div>
    </div>
  );
}
