import { pickMockPreset, type MockPreset } from "@/data/mockPresets";
import type {
  AnalysisResult,
  RecordMode,
  TargetDepartment,
} from "@/types/analysis";

function buildAdvocacyText(
  preset: MockPreset,
  location: string,
  targetDepartment: TargetDepartment,
): string {
  const place = location || "该点位";
  return `【公共空间无障碍通行风险记录 · ${place}】

冲突源：${preset.category === "native_design_defect" ? "设计硬伤" : preset.category === "legacy_addition_conflict" ? "加建冲突" : "容量错配"}
物理属性：${preset.obstacleNature === "static" ? "静态受阻" : "动态占用"}
场景类型：${preset.issueType}
风险等级：${preset.riskLevel}
受阻路径：${preset.blockedPath}
场景归类：${targetDepartment}

空间冲突描述：
${preset.problemSummary}

管理建议：
${preset.managementAction}

证据要点：
${preset.evidencePoints.map((point, i) => `${i + 1}. ${point}`).join("\n")}

建议责任方：${preset.responsibleParty.join("、")}
建议行动：
${preset.suggestedActions.map((action, i) => `${i + 1}. ${action}`).join("\n")}

—— 无碍 BarrierLens 公众记录模式生成（用于倡导与证据归档）`;
}

function buildInspectionText(
  preset: MockPreset,
  location: string,
  targetDepartment: TargetDepartment,
): string {
  const place = location || "待标注点位";
  return `无障碍通行空间合规诊断与管理建议书

诊断点位：${place}
区域类型：${targetDepartment}
记录时间：${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}

一、空间冲突诊断
${preset.problemSummary}

二、冲突分类
- 冲突源：${preset.category === "native_design_defect" ? "设计硬伤（原生规划缺陷）" : preset.category === "legacy_addition_conflict" ? "加建冲突（后期设施挤占）" : "容量错配（需求与设施不匹配）"}
- 物理属性：${preset.obstacleNature === "static" ? "静态受阻" : "动态占用（高频易逝风险）"}

三、受阻路径
${preset.blockedPath}（状态：${preset.pathStatus}）

四、障碍物清单
${preset.obstacles
  .map((obstacle, i) => `${i + 1}. ${obstacle.name}｜${obstacle.position}｜影响：${obstacle.blocks}`)
  .join("\n")}

五、合规管理建议
${preset.managementAction}

六、整改动作
${preset.suggestedActions.map((action, i) => `${i + 1}. ${action}`).join("\n")}

七、复查要求
请在 3 个工作日内完成整改或上报职能部门，并补充整改后复查照片。`;
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function mockAnalyze(
  imageBase64: string,
  targetDepartment: TargetDepartment,
  recordMode: RecordMode,
  location?: string,
  fileName?: string,
): Promise<AnalysisResult> {
  const seed = fileName ?? imageBase64.slice(0, 64);
  const preset = pickMockPreset(fileName, seed);
  const recordedAt = new Date().toISOString();
  const place = location?.trim() || "";

  await new Promise((resolve) =>
    setTimeout(resolve, 600 + (hashString(seed) % 400)),
  );

  const advocacyText = buildAdvocacyText(preset, place, targetDepartment);
  const inspectionText = buildInspectionText(preset, place, targetDepartment);
  const reportText = recordMode === "inspection" ? inspectionText : advocacyText;

  return {
    hasIssue: true,
    category: preset.category,
    obstacleNature: preset.obstacleNature,
    managementAction: preset.managementAction,
    sceneType: preset.sceneType,
    locationType: preset.locationType,
    obstacles: preset.obstacles,
    blockedPath: preset.blockedPath,
    pathStatus: preset.pathStatus,
    problemSummary: preset.problemSummary,
    evidencePoints: preset.evidencePoints,
    issueType: preset.issueType,
    riskLevel: preset.riskLevel,
    affectedGroups: preset.affectedGroups,
    sceneDescription: preset.sceneDescription,
    suggestion: preset.managementAction,
    responsibleParty: preset.responsibleParty,
    suggestedActions: preset.suggestedActions,
    confidence: preset.confidence,
    needsHumanReview: preset.confidence < 0.8,
    reviewStatus: "pending",
    targetDepartment,
    reportText,
    advocacyText,
    inspectionText,
    location: place || undefined,
    recordMode,
    recordedAt,
  };
}

export function isMockMode(): boolean {
  return !process.env.GEMINI_API_KEY && !process.env.GEMMA_API_KEY;
}

export function getModeText(recordMode: RecordMode): string {
  return recordMode === "inspection" ? "物业自查" : "公众记录";
}
