import { UI_ASSETS } from "@/config/uiAssets";
import { PATH_STATUS_LABELS, type AnalysisResult } from "@/types/analysis";

export type SceneConfig = {
  title: string;
  mainPath: string;
  riskPath: string;
  pin: { x: number; y: number };
  zones: Array<{ x: number; y: number; w: number; h: number; label: string }>;
  obstaclePoints: Array<{ x: number; y: number }>;
};

export type ScenePhotoModel = {
  mapPhoto: string;
  blockedPath: string;
  statusLabel: string;
  activeStatus: AnalysisResult["pathStatus"];
  dangerColor: string;
  usingUserPhoto: boolean;
  obstacles: AnalysisResult["obstacles"];
  markerPoints: Array<{ x: number; y: number }>;
  pinPoint: { x: number; y: number };
  config: SceneConfig;
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

function fixedObstaclePoints(
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

function photoObstaclePoints(count: number): Array<{ x: number; y: number }> {
  const n = Math.max(1, Math.min(count, 3));
  return Array.from({ length: n }, (_, index) => ({
    x: Math.round(100 + (320 / (n + 1)) * (index + 1)),
    y: 95 + (index % 2) * 55,
  }));
}

export function getSceneConfig(sceneType: AnalysisResult["sceneType"]): SceneConfig {
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
      obstaclePoints: fixedObstaclePoints(sceneType),
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
      obstaclePoints: fixedObstaclePoints(sceneType),
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
    obstaclePoints: fixedObstaclePoints(sceneType),
  };
}

export function resolveScenePhotoModel(
  result: AnalysisResult & {
    imageDataUrl?: string;
    reviewImageDataUrl?: string;
  },
  compareView: "before" | "after" = "before",
): ScenePhotoModel {
  const before = result.pathStatus === "clear" ? "partial" : result.pathStatus;
  const after =
    result.reviewStatus === "fixed"
      ? "clear"
      : result.reviewStatus === "review_pending" && before === "blocked"
        ? "partial"
        : result.pathStatus;

  const activeStatus = compareView === "before" ? before : after;
  const config = getSceneConfig(result.sceneType);
  const obstacles = result.obstacles.slice(0, 3);

  const mapPhoto =
    compareView === "after" && result.reviewImageDataUrl
      ? result.reviewImageDataUrl
      : result.imageDataUrl ?? UI_ASSETS.overlay.front.src;

  const usingFallbackPhoto =
    !(compareView === "after" && result.reviewImageDataUrl) && !result.imageDataUrl;

  const usingUserPhoto = !usingFallbackPhoto;
  const markerPoints = usingUserPhoto
    ? photoObstaclePoints(obstacles.length || 1)
    : config.obstaclePoints;
  const pinPoint = usingUserPhoto
    ? markerPoints[0] ?? { x: 260, y: 130 }
    : config.pin;
  const hasReviewPhoto = Boolean(result.reviewImageDataUrl);
  const statusLabel = hasReviewPhoto && compareView === "after" ? "整改后" : "现场";

  return {
    mapPhoto,
    blockedPath: result.blockedPath,
    statusLabel,
    activeStatus,
    dangerColor: statusColor(activeStatus),
    usingUserPhoto,
    obstacles,
    markerPoints,
    pinPoint,
    config,
  };
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildAnnotationSvgMarkup(model: ScenePhotoModel): string {
  const {
    usingUserPhoto,
    config,
    dangerColor,
    pinPoint,
    obstacles,
    markerPoints,
    blockedPath,
  } = model;

  const zones = !usingUserPhoto
    ? config.zones
        .map(
          (zone) =>
            `<rect x="${zone.x}" y="${zone.y}" width="${zone.w}" height="${zone.h}" rx="8" fill="#2563EB" opacity="0.18" /><text x="${zone.x + 8}" y="${zone.y + 18}" font-size="11" fill="#E2E8F0">${escapeXml(zone.label)}</text>`,
        )
        .join("")
    : "";

  const paths = !usingUserPhoto
    ? `<path d="${config.mainPath}" stroke="#94A3B8" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.85" /><path d="${config.riskPath}" stroke="${dangerColor}" stroke-width="8" stroke-linecap="round" fill="none" />`
    : "";

  const obstacleMarkup =
    obstacles.length > 0
      ? obstacles
          .map((obstacle, index) => {
            const point = markerPoints[index] ?? markerPoints[0];
            return `<rect x="${point.x - 10}" y="${point.y - 10}" width="20" height="20" rx="4" fill="#DC2626" opacity="0.95" /><text x="${point.x + 14}" y="${point.y + 4}" font-size="11" fill="#FEE2E2">${escapeXml(obstacle.name)}</text>`;
          })
          .join("")
      : usingUserPhoto
        ? `<text x="16" y="24" font-size="11" fill="#FEE2E2">${escapeXml(
            blockedPath.length > 40 ? `${blockedPath.slice(0, 40)}…` : blockedPath,
          )}</text>`
        : "";

  return `<svg viewBox="0 0 520 280" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;">${zones}${paths}<circle cx="${pinPoint.x}" cy="${pinPoint.y}" r="14" fill="${dangerColor}" opacity="0.35" /><circle cx="${pinPoint.x}" cy="${pinPoint.y}" r="6" fill="${dangerColor}" stroke="#fff" stroke-width="2" />${obstacleMarkup}</svg>`;
}

export function buildAnnotatedPhotoSectionHtml(
  result: AnalysisResult,
  imageDataUrl: string,
): string {
  const model = resolveScenePhotoModel({ ...result, imageDataUrl });
  const svg = buildAnnotationSvgMarkup(model);
  const statusText = PATH_STATUS_LABELS[model.activeStatus];

  return `<section>
  <h2>现场照片 · 示意标注</h2>
  <p class="photo-note">标注来自 AI 诊断摘要，供核对参考，非精确测绘。</p>
  <div class="photo-wrap">
    <img src="${imageDataUrl}" alt="现场照片" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;" />
    <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(2,6,23,0.55),rgba(2,6,23,0.1),rgba(2,6,23,0.25));pointer-events:none;"></div>
    ${svg}
    <div style="position:absolute;left:10px;right:10px;bottom:10px;border-radius:8px;background:rgba(2,6,23,0.75);color:#f8fafc;padding:8px 10px;font-size:10px;line-height:1.45;">
      <p style="margin:0 0 4px;">受阻路径：${escapeXml(model.blockedPath)}</p>
      <p style="margin:0;color:${model.dangerColor};">${escapeXml(model.statusLabel)}状态：${escapeXml(statusText)}</p>
    </div>
  </div>
</section>`;
}
