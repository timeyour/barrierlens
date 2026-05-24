import type {
  AnalysisResult,
  RecordMode,
  RiskLevel,
  TargetDepartment,
} from "@/types/analysis";

interface MockScenario {
  issueType: string;
  riskLevel: RiskLevel;
  affectedGroups: string[];
  sceneDescription: string;
  suggestion: string;
}

const SCENARIOS: MockScenario[] = [
  {
    issueType: "盲道占用",
    riskLevel: "中",
    affectedGroups: ["视障人士", "老年人", "行动不便者"],
    sceneDescription:
      "照片中盲道被共享单车占用，连续通行路径被阻断，视障人士难以沿盲道安全通行。",
    suggestion:
      "建议及时清理占用车辆，恢复盲道连续性，并将该点位纳入日常巡查范围。",
  },
  {
    issueType: "盲道占用",
    riskLevel: "高",
    affectedGroups: ["视障人士", "老年人", "轮椅使用者", "行动不便者"],
    sceneDescription:
      "出入口附近盲道被多辆电动车完全阻断，位于高人流区域，盲道连续性完全丧失，存在明显通行安全风险。",
    suggestion:
      "建议立即清理占用物，设置高峰时段巡查机制，并在出入口增设占用引导标识。",
  },
  {
    issueType: "盲道占用",
    riskLevel: "低",
    affectedGroups: ["视障人士", "老年人"],
    sceneDescription:
      "盲道边缘有少量杂物占用，主通行路径仍可辨识，存在轻微绕行空间，但影响连续通行体验。",
    suggestion:
      "建议及时清理边缘占用物，保持盲道标识清晰，避免问题进一步恶化。",
  },
  {
    issueType: "盲道占用",
    riskLevel: "中",
    affectedGroups: ["视障人士", "老年人", "推婴儿车者"],
    sceneDescription:
      "商场门口盲道被临时货架及宣传物料占用，连续通行路径中断，影响顾客及行动不便者通行。",
    suggestion:
      "建议立即撤除临时占用物，规范公共区域物品摆放，加强出入口无障碍管理。",
  },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickScenario(seed: string): MockScenario {
  const index = hashString(seed) % SCENARIOS.length;
  return SCENARIOS[index];
}

function buildAdvocacyText(
  scenario: MockScenario,
  location: string,
  targetDepartment: TargetDepartment,
): string {
  const place = location || "该点位";
  const groups = scenario.affectedGroups.join("、");
  return `【无障碍问题记录 · ${place}】

问题类型：${scenario.issueType}（风险：${scenario.riskLevel}）
场景归类：${targetDepartment}管辖区域附近

${scenario.sceneDescription}

影响群体：${groups}

这不是单次投诉，而是一条可被汇总、被看见的记录。单次反馈可能被忽略，但持续存在的问题需要被记录与关注。

建议关注：${scenario.suggestion}

—— 由无碍 BarrierLens 公众记录模式生成，供公益组织、媒体或公众倡导使用。`;
}

function buildInspectionText(
  scenario: MockScenario,
  location: string,
  targetDepartment: TargetDepartment,
): string {
  const place = location || "待标注点位";
  return `无障碍巡查整改单

巡查点位：${place}
区域类型：${targetDepartment}
记录时间：${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}

一、问题概述
- 类型：${scenario.issueType}
- 风险等级：${scenario.riskLevel}
- 影响群体：${scenario.affectedGroups.join("、")}

二、现场情况
${scenario.sceneDescription}

三、整改要求
${scenario.suggestion}

四、跟进建议
请在 3 个工作日内完成现场清理，并将整改前后对比照片归档至内部巡查台账。

—— 无碍 BarrierLens · 物业自查模式`;
}

export async function mockAnalyze(
  imageBase64: string,
  targetDepartment: TargetDepartment,
  recordMode: RecordMode,
  location?: string,
  fileName?: string,
): Promise<AnalysisResult> {
  const seed = fileName ?? imageBase64.slice(0, 64);
  const scenario = pickScenario(seed);
  const recordedAt = new Date().toISOString();
  const place = location?.trim() || "";

  await new Promise((resolve) =>
    setTimeout(resolve, 1500 + (hashString(seed) % 1000)),
  );

  const advocacyText = buildAdvocacyText(scenario, place, targetDepartment);
  const inspectionText = buildInspectionText(scenario, place, targetDepartment);
  const reportText =
    recordMode === "inspection" ? inspectionText : advocacyText;

  return {
    issueType: scenario.issueType,
    riskLevel: scenario.riskLevel,
    affectedGroups: scenario.affectedGroups,
    sceneDescription: scenario.sceneDescription,
    suggestion: scenario.suggestion,
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
  return !process.env.GEMMA_API_KEY;
}
