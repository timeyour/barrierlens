import type {
  AnalysisResult,
  Obstacle,
  PathStatus,
  RecordMode,
  ReviewStatus,
  RiskLevel,
  SceneType,
  TargetDepartment,
} from "@/types/analysis";

interface MockScenario {
  sceneType: SceneType;
  locationType: string;
  issueType: string;
  blockedPath: string;
  pathStatus: PathStatus;
  obstacles: Obstacle[];
  riskLevel: RiskLevel;
  affectedGroups: string[];
  sceneDescription: string;
  problemSummary: string;
  evidencePoints: string[];
  responsibleParty: string[];
  suggestedActions: string[];
  confidence: number;
  needsHumanReview: boolean;
  reviewStatus: ReviewStatus;
}

const SCENARIOS: MockScenario[] = [
  {
    sceneType: "tactile_paving_blocked",
    locationType: "street",
    issueType: "盲道占用",
    blockedPath: "视障人士沿盲道连续通行路径",
    pathStatus: "blocked",
    obstacles: [
      { name: "共享单车", position: "盲道中心段", blocks: "盲道连续通行路径" },
    ],
    riskLevel: "中",
    affectedGroups: ["视障人士", "老年人", "行动不便者"],
    sceneDescription:
      "盲道中心段被共享单车持续占用，连续导向被切断，需绕行机动车混行区域。",
    problemSummary:
      "盲道连续性受阻，导致视障人士无法沿导盲路径安全通行。",
    evidencePoints: [
      "障碍物位于盲道中心段",
      "占用长度超过一个步幅",
      "附近缺少等效替代路径提示",
    ],
    responsibleParty: ["城管", "街道运维单位"],
    suggestedActions: [
      "立即清理盲道占用车辆",
      "设置盲道禁停提示与地面标识",
      "高峰时段增加巡检频次",
    ],
    confidence: 0.84,
    needsHumanReview: true,
    reviewStatus: "pending",
  },
  {
    sceneType: "accessible_entrance_blocked",
    locationType: "mall",
    issueType: "无障碍入口受阻",
    blockedPath: "轮椅进入建筑的无障碍坡道入口",
    pathStatus: "blocked",
    obstacles: [
      { name: "电瓶车", position: "坡道入口前", blocks: "无障碍坡道入口净宽" },
      { name: "临时宣传架", position: "入口侧边", blocks: "转弯缓冲空间" },
    ],
    riskLevel: "高",
    affectedGroups: ["轮椅使用者", "推婴儿车人群", "老年人"],
    sceneDescription:
      "商场无障碍入口被电瓶车和宣传架共同占据，坡道入口净宽不足，轮椅难以进入建筑。",
    problemSummary:
      "无障碍入口通行能力被实质性削弱，关键通行链在入口节点中断。",
    evidencePoints: [
      "障碍物位于坡道入口正前方",
      "入口净宽受限，不满足轮椅转入需求",
      "替代入口指引不明显",
    ],
    responsibleParty: ["物业", "商场运营方"],
    suggestedActions: [
      "清理坡道入口前障碍物并保持净空",
      "将无障碍入口纳入小时级巡检清单",
      "在入口处设置固定禁停与引导标识",
    ],
    confidence: 0.88,
    needsHumanReview: true,
    reviewStatus: "pending",
  },
  {
    sceneType: "access_route_discontinuity",
    locationType: "community",
    issueType: "通行链断点",
    blockedPath: "人行道至建筑入口的连续无障碍通行链",
    pathStatus: "partial",
    obstacles: [
      { name: "临时围挡", position: "主通道中段", blocks: "连续通行路径" },
      { name: "高门槛", position: "入口处", blocks: "轮椅跨越能力" },
    ],
    riskLevel: "中",
    affectedGroups: ["轮椅使用者", "行动不便者", "推婴儿车人群"],
    sceneDescription:
      "从人行道到入口的路径出现围挡绕行与高门槛叠加问题，形成通行链断点。",
    problemSummary:
      "虽非完全封闭，但连续无障碍通行链中断，通行风险在关键节点聚集。",
    evidencePoints: [
      "主通道被临时围挡挤压",
      "入口门槛高差明显",
      "路径缺少无障碍替代导引",
    ],
    responsibleParty: ["物业", "社区"],
    suggestedActions: [
      "优化临时围挡摆放，恢复主通道净宽",
      "增设过渡坡板或消除门槛高差",
      "补充临时无障碍导引标识",
    ],
    confidence: 0.81,
    needsHumanReview: true,
    reviewStatus: "pending",
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

function modeLabel(recordMode: RecordMode): string {
  return recordMode === "inspection" ? "物业自查" : "公众记录";
}

function buildAdvocacyText(
  scenario: MockScenario,
  location: string,
  targetDepartment: TargetDepartment,
): string {
  const place = location || "该点位";
  return `【公共空间无障碍通行风险记录 · ${place}】

场景类型：${scenario.issueType}（${scenario.sceneType}）
风险等级：${scenario.riskLevel}
受阻路径：${scenario.blockedPath}
场景归类：${targetDepartment}

问题摘要：
${scenario.problemSummary}

证据要点：
${scenario.evidencePoints.map((point, i) => `${i + 1}. ${point}`).join("\n")}

建议责任方：${scenario.responsibleParty.join("、")}
建议行动：
${scenario.suggestedActions.map((action, i) => `${i + 1}. ${action}`).join("\n")}

—— 无碍 BarrierLens 公众记录模式生成（用于倡导与证据归档）`;
}

function buildInspectionText(
  scenario: MockScenario,
  location: string,
  targetDepartment: TargetDepartment,
): string {
  const place = location || "待标注点位";
  return `公共空间无障碍通行风险整改单

巡查点位：${place}
区域类型：${targetDepartment}
记录时间：${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}
场景类型：${scenario.sceneType}

一、问题摘要
${scenario.problemSummary}

二、受阻路径
${scenario.blockedPath}（状态：${scenario.pathStatus}）

三、障碍物清单
${scenario.obstacles
  .map((obstacle, i) => `${i + 1}. ${obstacle.name}｜${obstacle.position}｜影响：${obstacle.blocks}`)
  .join("\n")}

四、责任方建议
${scenario.responsibleParty.join("、")}

五、整改动作
${scenario.suggestedActions.map((action, i) => `${i + 1}. ${action}`).join("\n")}

六、复查要求
请在 3 个工作日内完成整改，并补充整改后复查照片。`;
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
    hasIssue: true,
    sceneType: scenario.sceneType,
    locationType: scenario.locationType,
    obstacles: scenario.obstacles,
    blockedPath: scenario.blockedPath,
    pathStatus: scenario.pathStatus,
    problemSummary: scenario.problemSummary,
    evidencePoints: scenario.evidencePoints,
    issueType: scenario.issueType,
    riskLevel: scenario.riskLevel,
    affectedGroups: scenario.affectedGroups,
    sceneDescription: scenario.sceneDescription,
    suggestion: scenario.suggestedActions[0],
    responsibleParty: scenario.responsibleParty,
    suggestedActions: scenario.suggestedActions,
    confidence: scenario.confidence,
    needsHumanReview: scenario.needsHumanReview,
    reviewStatus: scenario.reviewStatus,
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
  return modeLabel(recordMode);
}
