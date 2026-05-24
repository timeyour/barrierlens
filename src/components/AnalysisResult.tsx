import type { AnalysisResult } from "@/types/analysis";
import MetricCard from "./MetricCard";

interface AnalysisResultViewProps {
  result: AnalysisResult;
}

export default function AnalysisResultView({ result }: AnalysisResultViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="问题类型" value={result.issueType} />
        <MetricCard
          label="风险等级"
          value={result.riskLevel}
          variant="risk"
          riskLevel={result.riskLevel}
        />
        <MetricCard
          label="影响群体"
          value={result.affectedGroups.join("、")}
        />
        <MetricCard label="反馈对象" value={result.targetDepartment} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">现场描述</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {result.sceneDescription}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">整改建议</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {result.suggestion}
          </p>
        </div>
      </div>
    </div>
  );
}
