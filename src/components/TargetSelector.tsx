"use client";

import type { TargetDepartment } from "@/types/analysis";
import { TARGET_DEPARTMENTS } from "@/types/analysis";

interface TargetSelectorProps {
  value: TargetDepartment;
  onChange: (value: TargetDepartment) => void;
  disabled?: boolean;
}

const DEPARTMENT_HINTS: Record<TargetDepartment, string> = {
  物业: "强调现场清理与责任区域维护",
  社区: "强调协调责任方与社区巡查",
  商场: "强调顾客通行与公共空间管理",
  城管: "强调公共通道秩序与违规占用",
};

export default function TargetSelector({
  value,
  onChange,
  disabled = false,
}: TargetSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">反馈对象</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TARGET_DEPARTMENTS.map((dept) => {
          const selected = value === dept;
          return (
            <button
              key={dept}
              type="button"
              disabled={disabled}
              onClick={() => onChange(dept)}
              className={`rounded-xl border px-3 py-3 text-left transition-all ${
                selected
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-slate-200 bg-white hover:border-blue-300"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <span className="block text-sm font-semibold text-slate-900">
                {dept}
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                {DEPARTMENT_HINTS[dept]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
