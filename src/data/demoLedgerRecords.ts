import type { AnalysisSource, LedgerStatus, StoredRecord } from "@/types/analysis";
import { DEMO_LEDGER_ID_PREFIX } from "@/lib/ledgerStatus";

export interface DemoLedgerSeed {
  id: string;
  title: string;
  location: string;
  sceneType: StoredRecord["sceneType"];
  riskLevel: "高" | "中" | "低";
  affectedGroups: string[];
  evidenceSummary: string;
  suggestedActions: string[];
  reviewHint: string;
  status: LedgerStatus;
  createdAt: string;
  analysisSource: AnalysisSource;
  reviewResult?: string;
}

function baseRecord(seed: DemoLedgerSeed): StoredRecord {
  const suggestion = seed.suggestedActions[0] ?? "建议人工复核后确定整改方案。";
  return {
    id: seed.id,
    hasIssue: true,
    category: "capacity_demand_mismatch",
    obstacleNature:
      seed.sceneType === "tactile_paving_blocked" ? "dynamic" : "static",
    managementAction: suggestion,
    sceneType: seed.sceneType,
    locationType: "public_space",
    obstacles: [],
    blockedPath: seed.location,
    pathStatus: seed.riskLevel === "高" ? "blocked" : "partial",
    problemSummary: `【疑似问题 · AI 辅助识别】${seed.evidenceSummary}`,
    evidencePoints: [seed.evidenceSummary],
    issueType: seed.title,
    riskLevel: seed.riskLevel,
    affectedGroups: seed.affectedGroups,
    sceneDescription: seed.evidenceSummary,
    suggestion,
    responsibleParty: ["物业", "街道"],
    suggestedActions: seed.suggestedActions,
    confidence: 0.82,
    needsHumanReview: true,
    reviewStatus: seed.status,
    reviewNote: seed.reviewResult ?? seed.reviewHint,
    targetDepartment: "物业",
    reportText: `${seed.title}。${seed.evidenceSummary} 建议：${suggestion}`,
    advocacyText: `${seed.title}。${seed.evidenceSummary}`,
    inspectionText: `巡检发现：${seed.title}。${suggestion}`,
    location: seed.location,
    recordMode: "inspection",
    recordedAt: seed.createdAt,
    analysisSource: seed.analysisSource,
  };
}

