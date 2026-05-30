import type { AnalysisResult, RecordMode } from "@/types/analysis";
import { sanitizeLocationForStorage } from "@/lib/locationValidation";

function formatReportDate(result: AnalysisResult): string {
  const iso = result.recordedAt ?? new Date().toISOString();
  return new Date(iso).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function primaryObstacle(result: AnalysisResult): string {
  if (result.obstacles.length > 0) return result.obstacles[0].name;
  if (result.evidencePoints.length > 0) return result.evidencePoints[0];
  return "无障碍通行障碍";
}

function primaryAction(result: AnalysisResult): string {
  return (
    result.suggestedActions[0] ??
    result.managementAction ??
    result.suggestion ??
    "请核实并整改"
  );
}

/** 12345 / 市民热线 ~140 字 */
export function buildHotlineDispatchScript(result: AnalysisResult): string {
  const place = sanitizeLocationForStorage(result.location) || "上述路段";
  const date = formatReportDate(result);
  const obstacle = primaryObstacle(result);
  const action = primaryAction(result);

  return `【无障碍通行问题】${place}，${date} 现场发现：${result.issueType}。${result.blockedPath}，主要障碍：${obstacle}。影响视障/轮椅通行，存在安全风险。诉求：${action}。由 BarrierLens 根据现场照片整理，本人自行反映。`;
}

/** 物业 / 商场微信 */
export function buildPropertyDispatchScript(result: AnalysisResult): string {
  const place = sanitizeLocationForStorage(result.location) || "贵单位管辖区域";
  const date = formatReportDate(result);
  const obstacle = primaryObstacle(result);

  return `${place}（${date}）：现场存在${result.issueType}，${result.blockedPath}，可见${obstacle}。请依据实际情况核实并整改，感谢配合。—— 居民通过 BarrierLens 整理，供巡查参考，非执法文书。`;
}

export function buildDispatchScript(
  result: AnalysisResult,
  mode?: RecordMode,
): string {
  const effectiveMode = mode ?? result.recordMode ?? "public";
  return effectiveMode === "inspection"
    ? buildPropertyDispatchScript(result)
    : buildHotlineDispatchScript(result);
}

export const DISPATCH_DISCLAIMER =
  "BarrierLens 仅提供基于 Gemma 4 的现场结构化描述，不具备执法效力，不代为行使行政诉求；报告内容由拍摄者负责。";
