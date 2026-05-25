import { mockAnalyze } from "@/lib/mockAnalysis";
import type { AnalysisRequest, AnalysisResult, RecordMode } from "@/types/analysis";

const HUMAN_REVIEW_CONFIDENCE_THRESHOLD = 0.8;

function normalizePathStatus(raw: string | undefined): "clear" | "partial" | "blocked" {
  if (raw === "clear" || raw === "partial" || raw === "blocked") return raw;
  return "blocked";
}

function normalizeReviewStatus(
  raw: string | undefined,
): "pending" | "exported" | "reported" | "review_pending" | "fixed" | "unfixed" {
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

async function callGemmaApi(
  request: AnalysisRequest,
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMMA_API_KEY;
  const baseUrl =
    process.env.GEMMA_API_BASE_URL ?? "https://api.example.com/v1";
  const modelName = process.env.GEMMA_MODEL_NAME ?? "gemma-4";

  if (!apiKey) {
    throw new Error("GEMMA_API_KEY is not configured");
  }

  // Reserved integration point for Gemma 4 vision + structured output.
  // Expected flow:
  // 1. Send image + prompt to Gemma 4 API
  // 2. Parse structured JSON (issueType, riskLevel, affectedGroups, etc.)
  // 3. Generate department-specific reportText
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
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
    throw new Error(`Gemma API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Gemma API returned empty content");
  }

  const parsed = JSON.parse(content) as Omit<
    AnalysisResult,
    "targetDepartment" | "recordMode" | "location" | "recordedAt"
  >;
  const confidence = Number(parsed.confidence ?? 0.75);
  const needsHumanReview =
    parsed.needsHumanReview ?? confidence < HUMAN_REVIEW_CONFIDENCE_THRESHOLD;
  const recordedAt = new Date().toISOString();
  const reportText =
    request.recordMode === "inspection"
      ? parsed.inspectionText
      : parsed.advocacyText;

  return {
    ...parsed,
    hasIssue: parsed.hasIssue ?? true,
    sceneType: parsed.sceneType ?? "tactile_paving_blocked",
    locationType: parsed.locationType ?? "public_space",
    obstacles: parsed.obstacles ?? [],
    blockedPath: parsed.blockedPath ?? parsed.sceneDescription ?? "无障碍通行路径",
    pathStatus: normalizePathStatus(parsed.pathStatus),
    problemSummary: parsed.problemSummary ?? parsed.sceneDescription ?? "",
    evidencePoints: parsed.evidencePoints ?? [],
    responsibleParty: parsed.responsibleParty ?? [request.targetDepartment],
    suggestedActions: parsed.suggestedActions ?? [parsed.suggestion ?? "请人工复核后处理"],
    confidence,
    needsHumanReview,
    reviewStatus: normalizeReviewStatus(parsed.reviewStatus),
    reportText,
    targetDepartment: request.targetDepartment,
    recordMode: request.recordMode,
    location: request.location,
    recordedAt,
  };
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
  "affectedGroups": ["视障人士", ...],
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
2) “人拍照不是让 AI 看见，而是留下证据”，证据点需具体可复核。
3) 当 confidence < ${HUMAN_REVIEW_CONFIDENCE_THRESHOLD} 时 needsHumanReview 必须为 true。`;
}

export async function analyzeImage(
  request: AnalysisRequest,
): Promise<AnalysisResult> {
  if (process.env.GEMMA_API_KEY) {
    try {
      return await callGemmaApi(request);
    } catch (error) {
      console.error("Gemma API failed, falling back to mock:", error);
    }
  }

  return mockAnalyze(
    request.imageBase64,
    request.targetDepartment,
    request.recordMode,
    request.location,
    request.fileName,
  );
}
