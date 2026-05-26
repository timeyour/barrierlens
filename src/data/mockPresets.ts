import type {
  ObstacleNature,
  RiskLevel,
  SceneType,
  SpatialConflictCategory,
} from "@/types/analysis";

export interface MockPreset {
  id: string;
  filePatterns?: string[];
  category: SpatialConflictCategory;
  obstacleNature: ObstacleNature;
  sceneType: SceneType;
  locationType: string;
  issueType: string;
  blockedPath: string;
  pathStatus: "clear" | "partial" | "blocked";
  obstacles: { name: string; position: string; blocks: string }[];
  riskLevel: RiskLevel;
  affectedGroups: string[];
  sceneDescription: string;
  problemSummary: string;
  evidencePoints: string[];
  responsibleParty: string[];
  suggestedActions: string[];
  managementAction: string;
  confidence: number;
}

const BASE_PRESETS: Omit<MockPreset, "id">[] = [
  {
    filePatterns: ["scene-blocked-close", "scene-blocked-street"],
    category: "capacity_demand_mismatch",
    obstacleNature: "dynamic",
    sceneType: "tactile_paving_blocked",
    locationType: "transport_hub",
    issueType: "盲道动态占用",
    blockedPath: "视障人士沿盲道连续通行路径",
    pathStatus: "blocked",
    obstacles: [
      { name: "共享单车/电瓶车", position: "盲道中心段", blocks: "盲道连续通行路径" },
    ],
    riskLevel: "中",
    affectedGroups: ["视障人士", "老年人", "行动不便者"],
    sceneDescription:
      "地铁口缺乏专用停放区，高峰时段移动障碍物潮汐式占用盲道，通行链周期性断裂。",
    problemSummary:
      "基础设施容量与当代共享出行需求错配，导致盲道成为默认临停区。",
    evidencePoints: [
      "障碍物位于盲道中心段",
      "占用形态符合高峰动态潮汐特征",
      "附近缺少等效替代路径提示",
    ],
    responsibleParty: ["城管", "街道运维单位"],
    suggestedActions: [
      "高峰时段增加巡查与疏导",
      "增设定点隔离与禁停标识",
      "协调增设非机动车停放区",
    ],
    managementAction: "高峰时段保安疏导并增设定点隔离",
    confidence: 0.86,
  },
  {
    filePatterns: ["scene-blocked"],
    category: "legacy_addition_conflict",
    obstacleNature: "static",
    sceneType: "access_route_discontinuity",
    locationType: "community",
    issueType: "加建设施阻断通行链",
    blockedPath: "人行道至建筑入口的连续无障碍通行链",
    pathStatus: "partial",
    obstacles: [
      { name: "防车地锁/快递柜", position: "通道中段", blocks: "连续通行净宽" },
    ],
    riskLevel: "中",
    affectedGroups: ["轮椅使用者", "视障人士", "推婴儿车人群"],
    sceneDescription:
      "后期加装的地面设施切断原有无障碍通道，形成通行链断点。",
    problemSummary:
      "补丁式加建设施与原有无障碍路径发生冲突，连续通行能力被削弱。",
    evidencePoints: ["加建设施占据通道净宽", "绕行路径高差或宽度不足"],
    responsibleParty: ["物业", "社区"],
    suggestedActions: ["移除或移位冲突设施", "恢复通道净宽", "补充导引标识"],
    managementAction: "移位冲突设施并恢复通道净宽",
    confidence: 0.83,
  },
  {
    filePatterns: ["scene-clear"],
    category: "native_design_defect",
    obstacleNature: "static",
    sceneType: "access_route_discontinuity",
    locationType: "street",
    issueType: "原生设计硬伤",
    blockedPath: "盲道至路缘石过渡段",
    pathStatus: "partial",
    obstacles: [
      { name: "路缘坡道高差", position: "盲道末端", blocks: "轮椅/导盲杖连续过渡" },
    ],
    riskLevel: "高",
    affectedGroups: ["视障人士", "轮椅使用者"],
    sceneDescription:
      "盲道与路缘过渡高差超标，属于建设阶段未对齐规范的原生设计缺陷。",
    problemSummary:
      "基础设施原生硬伤导致通行链在节点处中断，非临时占用所致。",
    evidencePoints: ["过渡高差明显", "缺少合规坡道衔接"],
    responsibleParty: ["住建", "街道"],
    suggestedActions: ["上报职能部门联合微更新", "增设合规坡道", "纳入改造台账"],
    managementAction: "建议上报住建/残联联合规划微更新",
    confidence: 0.89,
  },
  {
    category: "native_design_defect",
    obstacleNature: "static",
    sceneType: "tactile_paving_blocked",
    locationType: "street",
    issueType: "盲道原生设计缺陷",
    blockedPath: "盲道导向路径",
    pathStatus: "blocked",
    obstacles: [{ name: "电线杆/标牌杆", position: "盲道正中", blocks: "盲道连续导向" }],
    riskLevel: "高",
    affectedGroups: ["视障人士"],
    sceneDescription: "盲道导向路径上存在固定杆件，属于建设阶段布局错误。",
    problemSummary: "盲道连续性被固定市政设施永久切断。",
    evidencePoints: ["杆件位于盲道中心", "无绕行提示"],
    responsibleParty: ["城管", "电力/通信运维"],
    suggestedActions: ["协调杆件迁移", "补充触觉导向绕行提示"],
    managementAction: "建议上报职能部门联合规划微更新",
    confidence: 0.9,
  },
  {
    category: "legacy_addition_conflict",
    obstacleNature: "static",
    sceneType: "accessible_entrance_blocked",
    locationType: "mall",
    issueType: "入口加建冲突",
    blockedPath: "轮椅进入建筑的无障碍坡道入口",
    pathStatus: "blocked",
    obstacles: [
      { name: "消防栓/变电箱", position: "坡道侧", blocks: "入口净宽与转弯空间" },
    ],
    riskLevel: "高",
    affectedGroups: ["轮椅使用者", "老年人"],
    sceneDescription: "后期加装的设备箱体挤占无障碍入口缓冲空间。",
    problemSummary: "加建设施与无障碍入口净宽要求冲突。",
    evidencePoints: ["设备箱体贴近坡道", "转弯半径不足"],
    responsibleParty: ["物业", "商场运营方"],
    suggestedActions: ["调整设备位置", "保障入口净宽", "小时级巡检"],
    managementAction: "调整设备位置保障入口净宽",
    confidence: 0.87,
  },
  {
    category: "capacity_demand_mismatch",
    obstacleNature: "dynamic",
    sceneType: "accessible_entrance_blocked",
    locationType: "mall",
    issueType: "入口动态占用",
    blockedPath: "商场无障碍入口通道",
    pathStatus: "blocked",
    obstacles: [
      { name: "外卖电动车", position: "入口前", blocks: "无障碍入口" },
      { name: "临时宣传架", position: "入口侧边", blocks: "转弯缓冲" },
    ],
    riskLevel: "高",
    affectedGroups: ["轮椅使用者", "推婴儿车人群"],
    sceneDescription: "商场入口缺乏外卖临停区，配送车辆高峰占用无障碍通道。",
    problemSummary: "商业客流与即时配送需求错配，入口通行链频繁中断。",
    evidencePoints: ["多类移动障碍物叠加", "入口净宽受限"],
    responsibleParty: ["商场运营方", "物业"],
    suggestedActions: ["划定外卖临停区", "高峰疏导", "入口禁停标识"],
    managementAction: "划定外卖临停区并高峰疏导",
    confidence: 0.88,
  },
];

