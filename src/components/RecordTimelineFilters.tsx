"use client";

import {
  DEFAULT_RECORD_FILTERS,
  type QueueView,
  type RecordFilterState,
} from "@/lib/recordFilters";
import {
  SCENE_TYPE_LABELS,
  type RecordMode,
  type RiskLevel,
  type SceneType,
} from "@/types/analysis";

interface RecordTimelineFiltersProps {
  filters: RecordFilterState;
  onChange: (next: RecordFilterState) => void;
  counts: { work: number; history: number; all: number };
}

const QUEUE_OPTIONS: { value: QueueView; label: string }[] = [
  { value: "work", label: "工作队列" },
  { value: "all", label: "全部" },
  { value: "history", label: "历史归档" },
];

export default function RecordTimelineFilters({
  filters,
  onChange,
  counts,
}: RecordTimelineFiltersProps) {
  const set = (patch: Partial<RecordFilterState>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="mb-4 space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="search"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder="搜索地点、问题类型、摘要关键词…"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400"
        />
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          {QUEUE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ queue: opt.value })}
              className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
                filters.queue === opt.value
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              {opt.label}
              <span className="ml-1 opacity-70">
                {opt.value === "work"
                  ? counts.work
                  : opt.value === "history"
                    ? counts.history
                    : counts.all}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={filters.mode}
          onChange={(e) => set({ mode: e.target.value as RecordMode | "all" })}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
        >
          <option value="all">全部模式</option>
          <option value="public">公众记录</option>
          <option value="inspection">物业自查</option>
        </select>
        <select
          value={filters.risk}
          onChange={(e) => set({ risk: e.target.value as RiskLevel | "all" })}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
        >
          <option value="all">全部风险</option>
          <option value="高">高风险</option>
          <option value="中">中风险</option>
          <option value="低">低风险</option>
        </select>
        <select
          value={filters.scene}
          onChange={(e) => set({ scene: e.target.value as SceneType | "all" })}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
        >
          <option value="all">全部场景</option>
          {(Object.keys(SCENE_TYPE_LABELS) as SceneType[]).map((key) => (
            <option key={key} value={key}>
              {SCENE_TYPE_LABELS[key]}
            </option>
          ))}
        </select>
        {(filters.query ||
          filters.mode !== "all" ||
          filters.risk !== "all" ||
          filters.scene !== "all" ||
          filters.queue !== DEFAULT_RECORD_FILTERS.queue) && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_RECORD_FILTERS)}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600"
          >
            重置筛选
          </button>
        )}
      </div>
    </div>
  );
}
