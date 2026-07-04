import {
  HUMAN_REVIEW_DECLARATION,
  PROJECT_METHODOLOGY,
} from "@/lib/evidenceFields";

/** 产品方法论与 HITL 说明（全站复用） */
export default function ProductMethodologyNotice({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700"
          : "rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm leading-relaxed text-slate-800"
      }
      role="note"
    >
      <p className="font-semibold text-slate-900">AI 辅助识别 · 建议人工复核</p>
      <p className={compact ? "mt-1" : "mt-2"}>{HUMAN_REVIEW_DECLARATION}</p>
      {!compact && <p className="mt-2 text-slate-600">{PROJECT_METHODOLOGY}</p>}
    </div>
  );
}
