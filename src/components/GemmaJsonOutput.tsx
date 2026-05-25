"use client";

import { formatGemmaJson } from "@/lib/analysisJson";
import type { AnalysisResult } from "@/types/analysis";
import { useState } from "react";

interface GemmaJsonOutputProps {
  result: AnalysisResult;
  mockMode?: boolean;
}

export default function GemmaJsonOutput({
  result,
  mockMode = false,
}: GemmaJsonOutputProps) {
  const [copied, setCopied] = useState(false);
  const jsonText = formatGemmaJson(result);

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
            {mockMode
              ? "演示模式 · 结构与真实 API 一致"
              : "来自 Gemma 4 多模态分析结果"}
          </p>
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
