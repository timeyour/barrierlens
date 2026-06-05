"use client";

import {
  isAutoFallbackLocation,
  isCoordinatePlaceholder,
  isLocationUsable,
  locationValidationHint,
} from "@/lib/locationValidation";
import { applyUserLocationToInput } from "@/lib/userLocation";
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
  const hint =
    required && !geoLoading ? locationValidationHint(value) : null;
  const invalid = required && !geoLoading && Boolean(hint);

  const handleGeo = async () => {
    setGeoLoading(true);
    setGeoError(false);
    setGeoNote("正在获取位置并解析路名…");
    const { note, isError } = await applyUserLocationToInput(onChange);
    setGeoLoading(false);
    setGeoError(isError);
    setGeoNote(note);
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
          onChange={(e) => {
            const next = e.target.value;
            onChange(isCoordinatePlaceholder(next) ? "" : next);
          }}
          placeholder="例如：上海市浦东新区花木街道芳甸路"
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
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void handleGeo();
            }}
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
      {required && !hint && isLocationUsable(value) && !isAutoFallbackLocation(value) && (
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
