import { mockAnalyze } from "@/lib/mockAnalysis";
import type { AnalysisRequest, AnalysisResult, RecordMode } from "@/types/analysis";

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
  const recordedAt = new Date().toISOString();
  const reportText =
    request.recordMode === "inspection"
      ? parsed.inspectionText
      : parsed.advocacyText;

  return {
    ...parsed,
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
  return `你是无障碍环境问题记录助手。请分析照片中的盲道占用情况，输出 JSON：
{
  "issueType": "盲道占用",
  "riskLevel": "低|中|高",
  "affectedGroups": ["视障人士", ...],
  "sceneDescription": "客观现场描述",
  "suggestion": "整改或关注建议",
  "advocacyText": "面向公众/公益组织的倡导摘要（含地点 ${place}，场景归类 ${targetDepartment}）",
  "inspectionText": "面向物业/商场的内部巡查整改单（含巡查点位 ${place}）"
}

当前记录模式：${recordMode === "inspection" ? "物业自查" : "公众记录"}
地点：${place}
场景归类：${targetDepartment}

风险等级规则：
- 低：轻微占用，仍有明显绕行空间
- 中：盲道连续性被阻断，影响正常通行
- 高：盲道完全被阻断，且位于高人流区域`;
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
