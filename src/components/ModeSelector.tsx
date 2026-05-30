"use client";

import type { RecordMode } from "@/types/analysis";
import { RECORD_MODES } from "@/types/analysis";

interface ModeSelectorProps {
  value: RecordMode;
  onChange: (value: RecordMode) => void;
  disabled?: boolean;
  flow?: boolean;
}

const MODE_ICONS: Record<RecordMode, string> = {
  public: "📢",
  inspection: "📋",
};

export default function ModeSelector({
  value,
  onChange,
  disabled = false,
  flow = false,
}: ModeSelectorProps) {
  return (
    <div className="space-y-2.5 sm:space-y-3">
      <p className={`text-sm font-medium ${flow ? "text-white/75" : "text-slate-700"}`}>
        记录模式
      </p>
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
              className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
                flow
                  ? selected
                    ? "border-sky-400/60 bg-sky-400/10 ring-2 ring-sky-400/25"
                    : "border-white/12 bg-white/[0.04] hover:border-sky-400/35 hover:bg-white/[0.07]"
                  : selected
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                    : "border-slate-200 bg-white hover:border-blue-300"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <span className="text-xl" aria-hidden>
                {MODE_ICONS[mode]}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-sm font-semibold ${flow ? "text-white" : "text-slate-900"}`}
                >
                  {meta.label}
                </span>
                <span
                  className={`mt-1 block text-xs leading-relaxed ${flow ? "text-white/45" : "text-slate-500"}`}
                >
                  {meta.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
