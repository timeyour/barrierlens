"use client";

import type { AnalysisResult } from "@/types/analysis";
import { PATH_STATUS_LABELS } from "@/types/analysis";

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
  blockedPath: string;
  statusLabel: string;
  activeStatus: AnalysisResult["pathStatus"];
  dangerColor: string;
  usingUserPhoto: boolean;
  obstacles: AnalysisResult["obstacles"];
  markerPoints: Array<{ x: number; y: number }>;
  pinPoint: { x: number; y: number };
  config: SceneConfig;
}

function PhotoAnnotations({
  usingUserPhoto,
  config,
  dangerColor,
  pinPoint,
  obstacles,
  markerPoints,
  blockedPath,
  expanded,
}: Pick<
  ScenePhotoFrameProps,
  | "usingUserPhoto"
  | "config"
  | "dangerColor"
  | "pinPoint"
  | "obstacles"
  | "markerPoints"
  | "blockedPath"
  | "expanded"
>) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-slate-950/25" />
      <svg
        viewBox="0 0 520 280"
        preserveAspectRatio="xMidYMid meet"
        className="pointer-events-none absolute inset-0 h-full w-full"
        role="img"
        aria-label="无障碍通行风险标注"
      >
        {!usingUserPhoto &&
          config.zones.map((zone) => (
            <g key={`${zone.x}-${zone.label}`}>
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.w}
                height={zone.h}
                rx="8"
                fill="#2563EB"
                opacity="0.18"
              />
              <text
                x={zone.x + 8}
                y={zone.y + 18}
                fontSize={expanded ? "13" : "11"}
                fill="#E2E8F0"
              >
                {zone.label}
              </text>
            </g>
          ))}

        {!usingUserPhoto && (
          <>
            <path
              d={config.mainPath}
              stroke="#94A3B8"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
            <path
              d={config.riskPath}
              stroke={dangerColor}
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}

        <circle cx={pinPoint.x} cy={pinPoint.y} r="14" fill={dangerColor} opacity="0.35" />
        <circle
          cx={pinPoint.x}
          cy={pinPoint.y}
          r="6"
          fill={dangerColor}
          stroke="#fff"
          strokeWidth="2"
        />

        {obstacles.length > 0 ? (
          obstacles.map((obstacle, index) => {
            const point = markerPoints[index] ?? markerPoints[0];
            return (
              <g key={`${obstacle.name}-${index}`}>
                <rect
                  x={point.x - 10}
                  y={point.y - 10}
                  width="20"
                  height="20"
                  rx="4"
                  fill="#DC2626"
                  opacity="0.95"
                />
                <text
                  x={point.x + 14}
                  y={point.y + 4}
                  fontSize={expanded ? "13" : "11"}
                  fill="#FEE2E2"
                >
                  {obstacle.name}
                </text>
              </g>
            );
          })
        ) : usingUserPhoto ? (
          <text x="16" y="24" fontSize={expanded ? "13" : "11"} fill="#FEE2E2">
            {blockedPath.length > (expanded ? 48 : 28)
              ? `${blockedPath.slice(0, expanded ? 48 : 28)}…`
              : blockedPath}
          </text>
        ) : null}
      </svg>
    </>
  );
}

export default function ScenePhotoFrame({
  mapPhoto,
  alt,
  dense = false,
  expanded = false,
  blockedPath,
  statusLabel,
  activeStatus,
  dangerColor,
  usingUserPhoto,
  obstacles,
  markerPoints,
  pinPoint,
  config,
}: ScenePhotoFrameProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-900 ${
        expanded
          ? "aspect-[4/3] max-h-[min(72vh,calc(100dvh-11rem))] rounded-xl"
          : dense
            ? "aspect-[4/3] max-h-44 rounded-lg"
            : "aspect-[16/10] rounded-xl"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mapPhoto}
        alt={alt}
        className="absolute inset-0 h-full w-full object-contain"
        draggable={false}
      />
      <PhotoAnnotations
        usingUserPhoto={usingUserPhoto}
        config={config}
        dangerColor={dangerColor}
        pinPoint={pinPoint}
        obstacles={obstacles}
        markerPoints={markerPoints}
        blockedPath={blockedPath}
        expanded={expanded}
      />
      <div
        className={`pointer-events-none absolute rounded-lg bg-slate-950/75 text-slate-100 backdrop-blur-sm ${
          dense && !expanded
            ? "bottom-2 left-2 right-2 px-2 py-1.5 text-[10px] leading-snug"
            : "bottom-3 left-3 right-3 px-3 py-2 text-[11px]"
        }`}
      >
        <p className={dense && !expanded ? "line-clamp-2" : undefined}>
          受阻路径：{blockedPath}
        </p>
        <p style={{ color: dangerColor }}>
          {statusLabel}状态：{PATH_STATUS_LABELS[activeStatus]}
        </p>
      </div>
    </div>
  );
}

export type { SceneConfig };
