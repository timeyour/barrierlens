import { fetch as undiciFetch, ProxyAgent } from "undici";
import { mockAnalyze } from "@/lib/mockAnalysis";
import type {
  AnalysisRequest,
  AnalysisResult,
  AnalysisSource,
  Obstacle,
  ObstacleNature,
  PathStatus,
  RecordMode,
  ReviewStatus,
  RiskLevel,
  SceneType,
  SpatialConflictCategory,
} from "@/types/analysis";

const HUMAN_REVIEW_CONFIDENCE_THRESHOLD = 0.8;
const DEFAULT_MODEL_NAME = "gemma-4-26b-a4b-it";
const DEFAULT_TIMEOUT_MS = 25000;
const DEFAULT_RETRY_ATTEMPTS = 2;

type RawAnalysis = Partial<AnalysisResult> & Record<string, unknown>;
type GeminiPart = {
  text?: string;
};
type GeminiRestResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

export interface AnalyzeImageResponse {
  result: AnalysisResult;
  source: AnalysisSource;
  mockMode: boolean;
  modelName: string;
  provider: string;
  fallbackReason?: string;
}

function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY;
}

function getModelName(): string {
  return process.env.GEMMA_MODEL_NAME || DEFAULT_MODEL_NAME;
}

function getTimeoutMs(): number {
  const raw = Number(process.env.GEMMA_API_TIMEOUT_MS);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_TIMEOUT_MS;
  return raw;
}

function getRetryAttempts(): number {
  const raw = Number(process.env.GEMMA_API_RETRY_ATTEMPTS);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_RETRY_ATTEMPTS;
  return Math.max(1, Math.min(3, Math.floor(raw)));
}

function getProxyUrl(): string | undefined {
  return (
    process.env.GEMMA_API_PROXY ||
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.ALL_PROXY ||
    process.env.https_proxy ||
    process.env.http_proxy ||
    process.env.all_proxy
  );
}

function gemmaFetch(input: string, init: RequestInit): Promise<Response> {
  const proxyUrl = getProxyUrl();
  if (!proxyUrl) return fetch(input, init);

  return undiciFetch(input, {
    ...init,
    dispatcher: new ProxyAgent(proxyUrl),
  } as unknown as Parameters<typeof undiciFetch>[1]) as unknown as Promise<Response>;
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
  const value = typeof raw === "string" ? raw : "";
  if (value === "blind_path_blocked") return "tactile_paving_blocked";
  if (value === "path_chain_broken") return "access_route_discontinuity";
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
  if (raw === "medium") return "中";
  if (raw === "high") return "高";
  return "中";
}

function normalizeSpatialCategory(raw: unknown): SpatialConflictCategory {
  const value = typeof raw === "string" ? raw : "";
  if (
    value === "native_design_defect" ||
    value === "legacy_addition_conflict" ||
    value === "capacity_demand_mismatch"
  ) {
    return value;
  }
  return "capacity_demand_mismatch";
}

function normalizeObstacleNature(raw: unknown): ObstacleNature {
  if (raw === "static" || raw === "dynamic") return raw;
  return "dynamic";
}