function expandPresets(): MockPreset[] {
  const variants = [
    { suffix: "a", riskLevel: "中" as RiskLevel, confidence: 0.84 },
    { suffix: "b", riskLevel: "高" as RiskLevel, confidence: 0.88 },
    { suffix: "c", riskLevel: "低" as RiskLevel, confidence: 0.78 },
  ];

  const presets: MockPreset[] = [];
  let index = 0;

  for (const base of BASE_PRESETS) {
    for (const variant of variants) {
      if (presets.length >= 30) break;
      presets.push({
        ...base,
        id: `preset-${String(index + 1).padStart(2, "0")}`,
        riskLevel: variant.riskLevel,
        confidence: variant.confidence,
        filePatterns: index === 0 ? base.filePatterns : undefined,
      });
      index += 1;
    }
  }

  while (presets.length < 30) {
    const base = BASE_PRESETS[presets.length % BASE_PRESETS.length];
    presets.push({
      ...base,
      id: `preset-${String(presets.length + 1).padStart(2, "0")}`,
      sceneDescription: `${base.sceneDescription}（样例 ${presets.length + 1}）`,
    });
  }

  return presets.slice(0, 30);
}

export const MOCK_PRESETS: MockPreset[] = expandPresets();

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function pickMockPreset(fileName?: string, seed?: string): MockPreset {
  const name = fileName?.toLowerCase() ?? "";
  if (name) {
    const matched = MOCK_PRESETS.find((preset) =>
      preset.filePatterns?.some((pattern) => name.includes(pattern)),
    );
    if (matched) return matched;
  }
  const index = hashString(fileName ?? seed ?? "default") % MOCK_PRESETS.length;
  return MOCK_PRESETS[index];
}
