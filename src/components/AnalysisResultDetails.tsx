import {
  displayLocationLabel,
  sanitizeLocationForStorage,
} from "@/lib/locationValidation";
import {
  PATH_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
  SCENE_TYPE_LABELS,
  type AnalysisResult,
  type RecordMode,
} from "@/types/analysis";
import SpatialDiagnosisTags from "./SpatialDiagnosisTags";

interface AnalysisResultDetailsProps {
  result: AnalysisResult;
  recordMode: RecordMode;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-2.5 last:border-0 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-xs font-medium text-slate-500 sm:w-24">{label}</dt>
      <dd className="text-sm text-slate-800">{value}</dd>
    </div>
  );
}

export default function AnalysisResultDetails({
  result,
  recordMode,
}: AnalysisResultDetailsProps) {
  return (
    <dl className="divide-y divide-slate-100">
      <DetailRow label="问题类型" value={result.issueType} />
      <DetailRow label="风险等级" value={result.riskLevel} />
      <DetailRow label="场景类型" value={SCENE_TYPE_LABELS[result.sceneType]} />
      <DetailRow label="路径状态" value={PATH_STATUS_LABELS[result.pathStatus]} />
      <DetailRow label="影响群体" value={result.affectedGroups.join("、")} />
      <DetailRow
        label="责任方"
        value={result.responsibleParty.join("、")}
      />
      <DetailRow label="归类部门" value={result.targetDepartment} />
      <DetailRow label="受阻路径" value={result.blockedPath} />
      <DetailRow
        label="路名/位置"
        value={displayLocationLabel(result.location, "未填写")}
      />
      {result.obstacles.length > 0 && (
        <DetailRow
          label="障碍物"
          value={result.obstacles
            .map((o) => `${o.name}（${o.position}）`)
            .join("；")}
        />
      )}
      <DetailRow
        label={recordMode === "inspection" ? "合规建议" : "关注建议"}
        value={result.managementAction || result.suggestion}
      />
      {result.evidencePoints.length > 0 && (
        <DetailRow
          label="证据要点"
          value={result.evidencePoints.join("；")}
        />
      )}
      <DetailRow
        label="复查状态"
        value={REVIEW_STATUS_LABELS[result.reviewStatus]}
      />
      <DetailRow
        label="模型置信度"
        value={`${Math.round(result.confidence * 100)}%`}
      />
    </dl>
  );
}

export function ResultConclusionHeader({
  result,
  recordMode,
  subtitle,
}: {
  result: AnalysisResult;
  recordMode: RecordMode;
  subtitle?: string;
}) {
  const riskClass =
    result.riskLevel === "高"
      ? "bg-red-100 text-red-800"
      : result.riskLevel === "中"
        ? "bg-amber-100 text-amber-900"
        : "bg-emerald-100 text-emerald-800";

  return (
    <header className="space-y-3">
      {subtitle && (
        <p className="text-xs font-medium text-slate-500">{subtitle}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${riskClass}`}>
          {result.riskLevel}风险
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {SCENE_TYPE_LABELS[result.sceneType]}
        </span>
        <SpatialDiagnosisTags record={result} compact />
      </div>
      <h2 className="text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
        {result.issueType}
      </h2>
      <p className="text-sm leading-relaxed text-slate-600">
        {result.problemSummary}
      </p>
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
        <span className="font-semibold text-slate-800">哪段路：</span>
        {result.blockedPath}
      </p>
      <p className="text-xs text-slate-500">
        {(() => {
          const placeLabel = sanitizeLocationForStorage(result.location);
          return placeLabel ? (
            <>
              路名/位置：{placeLabel}
              {recordMode === "inspection" ? " · 物业自查" : " · 公众记录"}
            </>
          ) : (
            <span className="text-amber-700">
              路名/位置未填写 — 请在提交前补充「哪条路」，否则公开记录无法对应具体路段
            </span>
          );
        })()}
      </p>
    </header>
  );
}
