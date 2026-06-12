import type { AnalysisRequest, AnalysisResult } from "@/types/analysis";
import { buildAnalysisPrompt, parseAndNormalizeGemmaContent, parseDataUrl } from "@/lib/gemma";

const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_MODEL = "google/gemma-4-31b-it";
const DEFAULT_TIMEOUT_MS = 120_000;

type OpenAIChatResponse = {
  choices?: Array<{
    message?: { content?: string | null };
    finish_reason?: string;
  }>;
  error?: { message?: string };
};

function getApiKey(): string | undefined {
  return process.env.NVIDIA_API_KEY?.trim() || process.env.NIM_API_KEY?.trim();
}

function getBaseUrl(): string {
  const raw = process.env.NVIDIA_NIM_BASE_URL?.trim();
  if (!raw) return DEFAULT_BASE_URL;
  return raw.replace(/\/$/, "");
}

function getModelName(): string {
  return (
    process.env.NVIDIA_NIM_MODEL?.trim() ||
    process.env.NVIDIA_NIM_MODEL_NAME?.trim() ||
    DEFAULT_MODEL
  );
}

function getTimeoutMs(): number {
  const raw = Number(process.env.NVIDIA_NIM_TIMEOUT_MS);
  const ms =
    Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TIMEOUT_MS;
  if (process.env.VERCEL) {
    // Hobby ~60s 墙钟：NVIDIA 优先时需给 Google 回退留时间
    const cap = isNvidiaNimPreferred() ? 28_000 : 58_000;
    return Math.min(ms, cap);
  }
  return ms;
}

export function isNvidiaNimEnabled(): boolean {
  return Boolean(getApiKey());
}

/** 设为 true 时，自拍/上传优先走 NVIDIA NIM，Google 作为回退 */
export function isNvidiaNimPreferred(): boolean {
  return process.env.NVIDIA_NIM_PREFERRED === "true";
}

export function nvidiaNimProviderLabel(): string {
  return `nvidia-nim:${getModelName()}`;
}

async function requestNvidiaNimOnce(
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Missing NVIDIA_API_KEY");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${getBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`NVIDIA NIM HTTP ${response.status}: ${text.slice(0, 400)}`);
    }

    const parsed = JSON.parse(text) as OpenAIChatResponse;
    if (parsed.error?.message) {
      throw new Error(`NVIDIA NIM error: ${parsed.error.message}`);
    }

    const content = parsed.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("NVIDIA NIM returned empty content");
    }
    return content;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`NVIDIA NIM timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function analyzeWithNvidiaNim(
  request: AnalysisRequest,
): Promise<AnalysisResult> {
  const modelName = getModelName();
  const timeoutMs = getTimeoutMs();
  const prompt = buildAnalysisPrompt(
    request.targetDepartment,
    request.recordMode,
    request.location,
  );
  const { mimeType, data } = parseDataUrl(request.imageBase64);
  const imageUrl = request.imageBase64.startsWith("data:")
    ? request.imageBase64
    : `data:${mimeType};base64,${data}`;

  const content = await requestNvidiaNimOnce(
    {
      model: modelName,
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl } },
            { type: "text", text: prompt },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.1,
    },
    timeoutMs,
  );

  return parseAndNormalizeGemmaContent(content, request);
}
