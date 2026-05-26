import {
  OBSTACLE_NATURE_LABELS,
  PATH_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
  SCENE_TYPE_LABELS,
  SPATIAL_CONFLICT_LABELS,
  type AnalysisResult,
  type RecordMode,
} from "@/types/analysis";
import { inferObstacleNature, inferSpatialCategory } from "@/lib/spatialDiagnosis";

function formatMeta(result: AnalysisResult): string {
  const groups = result.affectedGroups.join("、");
  const category = inferSpatialCategory(result);
  const nature = inferObstacleNature(result);
  const time = result.recordedAt
    ? new Date(result.recordedAt).toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
      })
    : new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

  return `| 字段 | 内容 |
|------|------|
| 记录时间 | ${time} |
| 地点 | ${result.location || "未标注"} |
| 冲突源 | ${SPATIAL_CONFLICT_LABELS[category]} |
| 物理属性 | ${OBSTACLE_NATURE_LABELS[nature]} |
| 问题类型 | ${result.issueType} |
| 场景类型 | ${SCENE_TYPE_LABELS[result.sceneType]} |
| 风险等级 | ${result.riskLevel} |
| 受阻路径状态 | ${PATH_STATUS_LABELS[result.pathStatus]} |
| 受阻路径 | ${result.blockedPath} |
| 影响群体 | ${groups} |
| 场景归类 | ${result.targetDepartment} |`;
}

export function buildAdvocacyMarkdown(result: AnalysisResult): string {
  return `# 无障碍问题公众记录 · 无碍 BarrierLens

> 倡导摘要 · 供公益组织、媒体或公众传播使用

## 记录概览

${formatMeta(result)}

## 问题摘要

${result.problemSummary}

## 障碍物清单

${result.obstacles.length > 0
    ? result.obstacles
        .map(
          (obstacle, index) =>
            `${index + 1}. ${obstacle.name}｜${obstacle.position}｜影响：${obstacle.blocks}`,
        )
        .join("\n")
    : "未识别到明确障碍物"}

## 现场描述

${result.sceneDescription}

## 合规管理建议

${result.managementAction || result.suggestion}

## 建议责任方

${result.responsibleParty.join("、")}

## 整改动作

${result.suggestedActions.map((action, idx) => `${idx + 1}. ${action}`).join("\n")}

## 复查状态

${REVIEW_STATUS_LABELS[result.reviewStatus]}

## 倡导文本

${result.advocacyText}

---

*单次反馈可能被忽略，但每一条被记录的问题，都在推动无障碍环境被看见。*
`;
}

export function buildInspectionMarkdown(result: AnalysisResult): string {
  return `# 无障碍通行空间合规诊断与管理建议书 · 无碍 BarrierLens

> 内部自查 · 供物业/商场归档与跟进

## 诊断概览

${formatMeta(result)}

## 空间冲突诊断

${result.problemSummary}

## 合规管理建议

${result.managementAction || result.suggestion}

## 障碍物清单

${result.obstacles.length > 0
    ? result.obstacles
        .map(
          (obstacle, index) =>
            `${index + 1}. ${obstacle.name}｜${obstacle.position}｜影响：${obstacle.blocks}`,
        )
        .join("\n")
    : "未识别到明确障碍物"}

## 现场描述

${result.sceneDescription}

## 整改要求

${result.suggestion}

## 建议责任方

${result.responsibleParty.join("、")}

## 整改动作

${result.suggestedActions.map((action, idx) => `${idx + 1}. ${action}`).join("\n")}

## 复查状态

${REVIEW_STATUS_LABELS[result.reviewStatus]}

## 完整整改单

${result.inspectionText}

---

*建议在 3 个工作日内完成整改，并留存前后对比照片。*
`;
}

export function buildMarkdownReport(
  result: AnalysisResult,
  mode?: RecordMode,
): string {
  const effectiveMode = mode ?? result.recordMode ?? "public";
  return effectiveMode === "inspection"
    ? buildInspectionMarkdown(result)
    : buildAdvocacyMarkdown(result);
}

export function downloadMarkdownReport(
  result: AnalysisResult,
  fileName?: string,
  mode?: RecordMode,
): void {
  const effectiveMode = mode ?? result.recordMode ?? "public";
  const markdown = buildMarkdownReport(result, effectiveMode);
  const date = new Date().toISOString().slice(0, 10);
  const defaultName =
    effectiveMode === "inspection"
      ? `无碍-合规诊断建议书-${date}.md`
      : `无碍-公众记录-${date}.md`;
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName ?? defaultName;
  link.click();
  URL.revokeObjectURL(url);
}
