import type { AnalysisResult, RecordMode } from "@/types/analysis";

function formatMeta(result: AnalysisResult): string {
  const groups = result.affectedGroups.join("、");
  const time = result.recordedAt
    ? new Date(result.recordedAt).toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
      })
    : new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

  return `| 字段 | 内容 |
|------|------|
| 记录时间 | ${time} |
| 地点 | ${result.location || "未标注"} |
| 问题类型 | ${result.issueType} |
| 风险等级 | ${result.riskLevel} |
| 影响群体 | ${groups} |
| 场景归类 | ${result.targetDepartment} |`;
}

export function buildAdvocacyMarkdown(result: AnalysisResult): string {
  return `# 无障碍问题公众记录 · 无碍 BarrierLens

> 倡导摘要 · 供公益组织、媒体或公众传播使用

## 记录概览

${formatMeta(result)}

## 现场描述

${result.sceneDescription}

## 关注建议

${result.suggestion}

## 倡导文本

${result.advocacyText}

---

*单次反馈可能被忽略，但每一条被记录的问题，都在推动无障碍环境被看见。*
`;
}

export function buildInspectionMarkdown(result: AnalysisResult): string {
  return `# 无障碍巡查整改单 · 无碍 BarrierLens

> 内部自查 · 供物业/商场归档与跟进

## 巡查概览

${formatMeta(result)}

## 现场描述

${result.sceneDescription}

## 整改要求

${result.suggestion}

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
      ? `无碍-巡查整改单-${date}.md`
      : `无碍-公众记录-${date}.md`;
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName ?? defaultName;
  link.click();
  URL.revokeObjectURL(url);
}
