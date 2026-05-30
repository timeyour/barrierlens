"use client";

import { locationValidationHint } from "@/lib/locationValidation";
import { requestUserLocation, userLocationSuccessNote } from "@/lib/userLocation";
import { useState } from "react";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  showGeoButton?: boolean;
  flow?: boolean;
}

export default function LocationInput({
  value,
  onChange,
  disabled = false,
  required = false,
  showGeoButton = true,
  flow = false,
}: LocationInputProps) {
  const [geoNote, setGeoNote] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(false);
  const hint = required ? locationValidationHint(value) : null;
  const invalid = required && Boolean(hint);

  const handleGeo = async () => {
    setGeoLoading(true);
    setGeoError(false);
    setGeoNote("正在获取位置并解析路名…");
    const result = await requestUserLocation();
    setGeoLoading(false);
    if (!result.ok) {
      setGeoError(true);
      setGeoNote(result.message);
      return;
    }
    if (result.address) {
      onChange(result.address);
    }
    setGeoError(false);
    setGeoNote(userLocationSuccessNote(result));
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="record-location"
        className={`text-sm font-medium ${flow ? "text-white/75" : "text-slate-700"}`}
      >
        哪条路 / 哪个位置
        {required ? (
          <span className={`ml-1 ${flow ? "text-red-300" : "text-red-600"}`}>*</span>
        ) : (
          <span className={`ml-1 font-normal ${flow ? "text-white/35" : "text-slate-400"}`}>
            （建议填写路名或地标，诊断才能对应到具体路段）
          </span>
        )}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="record-location"
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="例如：XX 路 XX 段北侧便道、XX 地铁 3 号口东侧"
          aria-invalid={invalid}
          className={
            flow
              ? `flow-field w-full flex-1 rounded-xl px-4 py-3 text-sm disabled:opacity-60 ${
                  invalid ? "border-amber-400/50 focus:border-amber-400/70" : ""
                }`
              : `w-full flex-1 rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:opacity-60 ${
                  invalid
                    ? "border-amber-300 focus:border-amber-500 focus:ring-amber-200"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                }`
          }
        />
        {showGeoButton && (
          <button
            type="button"
            disabled={disabled || geoLoading}
            onClick={() => void handleGeo()}
            className={
              flow
                ? "flow-btn-secondary shrink-0 rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-50"
                : "btn-secondary shrink-0 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-wait disabled:opacity-50"
            }
          >
            {geoLoading ? "定位中…" : "使用当前位置"}
          </button>
        )}
      </div>
      {required && hint && (
        <p className={`text-xs ${flow ? "text-amber-200" : "text-amber-800"}`} role="alert">
          {hint}
        </p>
      )}
      {required && !hint && value.trim() && (
        <p className={`text-xs ${flow ? "text-emerald-300" : "text-emerald-700"}`} role="status">
          路段已填写，可提交分析。
        </p>
      )}
      {geoNote && (
        <p
          className={`text-xs ${geoError ? (flow ? "text-amber-200" : "text-amber-800") : flow ? "text-emerald-300" : "text-emerald-800"}`}
          role="status"
        >
          {geoNote}
        </p>
      )}
    </div>
  );
}
