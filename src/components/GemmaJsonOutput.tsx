"use client";

import { formatGemmaJson } from "@/lib/analysisJson";
import type { AnalysisResult, AnalysisSource } from "@/types/analysis";
import { useState } from "react";

interface GemmaJsonOutputProps {
  result: AnalysisResult;
  mockMode?: boolean;
  source?: AnalysisSource | null;
  modelName?: string | null;
  fallbackReason?: string | null;
}

export default function GemmaJsonOutput({
  result,
  mockMode = false,
  source,
  modelName,
  fallbackReason,
}: GemmaJsonOutputProps) {
  const [copied, setCopied] = useState(false);
  const jsonText = formatGemmaJson(result);
  const sourceText =
    source === "gemma"
      ? `真实模型 · ${modelName ?? "Gemma 4"}`
      : source === "ollama"
        ? `本地 Ollama · ${modelName ?? "gemma4:latest"}`
      : source === "mock_fallback"
        ? "Mock 兜底 · 接口失败后自动降级"
        : mockMode
          ? "演示模式 · 结构与真实 API 一致"
          : "来源未标注 · 请查看 analysisSource";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
        <div>
          <p className="text-xs font-semibold text-slate-200">
            Gemma 4 结构化输出
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {sourceText}
          </p>
          {fallbackReason && (
            <p className="mt-0.5 max-w-xl text-[11px] text-amber-300">
              降级原因：{fallbackReason}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-800"
        >
          {copied ? "已复制 ✓" : "复制 JSON"}
        </button>
      </div>
      <pre className="max-h-80 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-emerald-300/95">
        {jsonText}
      </pre>
    </div>
  );
}