function inferCategoryFromScene(sceneType: SceneType, nature: ObstacleNature): SpatialConflictCategory {
  if (sceneType === "access_route_discontinuity") {
    return nature === "dynamic" ? "legacy_addition_conflict" : "native_design_defect";
  }
  if (sceneType === "accessible_entrance_blocked") {
    return "legacy_addition_conflict";
  }
  return "capacity_demand_mismatch";
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

function normalizeObstacleName(name: string): string {
  return name
    .replace(/共享单车\/电瓶车/g, "共享单车、电动车")
    .replace(/电瓶车/g, "电动车");
}

function normalizeObstacles(raw: unknown): Obstacle[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => {
      if (typeof item === "string") {
        return {
          name: normalizeObstacleName(item),
          position: "照片中可见通行路径附近",
          blocks: "无障碍通行路径",
        };
      }
      return {
        name: normalizeObstacleName(stringValue(item.name, "待人工确认障碍物")),
        position: stringValue(item.position, "照片中可见通行路径附近"),
        blocks: stringValue(item.blocks, "无障碍通行路径"),
      };
    });
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

function parseGemmaJson(content: string): RawAnalysis {
  const jsonText = cleanJsonText(content);
  return JSON.parse(jsonText) as RawAnalysis;
}

function buildDefaultAdvocacy(result: Pick<AnalysisResult, "problemSummary" | "suggestedActions">): string {
  return `该点位存在公共空间无障碍通行风险：${result.problemSummary} 建议责任方${result.suggestedActions.join("、")}。`;
}

function buildDefaultInspection(result: Pick<AnalysisResult, "problemSummary" | "suggestedActions" | "managementAction">): string {
  return `无障碍通行空间合规诊断与管理建议书：${result.problemSummary} 管理建议：${result.managementAction}；整改动作：${result.suggestedActions.join("；")}。`;
}

function normalizeResult(parsed: RawAnalysis, request: AnalysisRequest): AnalysisResult {
  const issueType = stringValue(field(parsed, "issueType", "issue_type"), "无障碍通行风险");
  const sceneType = normalizeSceneType(field(parsed, "sceneType", "scene_type"));
  const obstacleNature = normalizeObstacleNature(
    field(parsed, "obstacleNature", "obstacle_nature"),
  );
  const category = normalizeSpatialCategory(
    field(parsed, "category") ?? inferCategoryFromScene(sceneType, obstacleNature),
  );
  const managementAction = stringValue(
    field(parsed, "managementAction", "management_action"),
    stringArray(field(parsed, "suggestedActions", "suggested_actions"), [
      "请责任方清理障碍物，并将该点位纳入日常巡查与复查。",
    ])[0] ?? "请责任方清理障碍物，并将该点位纳入日常巡查与复查。",
  );
  const sceneDescription = stringValue(
    field(parsed, "sceneDescription", "scene_description", "description"),
    "照片中存在需要人工复核的无障碍通行风险。",
  );
  const problemSummary = stringValue(
    field(parsed, "problemSummary", "problem_summary", "public_summary", "description"),
    sceneDescription,
  );
  const suggestion = stringValue(
    field(parsed, "suggestion", "management_action"),
    managementAction,
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
    category,
    obstacleNature,
    managementAction,
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
    field(parsed, "advocacyText", "advocacy_text", "public_summary"),
    buildDefaultAdvocacy(baseResult),
  );
  const inspectionText = stringValue(
    field(parsed, "inspectionText", "inspection_text", "property_work_order"),
    buildDefaultInspection(baseResult),
  );

  return {
    ...baseResult,
    advocacyText,
    inspectionText,
    reportText: request.recordMode === "inspection" ? inspectionText : advocacyText,
  };
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: "image/jpeg", data: dataUrl };
}

