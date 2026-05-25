import {
  PATH_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
  SCENE_TYPE_LABELS,
  type AnalysisResult,
  type RecordMode,
} from "@/types/analysis";
import BarrierMap from "./BarrierMap";
import MetricCard from "./MetricCard";

interface AnalysisResultViewProps {
  result: AnalysisResult;
  recordMode: RecordMode;
}

export default function AnalysisResultView({
  result,
  recordMode,
}: AnalysisResultViewProps) {
  const reviewStatusText = REVIEW_STATUS_LABELS[result.reviewStatus];
  const pathStatusText = PATH_STATUS_LABELS[result.pathStatus];
  const sceneTypeText = SCENE_TYPE_LABELS[result.sceneType];

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

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="场景类型" value={sceneTypeText} />
        <MetricCard label="受阻路径状态" value={pathStatusText} />
        <MetricCard label="责任方建议" value={result.responsibleParty.join("、")} />
        <MetricCard
          label="人工复核"
          value={result.needsHumanReview ? "需要" : "不需要"}
        />
      </div>

      {result.location && (
        <p className="text-sm text-slate-500">
          地点：<span className="font-medium text-slate-700">{result.location}</span>
        </p>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900">问题摘要</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {result.problemSummary}
        </p>
        <p className="mt-3 text-xs text-slate-500">
          受阻路径：{result.blockedPath}
        </p>
      </div>

      <BarrierMap result={result} />

      {result.obstacles.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">障碍物清单</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
            {result.obstacles.map((obstacle, index) => (
              <li key={`${obstacle.name}-${index}`}>
                {index + 1}. {obstacle.name}｜{obstacle.position}｜影响：{obstacle.blocks}
              </li>
            ))}
          </ul>
        </div>
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
          {result.suggestedActions.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-500">
              {result.suggestedActions.map((action, idx) => (
                <li key={`${action}-${idx}`}>{action}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {result.evidencePoints.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">证据要点</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
            {result.evidencePoints.map((point, index) => (
              <li key={`${point}-${index}`}>{point}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            模型置信度：{Math.round(result.confidence * 100)}% · 复查状态：{reviewStatusText}
          </p>
          {result.reviewNote && (
            <p className="mt-1 text-xs text-slate-500">
              复查备注：{result.reviewNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
