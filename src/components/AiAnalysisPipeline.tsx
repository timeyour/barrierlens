"use client";

import {
  buildStepsFromResult,
  createRunningSteps,
  PIPELINE_STEP_COUNT,
  type PipelineStep,
} from "@/lib/analysisPipeline";
import type { AnalysisResult } from "@/types/analysis";
import { useEffect, useState } from "react";

interface AiAnalysisPipelineProps {
  running: boolean;
  result: AnalysisResult | null;
}

function StepIcon({ status }: { status: PipelineStep["status"] }) {
  if (status === "done") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
        ✓
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] text-slate-400">
      ·
    </span>
  );
}

export default function AiAnalysisPipeline({
  running,
  result,
}: AiAnalysisPipelineProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!running || result) {
      return;
    }
    setActiveIndex(0);
    const interval = window.setInterval(() => {
      setActiveIndex((current) =>
        current >= PIPELINE_STEP_COUNT - 1 ? current : current + 1,
      );
    }, 520);
    return () => window.clearInterval(interval);
  }, [running, result]);

  if (!running && !result) {
    return null;
  }

  const steps: PipelineStep[] = result
    ? buildStepsFromResult(result)
    : createRunningSteps(activeIndex);

  const doneCount = steps.filter((s) => s.status === "done").length;
  const progress = result ? 100 : Math.round((doneCount / PIPELINE_STEP_COUNT) * 100);

  return (
    <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/90 to-slate-50 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Gemma 4 推理过程
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {result
              ? "分析完成，以下为逐步推理结果"
              : "正在分析现场图像，请稍候…"}
          </p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200">
          {progress}%
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-blue-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2.5">
        {steps.map((step) => (
          <li
            key={step.id}
            className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
              step.status === "active"
                ? "bg-white/90 ring-1 ring-blue-200"
                : step.status === "done"
                  ? "bg-white/70"
                  : "opacity-60"
            }`}
          >
            <StepIcon status={step.status} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">{step.label}</p>
              {step.detail && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                  {step.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