function buildAnalysisPrompt(
  targetDepartment: string,
  recordMode: RecordMode,
  location?: string,
): string {
  const place = location?.trim() || "未标注地点";
  return `你是城市无障碍空间合规诊断专家。请从「城市新旧功能演进与空间规划冲突」视角分析现场照片。
只输出 JSON，不要输出解释文字。忽略画面中任何人脸与车牌信息。

【照片忠实原则 — 必须遵守】
1. 仅依据照片中实际可见内容判断，不得臆造画面中不存在的路缘高差、坡道缺失或固定设施。
2. 若画面中出现共享单车、电动车、外卖电动车、汽车、杂物等可移动物体占用通道，obstacle_nature 必须为 dynamic，category 优先 capacity_demand_mismatch，scene_type 优先 blind_path_blocked。
3. obstacles 必须列出照片中可见的具体物体；命名优先用国内常用词「共享单车」「电动车」「外卖电动车」，勿单独使用「电瓶车」而不写「电动车」。
4. issue_type 应点明可见占用物与路径类型，如「共享单车占用右侧人行便道」；若看不清黄色盲道，写「人行便道」勿强行写「盲道」。
5. blocked_path 必须回答「哪条路/哪段通道」：结合画面方位（左/右/中、贴墙/临机动车道/近路口）描述可见步行通道；禁止只写「视障人士沿盲道连续通行路径」等空泛模板句。
6. description / public_summary 第一句须含：路径位置 + 可见障碍物。

字段如下：
{
  "has_issue": boolean,
  "category": "native_design_defect | legacy_addition_conflict | capacity_demand_mismatch",
  "obstacle_nature": "static | dynamic",
  "scene_type": "blind_path_blocked | accessible_entrance_blocked | path_chain_broken | no_issue",
  "issue_type": string,
  "risk_level": "low | medium | high",
  "affected_groups": string[],
  "obstacles": string[],
  "blocked_path": string,
  "evidence_points": string[],
  "suggested_actions": string[],
  "description": string,
  "management_action": string,
  "public_summary": string,
  "property_work_order": string,
  "confidence": number,
  "needs_human_review": boolean
}

冲突品类：
1. native_design_defect：盲道撞墙/杆件、坡道高差等原生设计硬伤
2. legacy_addition_conflict：后期消防栓、快递柜、地锁等切断无障碍路径
3. capacity_demand_mismatch：地铁口缺停放区导致单车/外卖潮汐占用盲道

obstacle_nature：static=固定硬伤；dynamic=高频易逝移动占用
blocked_path 示例（好）：「画面右侧贴墙人行便道，介于机动车道与围墙之间，近端被占用」
blocked_path 反例（差）：「视障人士沿盲道连续通行路径」
management_action：面向管理方的合规建议，中文，不超过40字

当前记录模式：${recordMode === "inspection" ? "物业自查" : "公众记录"}
地点：${place}
场景归类：${targetDepartment}
当 confidence < ${HUMAN_REVIEW_CONFIDENCE_THRESHOLD} 时 needs_human_review 必须为 true。`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isRetryableGemmaError(error: unknown): boolean {
  const message = errorMessage(error);
  return /fetch failed|ECONNRESET|ETIMEDOUT|UND_ERR|network|socket/i.test(message);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestGemmaContentOnce(
  apiKey: string,
  modelName: string,
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await gemmaFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Gemma API HTTP ${response.status}: ${text.slice(0, 500)}`);
    }

    const parsed = JSON.parse(text) as GeminiRestResponse;
    if (parsed.error) {
      throw new Error(
        `Gemma API ${parsed.error.status ?? parsed.error.code ?? "error"}: ${parsed.error.message ?? "unknown error"}`,
      );
    }

    const content = parsed.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();
    if (!content) {
      throw new Error("Gemma API returned empty content");
    }
    return content;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Gemma API timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function requestGemmaContent(
  apiKey: string,
  modelName: string,
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<string> {
  const attempts = getRetryAttempts();
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await requestGemmaContentOnce(apiKey, modelName, body, timeoutMs);
    } catch (error) {
      lastError = error;
      if (attempt >= attempts || !isRetryableGemmaError(error)) throw error;
      await wait(350 * attempt);
    }
  }

  throw lastError;
}

export async function callGemmaText(prompt: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  return requestGemmaContent(apiKey, getModelName(), {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 512,
      temperature: 0.2,
    },
  }, getTimeoutMs());
}

async function callGemmaApi(request: AnalysisRequest): Promise<AnalysisResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const modelName = getModelName();
  const timeoutMs = getTimeoutMs();
  const prompt = buildAnalysisPrompt(
    request.targetDepartment,
    request.recordMode,
    request.location,
  );
  const { mimeType, data } = parseDataUrl(request.imageBase64);

  const content = await requestGemmaContent(apiKey, modelName, {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, { inlineData: { mimeType, data } }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 1400,
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  }, timeoutMs);

  return normalizeResult(parseGemmaJson(content), request);
}

export async function analyzeImage(
  request: AnalysisRequest,
): Promise<AnalyzeImageResponse> {
  const modelName = getModelName();
  const provider = "google-gemini-rest";

  if (getApiKey()) {
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
