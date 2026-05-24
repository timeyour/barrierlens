"use client";

import type { RecordMode } from "@/types/analysis";
import { RECORD_MODES } from "@/types/analysis";

interface ModeSelectorProps {
  value: RecordMode;
  onChange: (value: RecordMode) => void;
  disabled?: boolean;
}

export default function ModeSelector({
  value,
  onChange,
  disabled = false,
}: ModeSelectorProps) {
  return (
    <div className="space-y-2.5 sm:space-y-3">
      <p className="text-sm font-medium text-slate-700">记录模式</p>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
        {(Object.keys(RECORD_MODES) as RecordMode[]).map((mode) => {
          const selected = value === mode;
          const meta = RECORD_MODES[mode];
          return (
            <button
              key={mode}
              type="button"
              disabled={disabled}
              onClick={() => onChange(mode)}
              className={`rounded-xl border px-3 py-3 text-left transition-all ${
                selected
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-slate-200 bg-white hover:border-blue-300"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <span className="block text-sm font-semibold text-slate-900">
                {meta.label}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                {meta.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
