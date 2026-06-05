"use client";

import { UI_ASSETS } from "@/config/uiAssets";
import MediaLightbox from "@/components/MediaLightbox";
import ScenePhotoFrame, { type SceneConfig } from "@/components/ScenePhotoFrame";
import { useMemo, useState } from "react";
import { displayLocationLabel } from "@/lib/locationValidation";
import type { AnalysisResult } from "@/types/analysis";

interface BarrierMapProps {
  result: AnalysisResult & {
    imageDataUrl?: string;
    reviewImageDataUrl?: string;
    location?: string;
  };
  compact?: boolean;
  dense?: boolean;
}

function sceneTitle(sceneType: AnalysisResult["sceneType"]): string {
  if (sceneType === "no_issue") return "通行路径顺畅";
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
  if (sceneType === "no_issue") return [];
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

function photoObstaclePoints(count: number): Array<{ x: number; y: number }> {
  const n = Math.max(1, Math.min(count, 3));
  return Array.from({ length: n }, (_, index) => ({
    x: Math.round(100 + (320 / (n + 1)) * (index + 1)),
    y: 95 + (index % 2) * 55,
  }));
}

function getSceneConfig(sceneType: AnalysisResult["sceneType"]): SceneConfig & { title: string } {
  if (sceneType === "no_issue") {
    return {
      title: sceneTitle(sceneType),
      mainPath: "M70 150 L180 150 L260 150 L340 150 L430 150",
      riskPath: "",
      pin: { x: 250, y: 150 },
      zones: [
        { x: 34, y: 122, w: 380, h: 56, label: "通行路径清晰" },
      ],
      obstaclePoints: [],
    };
  }
  if (sceneType === "accessible_entrance_blocked") {
    return {
      title: sceneTitle(sceneType),
      mainPath: "M80 200 L220 200 L290 160 L360 120 L440 120",
      riskPath: "M220 200 L290 160 L360 120",
      pin: { x: 310, y: 145 },
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
    zones: [
      { x: 34, y: 56, w: 170, h: 52, label: "盲道连续段" },
      { x: 216, y: 110, w: 176, h: 78, label: "阻断风险段" },
    ],
    obstaclePoints: obstaclePoints(sceneType),
  };
}

export default function BarrierMap({ result, compact = false, dense = false }: BarrierMapProps) {
  const [compareView, setCompareView] = useState<"before" | "after">("before");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const statusPair = useMemo(() => {
    const before =
      result.hasIssue && result.pathStatus === "clear" ? "partial" : result.pathStatus;
    const after =
      result.reviewStatus === "fixed"
        ? "clear"
        : result.reviewStatus === "review_pending" && before === "blocked"
          ? "partial"
          : result.pathStatus;
    return { before, after } as const;
  }, [result.hasIssue, result.pathStatus, result.reviewStatus]);

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
  const markerPoints = !result.hasIssue
    ? []
    : usingUserPhoto
      ? photoObstaclePoints(obstacles.length || 1)
      : config.obstaclePoints;
  const pinPoint = usingUserPhoto
    ? markerPoints[0] ?? { x: 260, y: 130 }
    : config.pin;

  const hasReviewPhoto = Boolean(result.reviewImageDataUrl);
  const statusLabel = hasReviewPhoto && compareView === "after" ? "整改后" : "现场";
  const photoAlt =
    compareView === "after" && hasReviewPhoto ? "整改后现场底图" : "反馈现场底图";

  const frameProps = {
    mapPhoto,
    alt: photoAlt,
    blockedPath: result.blockedPath,
    statusLabel,
    activeStatus,
    dangerColor,
    usingUserPhoto,
    obstacles,
    markerPoints,
    pinPoint,
    config,
  };

  return (
    <div className={compact ? "space-y-3" : "rounded-2xl border border-slate-200 bg-white p-5"}>
      {!compact && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">风险地图 · 现场标注</h3>
            {displayLocationLabel(result.location, "") && (
              <p className="mt-0.5 text-[11px] text-slate-500">
                {displayLocationLabel(result.location, "")}
              </p>
            )}
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
            {mapTitle}
          </span>
        </div>
      )}

      {hasReviewPhoto && (
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
            className={`rounded-md px-3 py-1 text-xs font-semibold ${
              compareView === "after"
                ? "bg-slate-900 text-white"
                : "text-slate-600"
            }`}
          >
            整改后
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className={`group relative block w-full text-left transition hover:ring-2 hover:ring-blue-400/60 ${
          dense ? "rounded-lg" : "rounded-xl"
        }`}
        aria-label="放大查看现场照片与标注"
      >
        <ScenePhotoFrame {...frameProps} dense={dense} />
        <span className="absolute right-2 top-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
          点击放大
        </span>
      </button>

      <MediaLightbox
        open={lightboxOpen}
        title="现场照片 · 标注核对"
        zoomable
        onClose={() => setLightboxOpen(false)}
      >
        <ScenePhotoFrame {...frameProps} expanded />
      </MediaLightbox>

      {!dense && (
        <p className="mt-2 text-[11px] text-slate-500">
          {usingUserPhoto
            ? "底图为本条记录现场照片；红框与标签来自诊断摘要，为示意标注而非精确测绘。"
            : usingFallbackPhoto
              ? "底图为街景示意（归档后可替换为本条记录现场照片）；路径与风险点为叠加标注。"
              : "底图为本条记录现场照片；叠加路径与风险点位标注。"}
        </p>
      )}
    </div>
  );
}
