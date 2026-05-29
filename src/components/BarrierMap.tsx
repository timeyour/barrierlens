"use client";

import { UI_ASSETS } from "@/config/uiAssets";
import { useMemo, useState } from "react";
import { PATH_STATUS_LABELS, type AnalysisResult } from "@/types/analysis";

interface BarrierMapProps {
  result: AnalysisResult & {
    imageDataUrl?: string;
    reviewImageDataUrl?: string;
    location?: string;
  };
}

type SceneConfig = {
  title: string;
  mainPath: string;
  riskPath: string;
  pin: { x: number; y: number };
  start: { x: number; y: number; label: string; labelX: number; labelY: number };
  end: { x: number; y: number; label: string; labelX: number; labelY: number };
  zones: Array<{ x: number; y: number; w: number; h: number; label: string }>;
  obstaclePoints: Array<{ x: number; y: number }>;
};

function sceneTitle(sceneType: AnalysisResult["sceneType"]): string {
  if (sceneType === "accessible_entrance_blocked") return "入口 / 坡道风险";
  if (sceneType === "access_route_discontinuity") return "通行链断点";
  return "盲道受阻风险";
}

function statusColor(pathStatus: AnalysisResult["pathStatus"]): string {
  if (pathStatus === "clear") return "#10B981";
  if (pathStatus === "partial") return "#F59E0B";
  return "#EF4444";
}

function obstaclePoints(
  sceneType: AnalysisResult["sceneType"],
): Array<{ x: number; y: number }> {
  if (sceneType === "accessible_entrance_blocked") {
    return [
      { x: 350, y: 150 },
      { x: 310, y: 130 },
      { x: 380, y: 170 },
    ];
  }
  if (sceneType === "access_route_discontinuity") {
    return [
      { x: 280, y: 150 },
      { x: 340, y: 190 },
      { x: 235, y: 125 },
    ];
  }
  return [
    { x: 260, y: 130 },
    { x: 300, y: 160 },
    { x: 220, y: 105 },
  ];
}

/** 现场照片上均匀分布障碍标注，避免套用示意图固定坐标 */
function photoObstaclePoints(count: number): Array<{ x: number; y: number }> {
  const n = Math.max(1, Math.min(count, 3));
  return Array.from({ length: n }, (_, index) => ({
    x: Math.round(100 + ((320 / (n + 1)) * (index + 1))),
    y: 95 + (index % 2) * 55,
  }));
}

function getSceneConfig(sceneType: AnalysisResult["sceneType"]): SceneConfig {
  if (sceneType === "accessible_entrance_blocked") {
    return {
      title: sceneTitle(sceneType),
      mainPath: "M80 200 L220 200 L290 160 L360 120 L440 120",
      riskPath: "M220 200 L290 160 L360 120",
      pin: { x: 310, y: 145 },
      start: { x: 80, y: 200, label: "室外通道", labelX: 44, labelY: 222 },
      end: { x: 440, y: 120, label: "建筑入口", labelX: 400, labelY: 100 },
      zones: [
        { x: 28, y: 170, w: 150, h: 58, label: "人行区域" },
        { x: 270, y: 88, w: 200, h: 70, label: "无障碍入口/坡道" },
      ],
      obstaclePoints: obstaclePoints(sceneType),
    };
  }
  if (sceneType === "access_route_discontinuity") {
    return {
      title: sceneTitle(sceneType),
      mainPath: "M70 90 L180 90 L250 130 L300 180 L420 180",
      riskPath: "M180 90 L250 130 L300 180",
      pin: { x: 265, y: 155 },
      start: { x: 70, y: 90, label: "道路起点", labelX: 36, labelY: 74 },
      end: { x: 420, y: 180, label: "社区入口", labelX: 386, labelY: 203 },
      zones: [
        { x: 24, y: 66, w: 180, h: 54, label: "道路侧" },
        { x: 210, y: 114, w: 130, h: 90, label: "断点区域" },
        { x: 356, y: 148, w: 130, h: 54, label: "入口通道" },
      ],
      obstaclePoints: obstaclePoints(sceneType),
    };
  }
  return {
    title: sceneTitle(sceneType),
    mainPath: "M70 80 L180 80 L240 130 L300 170 L430 170",
    riskPath: "M180 80 L240 130 L300 170 L360 170",
    pin: { x: 270, y: 135 },
    start: { x: 70, y: 80, label: "盲道起点", labelX: 40, labelY: 62 },
    end: { x: 430, y: 170, label: "目标入口", labelX: 392, labelY: 195 },
    zones: [
      { x: 34, y: 56, w: 170, h: 52, label: "盲道连续段" },
      { x: 216, y: 110, w: 176, h: 78, label: "阻断风险段" },
    ],
    obstaclePoints: obstaclePoints(sceneType),
  };
}

