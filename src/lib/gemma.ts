import { mockAnalyze } from "@/lib/mockAnalysis";
import type {
  AnalysisRequest,
  AnalysisResult,
  AnalysisSource,
  Obstacle,
  PathStatus,
  RecordMode,
  ReviewStatus,
  RiskLevel,
  SceneType,
} from "@/types/analysis";

const HUMAN_REVIEW_CONFIDENCE_THRESHOLD = 0.8;
const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const DEFAULT_MODEL_NAME = "gemma-4";
const DEFAULT_TIMEOUT_MS = 8000;

type RawAnalysis = Partial<AnalysisResult> & Record<string, unknown>;

interface ChatContentPart {
  text?: string;
  type?: string;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | ChatContentPart[];
    };
  }>;
}

export interface AnalyzeImageResponse {
  result: AnalysisResult;
  source: AnalysisSource;
  mockMode: boolean;
  modelName: string;
  provider: string;
  fallbackReason?: string;
}

function normalizePathStatus(raw: unknown): PathStatus {
  if (raw === "clear" || raw === "partial" || raw === "blocked") return raw;
  if (raw === "可通行") return "clear";
  if (raw === "部分受阻") return "partial";
  return "blocked";
}

function normalizeReviewStatus(raw: unknown): ReviewStatus {
  if (
    raw === "pending" ||
    raw === "exported" ||
    raw === "reported" ||
    raw === "review_pending" ||
    raw === "fixed" ||
    raw === "unfixed"
  ) {
    return raw;
  }
  return "pending";
}

function normalizeSceneType(raw: unknown): SceneType {
  if (
    raw === "tactile_paving_blocked" ||
    raw === "accessible_entrance_blocked" ||
    raw === "access_route_discontinuity"
  ) {
    return raw;
  }
  return "tactile_paving_blocked";
}

function normalizeRiskLevel(raw: unknown): RiskLevel {
  if (raw === "低" || raw === "中" || raw === "高") return raw;
  if (raw === "low") return "低";
  if (raw === "high") return "高";
  return "中";
}

function field(raw: RawAnalysis, ...names: string[]): unknown {
  for (const name of names) {
    if (raw[name] !== undefined) return raw[name];
  }
  return undefined;
}

function stringValue(raw: unknown, fallback: string): string {
  return typeof raw === "string" && raw.trim() ? raw.trim() : fallback;
}

function booleanValue(raw: unknown, fallback: boolean): boolean {
  return typeof raw === "boolean" ? raw : fallback;
}

function stringArray(raw: unknown, fallback: string[]): string[] {
  if (!Array.isArray(raw)) return fallback;
  const values = raw.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
  return values.length > 0 ? values : fallback;
}

function normalizeConfidence(raw: unknown): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 0.75;
  return Math.max(0, Math.min(1, value));
}

function normalizeObstacles(raw: unknown): Obstacle[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      name: stringValue(item.name, "待人工确认障碍物"),
      position: stringValue(item.position, "照片中可见通行路径附近"),
      blocks: stringValue(item.blocks, "无障碍通行路径"),
    }));
}

function cleanJsonText(content: string): string {
  const trimmed = content.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  if (start >= 0 && end > start) return withoutFence.slice(start, end + 1);
  return withoutFence;
}

function extractContent(data: ChatCompletionResponse): string {
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => part.text ?? "")
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function parseGemmaJson(content: string): RawAnalysis {
  const jsonText = cleanJsonText(content);
  return JSON.parse(jsonText) as RawAnalysis;
}

function buildDefaultAdvocacy(result: Pick<AnalysisResult, "problemSummary" | "suggestedActions">): string {
  return `该点位存在公共空间无障碍通行风险：${result.problemSummary} 建议责任方${result.suggestedActions.join("、")}。`;
}

function buildDefaultInspection(result: Pick<AnalysisResult, "problemSummary" | "suggestedActions">): string {
  return `无障碍巡查整改单：${result.problemSummary} 整改动作：${result.suggestedActions.join("；")}。`;
}

