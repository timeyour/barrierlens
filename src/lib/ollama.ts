import type { AnalysisRequest, AnalysisResult } from "@/types/analysis";
import { buildAnalysisPrompt, parseAndNormalizeGemmaContent, parseDataUrl } from "@/lib/gemma";

const DEFAULT_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_MODEL = "gemma4:latest";
const DEFAULT_TIMEOUT_MS = 240_000;

type OllamaChatResponse = {
  message?: { content?: string };
  error?: string;
};

function getBaseUrl(): string {
  return process.env.OLLAMA_BASE_URL?.trim() || DEFAULT_BASE_URL;
}

function getModelName(): string {
  return process.env.OLLAMA_MODEL?.trim() || DEFAULT_MODEL;
}

function getTimeoutMs(): number {
  const raw = Number(process.env.OLLAMA_TIMEOUT_MS);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_TIMEOUT_MS;
  return raw;
}

export function isOllamaEnabled(): boolean {
  if (process.env.NODE_ENV === "production" && process.env.OLLAMA_ENABLED !== "true") {
    return false;
  }
  if (process.env.OLLAMA_ENABLED === "false") return false;
  if (process.env.OLLAMA_ENABLED === "true") return true;
  if (process.env.OLLAMA_PREFERRED === "true") return true;
  if (process.env.OLLAMA_MODEL?.trim()) return true;
  // 本地开发默认可尝试本机 Ollama（Vercel 上 localhost 探测会快速失败）
  return process.env.NODE_ENV !== "production";
}

export function isOllamaPreferred(): boolean {
  return process.env.OLLAMA_PREFERRED === "true";
}

export async function isOllamaReachable(timeoutMs = 2000): Promise<boolean> {
  if (!isOllamaEnabled()) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${getBaseUrl()}/api/tags`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function requestOllamaOnce(
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${getBaseUrl()}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Ollama HTTP ${response.status}: ${text.slice(0, 400)}`);
    }

    const parsed = JSON.parse(text) as OllamaChatResponse;
    if (parsed.error) {
      throw new Error(`Ollama error: ${parsed.error}`);
    }

    const content = parsed.message?.content?.trim();
    if (!content) {
      throw new Error("Ollama returned empty content");
    }
    return content;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Ollama timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function analyzeWithOllama(
  request: AnalysisRequest,
): Promise<AnalysisResult> {
  const modelName = getModelName();
  const timeoutMs = getTimeoutMs();
  const prompt = buildAnalysisPrompt(
    request.targetDepartment,
    request.recordMode,
    request.location,
  );
  const { data } = parseDataUrl(request.imageBase64);

  const content = await requestOllamaOnce(
    {
      model: modelName,
      stream: false,
      format: "json",
      think: false,
      messages: [
        {
          role: "user",
          content: prompt,
          images: [data],
        },
      ],
      options: {
        temperature: 0.2,
        num_predict: 1024,
      },
    },
    timeoutMs,
  );

  return parseAndNormalizeGemmaContent(content, request);
}

export function ollamaProviderLabel(): string {
  return `ollama-local:${getModelName()}`;
}