export default function BarrierMap({ result }: BarrierMapProps) {
  const [compareView, setCompareView] = useState<"before" | "after">("before");
  const statusPair = useMemo(() => {
    const before =
      result.pathStatus === "clear" ? "partial" : result.pathStatus;
    const after =
      result.reviewStatus === "fixed"
        ? "clear"
        : result.reviewStatus === "review_pending" && before === "blocked"
          ? "partial"
          : result.pathStatus;
    return { before, after } as const;
  }, [result.pathStatus, result.reviewStatus]);

  const activeStatus =
    compareView === "before" ? statusPair.before : statusPair.after;
  const dangerColor = statusColor(activeStatus);
  const config = getSceneConfig(result.sceneType);
  const obstacles = result.obstacles.slice(0, 3);

  const mapPhoto =
    compareView === "after" && result.reviewImageDataUrl
      ? result.reviewImageDataUrl
      : result.imageDataUrl ?? UI_ASSETS.overlay.front.src;

  const usingFallbackPhoto =
    !(compareView === "after" && result.reviewImageDataUrl) && !result.imageDataUrl;

  const usingUserPhoto = !usingFallbackPhoto;
  const mapTitle = usingUserPhoto ? result.issueType : config.title;
  const markerPoints = usingUserPhoto
    ? photoObstaclePoints(obstacles.length || 1)
    : config.obstaclePoints;
  const pinPoint = usingUserPhoto
    ? markerPoints[0] ?? { x: 260, y: 130 }
    : config.pin;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">风险地图 · 现场标注</h3>
          {result.location && (
            <p className="mt-0.5 text-[11px] text-slate-500">{result.location}</p>
          )}
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
          {mapTitle}
        </span>
      </div>

      <div className="mb-3 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setCompareView("before")}
          className={`rounded-md px-3 py-1 text-xs font-semibold ${
            compareView === "before"
              ? "bg-slate-900 text-white"
              : "text-slate-600"
          }`}
        >
          整改前
        </button>
        <button
          type="button"
          onClick={() => setCompareView("after")}
          disabled={!result.reviewImageDataUrl}
          className={`rounded-md px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
            compareView === "after"
              ? "bg-slate-900 text-white"
              : "text-slate-600"
          }`}
        >
          整改后
        </button>
      </div>

      <div className="relative overflow-hidden rounded-xl border-2 border-slate-300 bg-slate-800 shadow-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mapPhoto}
          alt={compareView === "after" ? "整改后现场底图" : "反馈现场底图"}
          className="aspect-[16/10] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-slate-950/25" />

        <svg
          viewBox="0 0 520 280"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="无障碍通行风险标注"
        >
          {!usingUserPhoto && config.zones.map((zone) => (
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
              <text x={zone.x + 8} y={zone.y + 18} fontSize="11" fill="#E2E8F0">
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
                  <text x={point.x + 14} y={point.y + 4} fontSize="11" fill="#FEE2E2">
                    {obstacle.name}
                  </text>
                </g>
              );
            })
          ) : usingUserPhoto ? (
            <text x="16" y="24" fontSize="11" fill="#E2E8F0">
              风险区域（见下方摘要）
            </text>
          ) : null}
        </svg>

        <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-slate-950/70 px-3 py-2 text-[11px] text-slate-100 backdrop-blur-sm">
          <p>受阻路径：{result.blockedPath}</p>
          <p style={{ color: dangerColor }}>
            {compareView === "before" ? "整改前" : "整改后"}状态：
            {PATH_STATUS_LABELS[activeStatus]}
          </p>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-slate-500">
        {usingUserPhoto
          ? "底图为本条记录现场照片；红框与标签来自诊断摘要，为示意标注而非精确测绘。"
          : usingFallbackPhoto
            ? "底图为街景示意（归档后可替换为本条记录现场照片）；路径与风险点为叠加标注。"
            : "底图为本条记录现场照片；叠加路径与风险点位标注。"}
      </p>
    </div>
  );
}
