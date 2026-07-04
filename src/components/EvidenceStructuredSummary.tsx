import {
  buildEvidenceSummary,
  buildReviewHint,
  formatAnalysisSourceLabel,
  HUMAN_REVIEW_DECLARATION,
} from "@/lib/evidenceFields";
import {
  SCENE_TYPE_LABELS,
  type AnalysisResult,
  type AnalysisSource,
} from "@/types/analysis";

interface EvidenceStructuredSummaryProps {
  result: AnalysisResult;
  analysisSource?: AnalysisSource | null;
  mockMode?: boolean;
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-slate-800">{value}</dd>
    </div>
  );
}

export default function EvidenceStructuredSummary({
  result,
  analysisSource,
  mockMode,
}: EvidenceStructuredSummaryProps) {
  const evidenceSummary = buildEvidenceSummary(result);
  const reviewHint = buildReviewHint(result);
  const sourceLabel = formatAnalysisSourceLabel(analysisSource, mockMode);

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-4"
      aria-label="Gemma 4 结构化证据字段"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">结构化证据字段</h3>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700">
          analysisSource={sourceLabel}
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        Gemma 4 将现场照片转为可归档 JSON；以下字段供人工复核与导出使用。
      </p>

      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        <Field label="sceneType" value={SCENE_TYPE_LABELS[result.sceneType]} />
        <Field label="riskLevel" value={result.riskLevel} />
        <Field
          label="affectedGroups"
          value={result.affectedGroups.join("、") || "待核实"}
        />
        <Field
          label="suggestedActions"
          value={result.suggestedActions.join("；") || result.suggestion}
        />
        <div className="sm:col-span-2">
          <Field label="evidenceSummary" value={evidenceSummary} />
        </div>
        <div className="sm:col-span-2">
          <Field label="reviewHint" value={reviewHint} />
        </div>
      </dl>

      <p className="mt-3 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-[11px] leading-relaxed text-amber-950">
        {HUMAN_REVIEW_DECLARATION}
      </p>
    </section>
  );
}