function normalizeResult(parsed: RawAnalysis, request: AnalysisRequest): AnalysisResult {
  const issueType = stringValue(field(parsed, "issueType", "issue_type"), "无障碍通行风险");
  const sceneType = normalizeSceneType(field(parsed, "sceneType", "scene_type"));
  const sceneDescription = stringValue(
    field(parsed, "sceneDescription", "scene_description"),
    "照片中存在需要人工复核的无障碍通行风险。",
  );
  const problemSummary = stringValue(
    field(parsed, "problemSummary", "problem_summary"),
    sceneDescription,
  );
  const suggestion = stringValue(
    field(parsed, "suggestion"),
    "请责任方清理障碍物，并将该点位纳入日常巡查与复查。",
  );
  const suggestedActions = stringArray(
    field(parsed, "suggestedActions", "suggested_actions"),
    [suggestion],
  );
  const confidence = normalizeConfidence(field(parsed, "confidence"));
  const needsHumanReview = booleanValue(
    field(parsed, "needsHumanReview", "needs_human_review"),
    confidence < HUMAN_REVIEW_CONFIDENCE_THRESHOLD,
  );

  const baseResult = {
    hasIssue: booleanValue(field(parsed, "hasIssue", "has_issue"), true),
    sceneType,
    locationType: stringValue(field(parsed, "locationType", "location_type"), "public_space"),
    obstacles: normalizeObstacles(field(parsed, "obstacles")),
    blockedPath: stringValue(
      field(parsed, "blockedPath", "blocked_path"),
      sceneDescription || "无障碍通行路径",
    ),
    pathStatus: normalizePathStatus(field(parsed, "pathStatus", "path_status")),
    problemSummary,
    evidencePoints: stringArray(field(parsed, "evidencePoints", "evidence_points"), [
      "现场照片显示通行路径存在障碍或断点",
      "建议人工复核具体位置与责任边界",
    ]),
    issueType,
    riskLevel: normalizeRiskLevel(field(parsed, "riskLevel", "risk_level")),
    affectedGroups: stringArray(field(parsed, "affectedGroups", "affected_groups"), [
      "视障人士",
      "老年人",
      "行动不便者",
    ]),
    sceneDescription,
    suggestion,
    responsibleParty: stringArray(
      field(parsed, "responsibleParty", "responsible_party"),
      [request.targetDepartment],
    ),
    suggestedActions,
    confidence,
    needsHumanReview,
    reviewStatus: normalizeReviewStatus(field(parsed, "reviewStatus", "review_status")),
    targetDepartment: request.targetDepartment,
    advocacyText: "",
    inspectionText: "",
    reportText: "",
    location: request.location,
    recordMode: request.recordMode,
    recordedAt: new Date().toISOString(),
  } satisfies AnalysisResult;

  const advocacyText = stringValue(
    field(parsed, "advocacyText", "advocacy_text"),
    buildDefaultAdvocacy(baseResult),
  );
  const inspectionText = stringValue(
    field(parsed, "inspectionText", "inspection_text"),
    buildDefaultInspection(baseResult),
  );

  return {
    ...baseResult,
    advocacyText,
    inspectionText,
    reportText: request.recordMode === "inspection" ? inspectionText : advocacyText,
  };
}

function buildEndpoint(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
}

function getTimeoutMs(): number {
  const raw = Number(process.env.GEMMA_API_TIMEOUT_MS);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_TIMEOUT_MS;
  return raw;
}

