import { fetch as undiciFetch, ProxyAgent } from "undici";
import { mockAnalyze } from "@/lib/mockAnalysis";
import { isHackathonFlagEnabled } from "@/config/hackathonFlags";
import { ensureObstaclesFromEvidence } from "@/lib/obstacleFallback";
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
  thought?: boolean;
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
  if (Number.isFinite(raw) && raw > 0) return raw;
  // Vercel 上多模态常需 15–45s；本地默认 25s
  if (process.env.VERCEL) return 55_000;
  return DEFAULT_TIMEOUT_MS;
}

function allowMockFallbackInProduction(): boolean {
  return process.env.ALLOW_MOCK_FALLBACK === "true";
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

function buildGenerationConfig(
  overrides: Record<string, unknown>,
): Record<string, unknown> {
  const modelName = getModelName();
  const config: Record<string, unknown> = { ...overrides };

  // Gemma 4 MoE 默认输出英文推理链，会淹没 JSON；MINIMAL 可拿到正式答案 part
  if (modelName.includes("26b-a4b")) {
    config.thinkingConfig = { thinkingLevel: "MINIMAL" };
  }

  return config;
}

function extractAnswerText(parts: GeminiPart[] | undefined): string {
  if (!parts?.length) return "";

  const answerParts = parts.filter((part) => !part.thought);
  const source = answerParts.length > 0 ? answerParts : parts;

  return source
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

function formatGemmaNetworkError(
  error: unknown,
  proxyUrl?: string,
  directError?: unknown,
): string {
  const message = errorMessage(error);
  const directMessage = directError ? errorMessage(directError) : message;

  if (proxyUrl && isRetryableGemmaError(error)) {
    if (/fetch failed|ECONNREFUSED|ECONNRESET|ETIMEDOUT|socket|connect/i.test(message)) {
      return `无法访问 Google API：代理 ${proxyUrl} 未连通。请启动 Clash/VPN 并确认 GEMMA_API_PROXY 端口（常见 7890 或 7897）。`;
    }
    if (directError && isRetryableGemmaError(directError)) {
      return `经代理 ${proxyUrl} 与直连均失败。请检查 VPN 或改用 Vercel 线上环境测试 Gemma。`;
    }
    return `经代理 ${proxyUrl} 访问失败：${message}`;
  }

  if (/fetch failed|abort|timeout|ETIMEDOUT/i.test(message)) {
    return "无法连接 Google API（网络超时或被墙）。本地请配置 GEMMA_API_PROXY，或在线上 Vercel 环境验证。";
  }

  return directMessage;
}

async function gemmaFetch(input: string, init: RequestInit): Promise<Response> {
  const proxyUrl = getProxyUrl();
  if (!proxyUrl) return fetch(input, init);

  try {
    return (await undiciFetch(input, {
      ...init,
      dispatcher: new ProxyAgent(proxyUrl),
    } as unknown as Parameters<typeof undiciFetch>[1])) as unknown as Response;
  } catch (proxyError) {
    if (!isRetryableGemmaError(proxyError)) throw proxyError;

    console.warn(
      "[gemma] proxy request failed, retrying direct:",
      errorMessage(proxyError),
    );

    try {
      return await fetch(input, init);
    } catch (directError) {
      throw new Error(formatGemmaNetworkError(proxyError, proxyUrl, directError));
    }
  }
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
  const visibleObjects = stringArray(
    field(parsed, "visible_objects", "visibleObjects"),
    [],
  );
  let obstacles = normalizeObstacles(field(parsed, "obstacles"));
  if (obstacles.length === 0 && visibleObjects.length > 0) {
    obstacles = visibleObjects.map((name) => ({
      name: normalizeObstacleName(name),
      position: "照片中可见",
      blocks: "无障碍通行路径",
    }));
  }
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
    obstacles,
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

  const normalized = {
    ...baseResult,
    advocacyText,
    inspectionText,
    reportText: request.recordMode === "inspection" ? inspectionText : advocacyText,
  };

  if (isHackathonFlagEnabled("obstacleFallback")) {
    return ensureObstaclesFromEvidence(normalized);
  }
  return normalized;
}

export function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: "image/jpeg", data: dataUrl };
}