export const DEMO_LEDGER_SEEDS: DemoLedgerSeed[] = [
  {
    id: `${DEMO_LEDGER_ID_PREFIX}01`,
    title: "盲道被电动车占用",
    location: "上海市浦东新区芳甸路地铁口东侧",
    sceneType: "tactile_paving_blocked",
    riskLevel: "高",
    affectedGroups: ["视障人士", "老年人"],
    evidenceSummary:
      "疑似盲道中段被多辆电动车横向占用，视障人士难以沿盲道连续通行。",
    suggestedActions: ["立即清移占用车辆", "增设高峰时段巡查与禁停标识"],
    reviewHint: "整改后请复拍盲道全景，确认连续通行恢复。",
    status: "pending_verification",
    createdAt: "2026-06-01T09:20:00+08:00",
    analysisSource: "mock",
  },
  {
    id: `${DEMO_LEDGER_ID_PREFIX}02`,
    title: "盲道被共享单车占用",
    location: "北京市朝阳区望京街道阜通东大街",
    sceneType: "tactile_paving_blocked",
    riskLevel: "中",
    affectedGroups: ["视障人士", "老年人"],
    evidenceSummary:
      "疑似共享单车集中停放在盲道侧缘，部分车轮压线，建议人工复核是否阻断通行。",
    suggestedActions: ["协调运营方清运", "划定非机动车定点停放区"],
    reviewHint: "清运后复拍，核对盲道净宽是否恢复。",
    status: "pending_remediation",
    createdAt: "2026-06-02T14:10:00+08:00",
    analysisSource: "mock",
  },
  {
    id: `${DEMO_LEDGER_ID_PREFIX}03`,
    title: "坡道缺失",
    location: "广州市天河区体育西路商场北门",
    sceneType: "accessible_entrance_blocked",
    riskLevel: "高",
    affectedGroups: ["轮椅使用者", "老年人", "婴儿车"],
    evidenceSummary:
      "疑似主入口仅有台阶无配套坡道，轮椅与婴儿车需人工抬行，建议现场复核设计条件。",
    suggestedActions: ["评估增设临时坡道或改造方案", "设置求助指引"],
    reviewHint: "改造完成后复拍入口全景，确认坡道可用。",
    status: "pending_verification",
    createdAt: "2026-06-03T11:00:00+08:00",
    analysisSource: "mock",
  },
  {
    id: `${DEMO_LEDGER_ID_PREFIX}04`,
    title: "坡道过陡",
    location: "深圳市南山区科技园南区写字楼裙楼",
    sceneType: "accessible_entrance_blocked",
    riskLevel: "中",
    affectedGroups: ["轮椅使用者", "老年人"],
    evidenceSummary:
      "疑似既有坡道坡度偏大，扶手端部缺失，建议人工测量坡度是否符合规范。",
    suggestedActions: ["加装扶手与防滑条", "必要时改造坡道长度"],
    reviewHint: "复测坡度并复拍，更新复查状态。",
    status: "pending_remediation",
    createdAt: "2026-05-28T16:30:00+08:00",
    analysisSource: "mock",
  },
  {
    id: `${DEMO_LEDGER_ID_PREFIX}05`,
    title: "扶手损坏",
    location: "杭州市西湖区文三路社区服务中心",
    sceneType: "access_route_discontinuity",
    riskLevel: "中",
    affectedGroups: ["老年人", "轮椅使用者"],
    evidenceSummary:
      "疑似无障碍通道扶手松动或缺失一段，存在跌倒风险，建议人工核查固定情况。",
    suggestedActions: ["维修或更换扶手", "复查固定点与连续性"],
    reviewHint: "维修后复拍扶手连续段，标记已整改。",
    status: "remediated",
    createdAt: "2026-05-25T10:15:00+08:00",
    analysisSource: "mock",
    reviewResult: "物业已更换扶手，待复查验收。",
  },
  {
    id: `${DEMO_LEDGER_ID_PREFIX}06`,
    title: "无障碍卫生间被杂物占用",
    location: "成都市武侯区天府大道写字楼 2 层",
    sceneType: "accessible_entrance_blocked",
    riskLevel: "高",
    affectedGroups: ["轮椅使用者", "老年人"],
    evidenceSummary:
      "疑似无障碍卫生间门前堆放过期物料，门无法完全开启，建议人工确认是否违规占用。",
    suggestedActions: ["立即清障", "建立日常巡查清单"],
    reviewHint: "清障后复拍门洞净宽，确认可正常使用。",
    status: "pending_remediation",
    createdAt: "2026-06-04T08:45:00+08:00",
    analysisSource: "mock",
  },
  {
    id: `${DEMO_LEDGER_ID_PREFIX}07`,
    title: "出入口门槛过高",
    location: "南京市鼓楼区湖南路商业街 18 号",
    sceneType: "accessible_entrance_blocked",
    riskLevel: "中",
    affectedGroups: ["轮椅使用者", "老年人"],
    evidenceSummary:
      "疑似店铺入口存在明显高差且无坡化，轮椅通行困难，建议人工测量门槛高度。",
    suggestedActions: ["增设坡道板或改造门槛", "张贴求助电话"],
    reviewHint: "复查时复拍门槛与坡道板安装情况。",
    status: "verified",
    createdAt: "2026-05-20T13:00:00+08:00",
    analysisSource: "mock",
    reviewResult: "复查通过：已增设可拆卸坡道板。",
  },
  {
    id: `${DEMO_LEDGER_ID_PREFIX}08`,
    title: "无障碍标识缺失",
    location: "武汉市江汉区中山大道公共厕所外侧",
    sceneType: "access_route_discontinuity",
    riskLevel: "低",
    affectedGroups: ["视障人士", "轮椅使用者"],
    evidenceSummary:
      "疑似无障碍设施入口缺少国标引导标识，访客不易识别，建议人工确认标识规范。",
    suggestedActions: ["补设无障碍标识与导向箭头"],
    reviewHint: "标识安装后复拍，确认可见性与位置。",
    status: "pending_verification",
    createdAt: "2026-06-03T17:20:00+08:00",
    analysisSource: "mock",
  },
  {
    id: `${DEMO_LEDGER_ID_PREFIX}09`,
    title: "施工围挡阻断通行",
    location: "西安市雁塔区小寨十字北侧慢行道",
    sceneType: "access_route_discontinuity",
    riskLevel: "高",
    affectedGroups: ["轮椅使用者", "视障人士", "老年人"],
    evidenceSummary:
      "疑似施工围挡占用人行通道且未设替代路线指引，建议人工确认是否已报批导改方案。",
    suggestedActions: ["开辟临时通行路径", "设置绕行标识"],
    reviewHint: "导改完成后复拍通道与标识。",
    status: "remediated",
    createdAt: "2026-05-18T09:00:00+08:00",
    analysisSource: "mock",
    reviewResult: "施工方已打开临时通道。",
  },
  {
    id: `${DEMO_LEDGER_ID_PREFIX}10`,
    title: "电梯口通行空间不足",
    location: "重庆市渝中区解放碑商圈 A 座大堂",
    sceneType: "access_route_discontinuity",
    riskLevel: "中",
    affectedGroups: ["轮椅使用者", "老年人"],
    evidenceSummary:
      "疑似电梯厅前堆放大件物品，回转空间不足，建议人工复核净宽是否满足轮椅回转。",
    suggestedActions: ["清理占用物", "划定禁止堆放区"],
    reviewHint: "清理后复拍电梯厅净宽，更新复查状态。",
    status: "verified",
    createdAt: "2026-05-15T15:40:00+08:00",
    analysisSource: "mock",
    reviewResult: "复查通过：通道净宽恢复，已贴禁堆标识。",
  },
];

export function buildDemoLedgerRecords(): StoredRecord[] {
  return DEMO_LEDGER_SEEDS.map((seed) => baseRecord(seed));
}

export function hasDemoLedgerRecords(records: StoredRecord[]): boolean {
  return records.some((r) => r.id.startsWith(DEMO_LEDGER_ID_PREFIX));
}
