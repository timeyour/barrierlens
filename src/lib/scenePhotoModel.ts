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

/** 示意标注统一落在照片左侧，避免误导为精确像素定位 */
const LEFT_MARKER_X = 72;
const LEFT_MARKER_START_Y = 68;
const LEFT_MARKER_STEP_Y = 52;

function leftObstaclePoints(count: number): Array<{ x: number; y: number }> {
  const n = Math.max(1, Math.min(count, 3));
  return Array.from({ length: n }, (_, index) => ({
    x: LEFT_MARKER_X,
    y: LEFT_MARKER_START_Y + index * LEFT_MARKER_STEP_Y,
  }));
}

function fixedObstaclePoints(
  sceneType: AnalysisResult["sceneType"],
): Array<{ x: number; y: number }> {
  if (sceneType === "no_issue") return [];
  return leftObstaclePoints(3);
}

function photoObstaclePoints(count: number): Array<{ x: number; y: number }> {
  return leftObstaclePoints(count);
}

export function getSceneConfig(sceneType: AnalysisResult["sceneType"]): SceneConfig {
  if (sceneType === "no_issue") {
    return {
      title: sceneTitle(sceneType),
      mainPath: "M36 150 L108 150 L156 150",
      riskPath: "",
      pin: { x: LEFT_MARKER_X, y: 150 },
      zones: [
        { x: 20, y: 122, w: 168, h: 56, label: "通行路径清晰" },
      ],
      obstaclePoints: [],
    };
  }
  if (sceneType === "accessible_entrance_blocked") {
    return {
      title: sceneTitle(sceneType),
      mainPath: "M36 200 L96 200 L120 160",
      riskPath: "M96 200 L120 160",
      pin: { x: LEFT_MARKER_X, y: 155 },
      zones: [
        { x: 20, y: 170, w: 132, h: 58, label: "人行区域" },
        { x: 20, y: 88, w: 132, h: 70, label: "无障碍入口/坡道" },
      ],
      obstaclePoints: fixedObstaclePoints(sceneType),
    };
  }
  if (sceneType === "access_route_discontinuity") {
    return {
      title: sceneTitle(sceneType),
      mainPath: "M36 90 L96 90 L120 130",
      riskPath: "M96 90 L120 130",
      pin: { x: LEFT_MARKER_X, y: 130 },
      zones: [
        { x: 20, y: 66, w: 132, h: 54, label: "道路侧" },
        { x: 20, y: 124, w: 132, h: 72, label: "断点区域" },
      ],
      obstaclePoints: fixedObstaclePoints(sceneType),
    };
  }
  return {
    title: sceneTitle(sceneType),
    mainPath: "M36 80 L96 80 L120 130",
    riskPath: "M96 80 L120 130",
    pin: { x: LEFT_MARKER_X, y: 120 },
    zones: [
      { x: 20, y: 56, w: 132, h: 52, label: "盲道连续段" },
      { x: 20, y: 112, w: 132, h: 78, label: "阻断风险段" },
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
  const before =
    result.hasIssue && result.pathStatus === "clear" ? "partial" : result.pathStatus;
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
  const markerPoints = !result.hasIssue
    ? []
    : usingUserPhoto
      ? photoObstaclePoints(obstacles.length || 1)
      : config.obstaclePoints;
  const pinPoint = usingUserPhoto
    ? markerPoints[0] ?? { x: LEFT_MARKER_X, y: 130 }
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
  const { obstacles, blockedPath, dangerColor, activeStatus, statusLabel } = model;
  const statusText = PATH_STATUS_LABELS[activeStatus];

  const cards =
    obstacles.length > 0
      ? obstacles
          .map(
            (obstacle) =>
              `<li style="margin:0 0 8px;padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;list-style:none;">
                <p style="margin:0;font-size:11px;font-weight:600;color:#0f172a;">${escapeXml(obstacle.name)}</p>
                ${obstacle.position ? `<p style="margin:4px 0 0;font-size:10px;color:#475569;">${escapeXml(obstacle.position)}</p>` : ""}
                ${obstacle.blocks ? `<p style="margin:4px 0 0;font-size:10px;color:#64748b;">影响：${escapeXml(obstacle.blocks)}</p>` : ""}
              </li>`,
          )
          .join("")
      : `<p style="margin:0;padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;font-size:10px;color:#334155;">${escapeXml(blockedPath)}</p>`;

  return `<div style="position:absolute;inset:0;pointer-events:none;">
  <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(2,6,23,0.95) 0%,rgba(2,6,23,0.82) 42%,transparent 78%);"></div>
  <aside style="position:absolute;inset:0 auto 0 0;width:min(46%,13rem);display:flex;flex-direction:column;padding:10px;color:#f8fafc;">
    <p style="margin:0;font-size:10px;font-weight:600;color:#e2e8f0;">诊断摘要</p>
    <ul style="margin:8px 0 0;padding:0;list-style:none;flex:1;overflow:hidden;">${cards}</ul>
    <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.15);font-size:9px;color:#cbd5e1;">
      <p style="margin:0;">${escapeXml(blockedPath.length > 48 ? `${blockedPath.slice(0, 48)}…` : blockedPath)}</p>
      <p style="margin:4px 0 0;color:${dangerColor};">${escapeXml(statusLabel)} · ${escapeXml(statusText)}</p>
    </div>
  </aside>
</div>`;
}

export function buildAnnotatedPhotoSectionHtml(
  result: AnalysisResult,
  imageDataUrl: string,
): string {
  const model = resolveScenePhotoModel({ ...result, imageDataUrl });
  const findings = buildAnnotationSvgMarkup(model);

  return `<section>
  <h2>现场照片 · 左侧标注</h2>
  <p class="photo-note">摘要叠在照片左侧，非像素级定位。</p>
  <div class="photo-wrap" style="position:relative;aspect-ratio:4/3;min-height:220px;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#0f172a;">
    <img src="${imageDataUrl}" alt="现场照片" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:left top;" />
    ${findings}
  </div>
</section>`;
}
