import type { RecordMode, TargetDepartment } from "@/types/analysis";

export type NextStepItem = {
  title: string;
  detail: string;
};

type DeliveryHints = Record<
  TargetDepartment,
  { public: string; inspection: string }
>;

/** 按责任方给出递送建议（概括表述，不含具体联系方式） */
export const DELIVERY_HINTS: DeliveryHints = {
  物业: {
    public: "小区或楼宇物业管理处、管家/前台、业主群（请陈述事实，避免人身攻击）",
    inspection: "保洁班长、保安队长或工程部——作为内部巡查整改单派发",
  },
  社区: {
    public: "社区居委会、网格员或街道公共服务窗口",
    inspection: "社区物业协调员或街道指定的网格巡查岗位",
  },
  商场: {
    public: "商场服务台、运营方客服或无障碍设施管理岗",
    inspection: "商场运营、保安或工程维护团队",
  },
  城管: {
    public: "当地 12345 政务服务热线或城管部门公开受理渠道（按官方要求提交材料）",
    inspection: "辖区城管对接人或物业联勤机制（如本单位有约定流程）",
  },
};

const PUBLIC_STEPS: Omit<NextStepItem, "detail">[] = [
  { title: "核对内容" },
  { title: "复制或导出" },
  { title: "标记已反馈" },
  { title: "安排复查" },
];

const INSPECTION_STEPS: Omit<NextStepItem, "detail">[] = [
  { title: "核对整改单" },
  { title: "内部派单" },
  { title: "限期整改" },
  { title: "复拍结案" },
];

export function buildReportNextSteps(
  recordMode: RecordMode,
  targetDepartment: TargetDepartment,
): NextStepItem[] {
  const delivery = DELIVERY_HINTS[targetDepartment][recordMode];
  const templates = recordMode === "inspection" ? INSPECTION_STEPS : PUBLIC_STEPS;

  if (recordMode === "inspection") {
    return [
      {
        title: templates[0].title,
        detail:
          "确认问题类型、风险等级与障碍物描述与现场一致；地点宜概括描述。",
      },
      {
        title: templates[1].title,
        detail: `将导出的整改单发给：${delivery}`,
      },
      {
        title: templates[2].title,
        detail: "建议 3 个工作日内完成清理或设置禁停等措施，并留存过程记录。",
      },
      {
        title: templates[3].title,
        detail:
          "整改后在「问题记录」上传复拍照片，将状态更新为「已整改」或「未整改」。",
      },
    ];
  }

  return [
    {
      title: templates[0].title,
      detail:
        "确认 AI 摘要、地点（宜概括，避免精确门牌）与照片是否准确；分享前避免可识别路人面部、车牌。",
    },
    {
      title: templates[1].title,
      detail: `复制或导出 Markdown 后，发给：${delivery}`,
    },
    {
      title: templates[2].title,
      detail:
        "递出后在「问题记录」将该条标记为「已反馈」。复制/导出后系统可自动标记为「已导出」。",
    },
    {
      title: templates[3].title,
      detail:
        "约 7 天后到同一地点再拍，在时间线更新为「待复查」→「已整改」或「未整改」。同一地点多条记录更有助于推动关注。",
    },
  ];
}

export const NEXT_STEPS_DISCLAIMER =
  "本工具不代为投诉或执法，是否受理取决于接收方；AI 输出须人工核对后再对外使用。";
