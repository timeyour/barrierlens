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
  flow?: boolean;
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
  flow = false,
}: RecordTimelineFiltersProps) {
  const set = (patch: Partial<RecordFilterState>) =>
    onChange({ ...filters, ...patch });

  const shellClass = flow
    ? "flow-panel-inner mb-4 space-y-3 p-4"
    : "mb-4 space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur-sm";
  const inputClass = flow
    ? "flow-field min-w-0 flex-1 rounded-lg px-3 py-2 text-sm"
    : "min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400";
  const queueShell = flow
    ? "flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1"
    : "flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1";
  const queueActive = flow ? "bg-white text-slate-950" : "bg-slate-900 text-white";
  const queueIdle = flow ? "text-white/60 hover:bg-white/10" : "text-slate-600 hover:bg-white";
  const selectClass = flow
    ? "flow-field rounded-md px-2 py-1.5 text-xs"
    : "rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700";

  return (
    <div className={shellClass}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="search"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder="搜索地点或问题…"
          className={inputClass}
        />
        <div className={queueShell}>
          {QUEUE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ queue: opt.value })}
              className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
                filters.queue === opt.value ? queueActive : queueIdle
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
          className={selectClass}
        >
          <option value="all">全部模式</option>
          <option value="public">公众</option>
          <option value="inspection">自查</option>
        </select>
        <select
          value={filters.risk}
          onChange={(e) => set({ risk: e.target.value as RiskLevel | "all" })}
          className={selectClass}
        >
          <option value="all">全部风险</option>
          <option value="高">高</option>
          <option value="中">中</option>
          <option value="低">低</option>
        </select>
        <select
          value={filters.scene}
          onChange={(e) => set({ scene: e.target.value as SceneType | "all" })}
          className={selectClass}
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
            className={
              flow
                ? "flow-btn-secondary rounded-md px-2.5 py-1.5 text-xs font-semibold"
                : "rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600"
            }
          >
            重置
          </button>
        )}
      </div>
    </div>
  );
}
