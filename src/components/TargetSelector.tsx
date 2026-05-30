"use client";

import type { TargetDepartment } from "@/types/analysis";
import { TARGET_DEPARTMENTS } from "@/types/analysis";

interface TargetSelectorProps {
  value: TargetDepartment;
  onChange: (value: TargetDepartment) => void;
  disabled?: boolean;
  flow?: boolean;
}

const DEPARTMENT_HINTS: Record<TargetDepartment, string> = {
  物业: "现场清理与日常巡查",
  社区: "协调责任方与社区巡查",
  商场: "顾客通行与公共空间",
  城管: "公共通道秩序与处置",
};

const DEPARTMENT_ICONS: Record<TargetDepartment, string> = {
  物业: "🏢",
  社区: "🏘️",
  商场: "🛍️",
  城管: "🚧",
};

export default function TargetSelector({
  value,
  onChange,
  disabled = false,
  flow = false,
}: TargetSelectorProps) {
  return (
    <div className="space-y-2.5 sm:space-y-3">
      <p className={`text-sm font-medium ${flow ? "text-white/75" : "text-slate-700"}`}>
        场景归类
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {TARGET_DEPARTMENTS.map((dept) => {
          const selected = value === dept;
          return (
            <button
              key={dept}
              type="button"
              disabled={disabled}
              onClick={() => onChange(dept)}
              className={`flex flex-col items-center rounded-xl border px-2 py-3 text-center transition-all sm:items-start sm:px-3 sm:py-3 sm:text-left ${
                flow
                  ? selected
                    ? "border-sky-400/60 bg-sky-400/10 ring-2 ring-sky-400/25"
                    : "border-white/12 bg-white/[0.04] hover:border-sky-400/35 hover:bg-white/[0.07]"
                  : selected
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                    : "border-slate-200 bg-white hover:border-blue-300"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <span className="text-xl sm:text-lg" aria-hidden>
                {DEPARTMENT_ICONS[dept]}
              </span>
              <span
                className={`mt-1 block text-sm font-semibold ${flow ? "text-white" : "text-slate-900"}`}
              >
                {dept}
              </span>
              <span
                className={`mt-0.5 hidden text-xs sm:block ${flow ? "text-white/45" : "text-slate-500"}`}
              >
                {DEPARTMENT_HINTS[dept]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
