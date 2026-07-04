import {
  OBSTACLE_NATURE_LABELS,
  PATH_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
  SCENE_TYPE_LABELS,
  SPATIAL_CONFLICT_LABELS,
  type AnalysisResult,
  type RecordMode,
} from "@/types/analysis";
import {
  buildEvidenceSummary,
  buildReviewHint,
  HUMAN_REVIEW_DECLARATION,
} from "@/lib/evidenceFields";
import { inferObstacleNature, inferSpatialCategory } from "@/lib/spatialDiagnosis";
import { displayLocationLabel } from "@/lib/locationValidation";
import { buildAnnotatedPhotoSectionHtml } from "@/lib/scenePhotoModel";

export interface ExportReportOptions {
  mode?: RecordMode;
  imageDataUrl?: string;
  fileName?: string;
}

export function getEffectiveMode(
  result: AnalysisResult,
  mode?: RecordMode,
): RecordMode {
  return mode ?? result.recordMode ?? "public";
}

export function formatRecordedTime(result: AnalysisResult): string {
  const source = result.recordedAt ?? new Date().toISOString();
  return new Date(source).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatObstacleList(result: AnalysisResult): string {
  if (result.obstacles.length === 0) {
    return "未识别到明确障碍物";
  }
  return result.obstacles
    .map(
      (obstacle, index) =>
        `${index + 1}. ${obstacle.name}｜${obstacle.position}｜影响：${obstacle.blocks}`,
    )
    .join("\n");
}

function formatEvidencePoints(result: AnalysisResult): string {
  if (result.evidencePoints.length === 0) {
    return "暂无单独列出的证据要点";
  }
  return result.evidencePoints.map((point, index) => `${index + 1}. ${point}`).join("\n");
}

function formatSuggestedActions(result: AnalysisResult): string {
  if (result.suggestedActions.length === 0) {
    return "暂无具体整改动作";
  }
  return result.suggestedActions
    .map((action, index) => `${index + 1}. ${action}`)
    .join("\n");
}

export function buildProblemHeadline(result: AnalysisResult): string {
  const summary = result.problemSummary.trim();
  if (summary) return summary;
  return `${result.issueType}（${SCENE_TYPE_LABELS[result.sceneType]}）`;
}

export function buildProblemExplanation(result: AnalysisResult): string {
  const category = inferSpatialCategory(result);
  const nature = inferObstacleNature(result);
  const location = displayLocationLabel(result.location, "未标注具体地点");
  const groups = result.affectedGroups.join("、") || "待核实";
  const path = result.blockedPath || "待核实";

  return [
    `在「${location}」发现：${buildProblemHeadline(result)}`,
    `问题归类为「${result.issueType}」，场景为${SCENE_TYPE_LABELS[result.sceneType]}。`,
    `空间冲突源为${SPATIAL_CONFLICT_LABELS[category]}，障碍物属性为${OBSTACLE_NATURE_LABELS[nature]}，通行路径状态为${PATH_STATUS_LABELS[result.pathStatus]}。`,
    `主要影响${groups}，受阻路径：${path}。`,
    `风险等级：${result.riskLevel}。`,
  ].join("\n");
}

function buildDiagnosisTable(result: AnalysisResult): string {
  const category = inferSpatialCategory(result);
  const nature = inferObstacleNature(result);
  const groups = result.affectedGroups.join("、") || "—";
  const time = formatRecordedTime(result);

  return `| 字段 | 内容 |
|------|------|
| 记录时间 | ${time} |
| 地点 | ${displayLocationLabel(result.location, "未标注")} |
| 冲突源 | ${SPATIAL_CONFLICT_LABELS[category]} |
| 物理属性 | ${OBSTACLE_NATURE_LABELS[nature]} |
| 问题类型 | ${result.issueType} |
| 场景类型 | ${SCENE_TYPE_LABELS[result.sceneType]} |
| 风险等级 | ${result.riskLevel} |
| 受阻路径状态 | ${PATH_STATUS_LABELS[result.pathStatus]} |
| 受阻路径 | ${result.blockedPath || "—"} |
| 影响群体 | ${groups} |
| 场景归类 | ${result.targetDepartment} |
| 复查状态 | ${REVIEW_STATUS_LABELS[result.reviewStatus]} |`;
}

function buildPublicDisclaimer(): string {
  return [
    HUMAN_REVIEW_DECLARATION,
    "无碍 BarrierLens 不代为投诉或执法，不构成专业验收或法律责任认定。",
    "传播时请避免可识别路人面部、车牌；地点宜概括描述。",
    "如需向管理部门反映，请通过当地公开的政务服务渠道（如 12345）按官方要求提交。",
  ].join("\n");
}

function buildInspectionDisclaimer(): string {
  return [
    HUMAN_REVIEW_DECLARATION,
    "本建议书由 AI 辅助生成，须物业/管理方人工确认后执行。",
    "无碍 BarrierLens 不替代专业无障碍验收或法律责任认定。",
    "整改前后照片请脱敏处理，避免可识别路人面部与车牌。",
  ].join("\n");
}

function buildStructuredEvidenceSection(result: AnalysisResult): string {
  const evidence = buildEvidenceSummary(result);
  const reviewHint = buildReviewHint(result);
  return `## 结构化证据摘要

| 字段 | 内容 |
|------|------|
| 项目名称 | 无碍 BarrierLens |
| 记录时间 | ${formatRecordedTime(result)} |
| 地点 | ${displayLocationLabel(result.location, "未标注")} |
| 问题类型 | ${result.issueType} |
| 场景类型 | ${SCENE_TYPE_LABELS[result.sceneType]} |
| 风险等级 | ${result.riskLevel} |
| 影响人群 | ${result.affectedGroups.join("、") || "待核实"} |
| 证据摘要 | ${evidence} |
| 整改建议 | ${result.suggestion || result.managementAction} |
| 复查提示 | ${reviewHint} |
| 复查状态 | ${REVIEW_STATUS_LABELS[result.reviewStatus]} |

### 建议动作

${formatSuggestedActions(result)}

## 人工复核声明

${HUMAN_REVIEW_DECLARATION}
`;
}

export function buildMarkdownReport(
  result: AnalysisResult,
  mode?: RecordMode,
): string {
  const effectiveMode = getEffectiveMode(result, mode);
  const problemExplanation = buildProblemExplanation(result);
  const obstacles = formatObstacleList(result);
  const evidence = formatEvidencePoints(result);
  const actions = formatSuggestedActions(result);
  const responsible = result.responsibleParty.join("、") || "待核实";
  const management = result.managementAction || result.suggestion;
  const fullText =
    effectiveMode === "inspection" ? result.inspectionText : result.advocacyText;

  if (effectiveMode === "inspection") {
    return `# 无障碍通行空间合规诊断与管理建议书 · 无碍 BarrierLens

> 内部自查 · 供物业/商场归档与跟进

## 什么问题

**${result.issueType}** · 风险等级 **${result.riskLevel}**

${problemExplanation}

## 诊断概览

${buildDiagnosisTable(result)}

${buildStructuredEvidenceSection(result)}

## 现场情况

${result.sceneDescription}

### 障碍物清单

${obstacles}

### 证据要点

${evidence}

## 影响与通行

- 影响群体：${result.affectedGroups.join("、") || "待核实"}
- 受阻路径：${result.blockedPath || "—"}
- 路径状态：${PATH_STATUS_LABELS[result.pathStatus]}

## 建议怎么处理

${management}

### 整改动作

${actions}

### 建议责任方

${responsible}

## 完整整改单

${fullText}

---

## 使用说明

${buildInspectionDisclaimer()}

*建议在约定时限内完成整改，并留存前后对比照片备查。*
`;
  }

  return `# 无障碍问题证据报告 · 无碍 BarrierLens

> 公众记录 · 供公益组织、媒体或公众传播使用

## 什么问题

**${result.issueType}** · 风险等级 **${result.riskLevel}**

${problemExplanation}

## 记录概览

${buildDiagnosisTable(result)}

${buildStructuredEvidenceSection(result)}

## 现场情况

${result.sceneDescription}

### 障碍物清单

${obstacles}

### 证据要点

${evidence}

## 影响谁

- 影响群体：${result.affectedGroups.join("、") || "待核实"}
- 受阻路径：${result.blockedPath || "—"}
- 路径状态：${PATH_STATUS_LABELS[result.pathStatus]}

## 建议怎么处理

${management}

### 整改动作

${actions}

### 建议责任方

${responsible}

## 完整倡导文本

${fullText}

---

## 使用说明

${buildPublicDisclaimer()}

*单次反馈可能被忽略，但每一条经核实的记录，都有助于推动无障碍环境被看见。*
`;
}

const PDF_STYLES = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif; color: #0f172a; line-height: 1.6; font-size: 12px; }
  .report { width: 190mm; padding: 0; }
  .brand { font-size: 11px; color: #64748b; margin: 0 0 4px; }
  h1 { font-size: 20px; margin: 0 0 6px; color: #0f172a; }
  .subtitle { font-size: 12px; color: #475569; margin: 0 0 16px; }
  .problem-box { background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; }
  .problem-title { font-size: 15px; font-weight: 700; margin: 0 0 8px; color: #9a3412; }
  .problem-text { margin: 0; white-space: pre-wrap; }
  .risk { display: inline-block; margin-top: 8px; padding: 2px 8px; border-radius: 999px; background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 600; }
  section { margin-bottom: 14px; page-break-inside: avoid; }
  h2 { font-size: 14px; margin: 0 0 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
  h3 { font-size: 12px; margin: 10px 0 6px; color: #334155; }
  p, li { margin: 0 0 6px; }
  ul, ol { margin: 0; padding-left: 18px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f8fafc; width: 28%; color: #475569; }
  .photo-wrap { position: relative; width: 100%; aspect-ratio: 4 / 3; background: #0f172a; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-top: 6px; }
  .photo-note { font-size: 10px; color: #64748b; margin: 0 0 6px; }
  .full-text { white-space: pre-wrap; background: #f8fafc; border-radius: 8px; padding: 10px 12px; border: 1px solid #e2e8f0; }
  footer { margin-top: 16px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #64748b; }
  footer p { margin-bottom: 4px; }
`;

function buildDiagnosisRows(result: AnalysisResult): string {
  const category = inferSpatialCategory(result);
  const nature = inferObstacleNature(result);
  const groups = result.affectedGroups.join("、") || "—";

  const rows: Array<[string, string]> = [
    ["记录时间", formatRecordedTime(result)],
    ["地点", displayLocationLabel(result.location, "未标注")],
    ["冲突源", SPATIAL_CONFLICT_LABELS[category]],
    ["物理属性", OBSTACLE_NATURE_LABELS[nature]],
    ["问题类型", result.issueType],
    ["场景类型", SCENE_TYPE_LABELS[result.sceneType]],
    ["风险等级", result.riskLevel],
    ["路径状态", PATH_STATUS_LABELS[result.pathStatus]],
    ["受阻路径", result.blockedPath || "—"],
    ["影响群体", groups],
    ["场景归类", result.targetDepartment],
    ["复查状态", REVIEW_STATUS_LABELS[result.reviewStatus]],
  ];

  return rows
    .map(
      ([label, value]) =>
        `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`,
    )
    .join("");
}

function listItems(items: string[], ordered = false): string {
  if (items.length === 0) {
    return `<p>—</p>`;
  }
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
}

export function buildReportHtml(
  result: AnalysisResult,
  mode?: RecordMode,
  imageDataUrl?: string,
): string {
  const effectiveMode = getEffectiveMode(result, mode);
  const isInspection = effectiveMode === "inspection";
  const title = isInspection
    ? "无障碍通行空间合规诊断与管理建议书"
    : "无障碍问题证据报告";
  const subtitle = isInspection
    ? "内部自查 · 供物业/商场归档与跟进"
    : "公众记录 · 供公益组织、媒体或公众传播";
  const problemExplanation = buildProblemExplanation(result);
  const management = result.managementAction || result.suggestion;
  const fullText = isInspection ? result.inspectionText : result.advocacyText;
  const disclaimer = isInspection
    ? buildInspectionDisclaimer()
    : buildPublicDisclaimer();
  const obstacleItems = result.obstacles.map(
    (obstacle) =>
      `${obstacle.name}｜${obstacle.position}｜影响：${obstacle.blocks}`,
  );

  const photoBlock = imageDataUrl
    ? buildAnnotatedPhotoSectionHtml(result, imageDataUrl)
    : "";

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>${PDF_STYLES}</style>
</head>
<body>
  <div class="report">
    <p class="brand">无碍 BarrierLens</p>
    <h1>${escapeHtml(title)}</h1>
    <p class="subtitle">${escapeHtml(subtitle)}</p>

    <div class="problem-box">
      <p class="problem-title">${escapeHtml(result.issueType)}</p>
      <p class="problem-text">${escapeHtml(problemExplanation)}</p>
      <span class="risk">风险等级：${escapeHtml(result.riskLevel)}</span>
    </div>

    ${photoBlock}

    <section>
      <h2>诊断概览</h2>
      <table>${buildDiagnosisRows(result)}</table>
    </section>

    <section>
      <h2>现场情况</h2>
      <p>${escapeHtml(result.sceneDescription)}</p>
      <h3>障碍物</h3>
      ${listItems(obstacleItems)}
      <h3>证据要点</h3>
      ${listItems(result.evidencePoints)}
    </section>

    <section>
      <h2>${isInspection ? "影响与通行" : "影响谁"}</h2>
      <ul>
        <li>影响群体：${escapeHtml(result.affectedGroups.join("、") || "待核实")}</li>
        <li>受阻路径：${escapeHtml(result.blockedPath || "—")}</li>
        <li>路径状态：${escapeHtml(PATH_STATUS_LABELS[result.pathStatus])}</li>
      </ul>
    </section>

    <section>
      <h2>建议怎么处理</h2>
      <p>${escapeHtml(management)}</p>
      <h3>整改动作</h3>
      ${listItems(result.suggestedActions, true)}
      <h3>建议责任方</h3>
      <p>${escapeHtml(result.responsibleParty.join("、") || "待核实")}</p>
    </section>

    <section>
      <h2>${isInspection ? "完整整改单" : "完整倡导文本"}</h2>
      <div class="full-text">${escapeHtml(fullText)}</div>
    </section>

    <footer>
      ${disclaimer
        .split("\n")
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("")}
    </footer>
  </div>
</body>
</html>`;
}

export function defaultPdfFileName(mode: RecordMode): string {
  const date = new Date().toISOString().slice(0, 10);
  return mode === "inspection"
    ? `无碍-合规诊断建议书-${date}.pdf`
    : `无碍-证据报告-${date}.pdf`;
}