async function callGemmaApi(request: AnalysisRequest): Promise<AnalysisResult> {
  const apiKey = process.env.GEMMA_API_KEY;
  const baseUrl = process.env.GEMMA_API_BASE_URL ?? DEFAULT_BASE_URL;
  const modelName = process.env.GEMMA_MODEL_NAME ?? DEFAULT_MODEL_NAME;
  const timeoutMs = getTimeoutMs();

  if (!apiKey) {
    throw new Error("GEMMA_API_KEY is not configured");
  }

  const controller = new AbortController();
  const timer = windowlessTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildEndpoint(baseUrl), {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: buildAnalysisPrompt(
                  request.targetDepartment,
                  request.recordMode,
                  request.location,
                ),
              },
              {
                type: "image_url",
                image_url: { url: request.imageBase64 },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Gemma API error ${response.status}: ${message.slice(0, 300)}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const content = extractContent(data);
    if (!content) {
      throw new Error("Gemma API returned empty content");
    }

    return normalizeResult(parseGemmaJson(content), request);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Gemma API timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function windowlessTimeout(callback: () => void, timeoutMs: number): ReturnType<typeof setTimeout> {
  return setTimeout(callback, timeoutMs);
}

function buildAnalysisPrompt(
  targetDepartment: string,
  recordMode: RecordMode,
  location?: string,
): string {
  const place = location?.trim() || "未标注地点";
  return `你是“公共空间无障碍通行风险识别与证据生成”助手。请分析现场照片并只输出 JSON：
{
  "hasIssue": true,
  "sceneType": "tactile_paving_blocked|accessible_entrance_blocked|access_route_discontinuity",
  "locationType": "mall|community|street|hospital|campus|transport_hub|public_space",
  "obstacles": [{"name":"障碍物","position":"位置","blocks":"阻断对象"}],
  "blockedPath": "受阻通行路径",
  "pathStatus": "clear|partial|blocked",
  "problemSummary": "一句话问题总结",
  "evidencePoints": ["证据点1", "证据点2"],
  "responsibleParty": ["责任方1", "责任方2"],
  "suggestedActions": ["建议动作1", "建议动作2"],
  "confidence": 0.0,
  "needsHumanReview": true,
  "reviewStatus": "pending",
  "issueType": "问题类型中文名",
  "riskLevel": "低|中|高",
  "affectedGroups": ["视障人士", "轮椅使用者", "老年人", "推婴儿车人群"],
  "sceneDescription": "客观现场描述",
  "suggestion": "单句整改建议",
  "advocacyText": "面向公众/公益组织的倡导摘要（含地点 ${place}，场景归类 ${targetDepartment}）",
  "inspectionText": "面向物业/商场的内部巡查整改单（含巡查点位 ${place}）"
}

当前记录模式：${recordMode === "inspection" ? "物业自查" : "公众记录"}
地点：${place}
场景归类：${targetDepartment}

要求：
1) 重点识别三类：盲道占用、无障碍入口/坡道受阻、通行链断点。
2) 人拍照不是为了让 AI 看见，而是为了留下可整改、可归档、可复查的证据。
3) 证据点必须具体、客观、可人工复核。
4) 当 confidence < ${HUMAN_REVIEW_CONFIDENCE_THRESHOLD} 时 needsHumanReview 必须为 true。`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function analyzeImage(
  request: AnalysisRequest,
): Promise<AnalyzeImageResponse> {
  const modelName = process.env.GEMMA_MODEL_NAME ?? DEFAULT_MODEL_NAME;
  const provider = "openai-compatible";

  if (process.env.GEMMA_API_KEY) {
    try {
      return {
        result: await callGemmaApi(request),
        source: "gemma",
        mockMode: false,
        modelName,
        provider,
      };
    } catch (error) {
      const fallbackReason = errorMessage(error);
      console.error("Gemma API failed, falling back to mock:", fallbackReason);
      return {
        result: await mockAnalyze(
          request.imageBase64,
          request.targetDepartment,
          request.recordMode,
          request.location,
          request.fileName,
        ),
        source: "mock_fallback",
        mockMode: true,
        modelName,
        provider,
        fallbackReason,
      };
    }
  }

  return {
    result: await mockAnalyze(
      request.imageBase64,
      request.targetDepartment,
      request.recordMode,
      request.location,
      request.fileName,
    ),
    source: "mock",
    mockMode: true,
    modelName,
    provider,
  };
}
