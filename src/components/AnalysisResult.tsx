import type { AnalysisResult, RecordMode } from "@/types/analysis";
import MetricCard from "./MetricCard";

interface AnalysisResultViewProps {
  result: AnalysisResult;
  recordMode: RecordMode;
}

export default function AnalysisResultView({
  result,
  recordMode,
}: AnalysisResultViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
        <MetricCard label="场景归类" value={result.targetDepartment} />
      </div>

      {result.location && (
        <p className="text-sm text-slate-500">
          地点：<span className="font-medium text-slate-700">{result.location}</span>
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">现场描述</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {result.sceneDescription}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">
            {recordMode === "inspection" ? "整改要求" : "关注建议"}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {result.suggestion}
          </p>
        </div>
      </div>
    </div>
  );
}