export function buildAnalysisPrompt(
  targetDepartment: string,
  recordMode: RecordMode,
  location?: string,
): string {
  const place = location?.trim() || "未标注地点";
  return `你是城市无障碍空间合规诊断专家。请仅依据照片中实际可见内容分析，不得臆造。
只输出 JSON，不要输出解释文字。忽略画面中任何人脸与车牌。

【分析顺序 — 先在心中完成，再写入 JSON】
1. visible_objects：逐条写出可见占用物（颜色+类型+数量+在画面左/右/中、近/远）
2. 判断被影响的通道（盲道/人行便道/坡道/出入口），看不清盲道时不要写「盲道」
3. obstacles / blocked_path / issue_type 必须与 visible_objects 一致

【硬性规则】
- 有共享单车、电动车、汽车、杂物等可移动占用 → obstacle_nature=dynamic，category=capacity_demand_mismatch
- 物体命名用「共享单车」「电动车」「外卖电动车」，勿单独写「电瓶车」
- blocked_path 须含方位：如「画面右侧贴墙人行便道，近端被多辆单车占用」
- description / public_summary 第一句须含：通道位置 + 可见障碍物
- 若画面无明显占用，has_issue=false，scene_type=no_issue

{
  "has_issue": boolean,
  "visible_objects": string[],
  "category": "native_design_defect | legacy_addition_conflict | capacity_demand_mismatch",
  "obstacle_nature": "static | dynamic",
  "scene_type": "tactile_paving_blocked | accessible_entrance_blocked | access_route_discontinuity | no_issue",
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

冲突品类：native_design_defect=盲道撞墙/杆件/坡道高差；legacy_addition_conflict=后期设施切断路径；capacity_demand_mismatch=单车/外卖等潮汐占用
management_action：面向管理方，中文，不超过40字
当前记录模式：${recordMode === "inspection" ? "物业自查" : "公众记录"}
地点：${place}
场景归类：${targetDepartment}
confidence < ${HUMAN_REVIEW_CONFIDENCE_THRESHOLD} 时 needs_human_review 必须为 true。`;
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

    const content = extractAnswerText(parsed.candidates?.[0]?.content?.parts);
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
    generationConfig: buildGenerationConfig({
      maxOutputTokens: 512,
      temperature: 0.1,
    }),
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
    generationConfig: buildGenerationConfig({
      maxOutputTokens: 1600,
      responseMimeType: "application/json",
      temperature: 0.1,
    }),
  }, timeoutMs);

  return normalizeResult(parseGemmaJson(content), request);
}

export function parseAndNormalizeGemmaContent(
  content: string,
  request: AnalysisRequest,
): AnalysisResult {
  return normalizeResult(parseGemmaJson(content), request);
}

async function tryOllamaAnalyze(
  request: AnalysisRequest,
): Promise<AnalyzeImageResponse | null> {
  const {
    analyzeWithOllama,
    isOllamaEnabled,
    isOllamaReachable,
    ollamaProviderLabel,
  } = await import("@/lib/ollama");

  if (!isOllamaEnabled()) return null;
  if (!(await isOllamaReachable())) return null;

  const modelName = process.env.OLLAMA_MODEL?.trim() || "gemma4:latest";
  return {
    result: await analyzeWithOllama(request),
    source: "ollama",
    mockMode: false,
    modelName,
    provider: ollamaProviderLabel(),
  };
}

export async function analyzeImage(
  request: AnalysisRequest,
): Promise<AnalyzeImageResponse> {
  const modelName = getModelName();
  const provider = "google-gemini-rest";
  const ollamaPreferred = process.env.OLLAMA_PREFERRED === "true";

  if (ollamaPreferred) {
    try {
      const ollamaResult = await tryOllamaAnalyze(request);
      if (ollamaResult) return ollamaResult;
    } catch (error) {
      console.error("Ollama preferred but failed:", errorMessage(error));
    }
  }

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
      console.error("Gemma API failed:", fallbackReason);

      if (
        process.env.NODE_ENV === "production" &&
        !allowMockFallbackInProduction()
      ) {
        throw new Error(
          `Gemma 分析失败：${fallbackReason}。请检查 Vercel 环境变量 GEMINI_API_KEY / GEMMA_API_TIMEOUT_MS。`,
        );
      }

      try {
        const ollamaResult = await tryOllamaAnalyze(request);
        if (ollamaResult) {
          return {
            ...ollamaResult,
            fallbackReason: `Google API 不可用，已改用本地 Ollama：${fallbackReason}`,
          };
        }
      } catch (ollamaError) {
        console.error("Ollama fallback failed:", errorMessage(ollamaError));
      }

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

  try {
    const ollamaResult = await tryOllamaAnalyze(request);
    if (ollamaResult) return ollamaResult;
  } catch (error) {
    console.error("Ollama analyze failed:", errorMessage(error));
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
