import type {
  AnalysisResult,
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
      "建议责任方及时清理占用车辆，恢复盲道连续性，并将该点位纳入日常巡查范围。",
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
      "建议责任方及时清理边缘占用物，保持盲道标识清晰，避免问题进一步恶化。",
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

const DEPARTMENT_TEMPLATES: Record<
  TargetDepartment,
  (scene: string, suggestion: string, groups: string[]) => string
> = {
  物业: (scene, suggestion, groups) =>
    `您好，现场发现${scene}，可能影响${groups.join("、")}安全通行。${suggestion}请协助落实现场清理与责任区域日常维护，感谢处理。`,
  社区: (scene, suggestion, groups) =>
    `您好，社区巡查中发现${scene}，涉及${groups.join("、")}通行权益。${suggestion}请协助协调责任方推动整改，并纳入社区日常巡查，感谢支持。`,
  商场: (scene, suggestion, groups) =>
    `您好，商场公共区域存在无障碍问题：${scene}，影响${groups.join("、")}及顾客通行体验。${suggestion}请加强公共空间管理与无障碍服务，感谢配合。`,
  城管: (scene, suggestion, groups) =>
    `您好，公共通道秩序问题反馈：${scene}，影响${groups.join("、")}连续安全通行，涉嫌违规占用公共无障碍设施。${suggestion}请依法及时处置，感谢处理。`,
};

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

function buildReportText(
  scenario: MockScenario,
  targetDepartment: TargetDepartment,
): string {
  const template = DEPARTMENT_TEMPLATES[targetDepartment];
  return template(
    scenario.sceneDescription.replace(/^照片中/, "该处"),
    scenario.suggestion,
    scenario.affectedGroups,
  );
}

export async function mockAnalyze(
  imageBase64: string,
  targetDepartment: TargetDepartment,
  fileName?: string,
): Promise<AnalysisResult> {
  const seed = fileName ?? imageBase64.slice(0, 64);
  const scenario = pickScenario(seed);

  await new Promise((resolve) =>
    setTimeout(resolve, 1500 + (hashString(seed) % 1000)),
  );

  return {
    issueType: scenario.issueType,
    riskLevel: scenario.riskLevel,
    affectedGroups: scenario.affectedGroups,
    sceneDescription: scenario.sceneDescription,
    suggestion: scenario.suggestion,
    targetDepartment,
    reportText: buildReportText(scenario, targetDepartment),
  };
}

export function isMockMode(): boolean {
  return !process.env.GEMMA_API_KEY;
}
