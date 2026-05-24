import type { AnalysisResult } from "@/types/analysis";

export function buildMarkdownReport(result: AnalysisResult): string {
  const groups = result.affectedGroups.join("、");
  const generatedAt = new Date().toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
  });

  return `# 无障碍反馈报告 · 无碍 BarrierLens

> 生成时间：${generatedAt}

## 问题概览

| 字段 | 内容 |
|------|------|
| 问题类型 | ${result.issueType} |
| 风险等级 | ${result.riskLevel} |
| 影响群体 | ${groups} |
| 反馈对象 | ${result.targetDepartment} |

## 现场描述

${result.sceneDescription}

## 整改建议

${result.suggestion}

## 标准化反馈文本

${result.reportText}

---

*本报告由无碍 BarrierLens 生成，旨在帮助公众将现场发现转化为清晰、可处理的无障碍反馈。*
`;
}

export function downloadMarkdownReport(
  result: AnalysisResult,
  fileName = "barrierlens-report.md",
): void {
  const markdown = buildMarkdownReport(result);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
