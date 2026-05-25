import {
  PATH_STATUS_LABELS,
  SCENE_TYPE_LABELS,
  type AnalysisResult,
} from "@/types/analysis";

export type PipelineStepStatus = "pending" | "active" | "done";

export interface PipelineStep {
  id: string;
  label: string;
  detail?: string;
  status: PipelineStepStatus;
}

const STEP_DEFS = [
  { id: "vision", label: "读取现场图像" },
  { id: "scene", label: "识别无障碍场景类型" },
  { id: "obstacles", label: "检测障碍物与占用位置" },
  { id: "path", label: "评估通行路径与风险等级" },
  { id: "stakeholders", label: "推断影响群体与责任方" },
  { id: "json", label: "生成结构化 JSON 输出" },
] as const;

export function createRunningSteps(activeIndex: number): PipelineStep[] {
  return STEP_DEFS.map((step, index) => ({
    ...step,
    detail:
      index < activeIndex
        ? "已完成"
        : index === activeIndex
          ? "Gemma 4 推理中…"
          : undefined,
    status:
      index < activeIndex ? "done" : index === activeIndex ? "active" : "pending",
  }));
}

export function buildStepsFromResult(result: AnalysisResult): PipelineStep[] {
  const obstacleText =
    result.obstacles.length > 0
      ? result.obstacles.map((o) => o.name).join("、")
      : "未检测到显著障碍物";

  return [
    {
      id: "vision",
      label: "读取现场图像",
      detail: "多模态视觉输入已解析",
      status: "done",
    },
    {
      id: "scene",
      label: "识别无障碍场景类型",
      detail: SCENE_TYPE_LABELS[result.sceneType],
      status: "done",
    },
    {
      id: "obstacles",
      label: "检测障碍物与占用位置",
      detail: obstacleText,
      status: "done",
    },
    {
      id: "path",
      label: "评估通行路径与风险等级",
      detail: `${PATH_STATUS_LABELS[result.pathStatus]} · ${result.riskLevel}风险`,
      status: "done",
    },
    {
      id: "stakeholders",
      label: "推断影响群体与责任方",
      detail: `${result.affectedGroups.join("、")} → ${result.responsibleParty.join("、")}`,
      status: "done",
    },
    {
      id: "json",
      label: "生成结构化 JSON 输出",
      detail: `confidence ${Math.round(result.confidence * 100)}%${result.needsHumanReview ? " · 建议人工复核" : ""}`,
      status: "done",
    },
  ];
}

export const PIPELINE_STEP_COUNT = STEP_DEFS.length;
