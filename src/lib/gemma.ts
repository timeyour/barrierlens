import { mockAnalyze } from "@/lib/mockAnalysis";
import type { AnalysisRequest, AnalysisResult } from "@/types/analysis";

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
              text: buildAnalysisPrompt(request.targetDepartment),
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

  const parsed = JSON.parse(content) as AnalysisResult;
  return {
    ...parsed,
    targetDepartment: request.targetDepartment,
  };
}

function buildAnalysisPrompt(targetDepartment: string): string {
  return `你是无障碍场景分析助手。请分析照片中的盲道占用情况，输出 JSON：
{
  "issueType": "盲道占用",
  "riskLevel": "低|中|高",
  "affectedGroups": ["视障人士", ...],
  "sceneDescription": "现场描述",
  "suggestion": "整改建议",
  "targetDepartment": "${targetDepartment}",
  "reportText": "面向${targetDepartment}的标准化反馈文本"
}

风险等级规则：
- 低：轻微占用，仍有明显绕行空间
- 中：盲道连续性被阻断，影响正常通行
- 高：盲道完全被阻断，且位于地铁口、医院、商场出入口等高人流区域`;
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
    request.fileName,
  );
}
