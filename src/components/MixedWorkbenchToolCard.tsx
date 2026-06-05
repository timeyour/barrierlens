"use client";

import AnalysisWorkflow from "@/components/AnalysisWorkflow";
import { Suspense } from "react";

function WorkflowFallback() {
  return (
    <div className="space-y-4 py-4" aria-busy="true" aria-label="加载工作台">
      <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
      <div className="h-32 animate-pulse rounded-xl border border-dashed border-slate-200 bg-slate-50" />
      <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

export default function MixedWorkbenchToolCard({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div
      id="tool"
      className="scroll-mt-24 tool-card relative z-30 w-full min-w-0 p-4 sm:p-6 md:p-8"
    >
      <Suspense fallback={<WorkflowFallback />}>
        <AnalysisWorkflow compact={compact} embedded showIntro />
      </Suspense>
    </div>
  );
}
