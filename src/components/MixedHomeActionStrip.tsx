"use client";

import { locationValidationHint, isLocationUsable, sanitizeLocationForStorage } from "@/lib/locationValidation";
import { requestUserLocation, userLocationSuccessNote } from "@/lib/userLocation";
import { scrollToAnchor } from "@/lib/scrollAnchor";
import { useHackathonFlags } from "@/hooks/useHackathonFlags";
import { FormEvent, useState } from "react";

const PREFILL_KEY = "barrierlens_prefill_location";
const FOCUS_UPLOAD_KEY = "barrierlens_focus_upload";

interface MixedHomeActionStripProps {
  embedded?: boolean;
  flow?: boolean;
}

export default function MixedHomeActionStrip({
  embedded = false,
  flow = false,
}: MixedHomeActionStripProps) {
  const flags = useHackathonFlags();
  const [location, setLocation] = useState("");
  const [geoNote, setGeoNote] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(false);

  const goTool = (place?: string) => {
    const value = sanitizeLocationForStorage(place ?? location);
    if (value) {
      sessionStorage.setItem(PREFILL_KEY, value);
    }
    if (embedded) {
      sessionStorage.setItem(FOCUS_UPLOAD_KEY, "1");
      scrollToAnchor("#tool-upload");
    } else {
      scrollToAnchor("#tool");
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (flags.locationRequired && !isLocationUsable(location)) return;
    goTool();
  };

  const handleGeo = async () => {
    setGeoLoading(true);
    setGeoError(false);
    setGeoNote("定位中…");
    const result = await requestUserLocation();
    setGeoLoading(false);
    if (!result.ok) {
      setGeoError(true);
      setGeoNote(result.message);
      return;
    }
    if (result.address) {
      setLocation(result.address);
    }
    setGeoError(false);
    setGeoNote(userLocationSuccessNote(result));
  };

  const locationHint =
    flags.locationRequired && location.trim()
      ? locationValidationHint(location)
      : null;
  const canProceed =
    !flags.locationRequired || isLocationUsable(location);

  const inputClass = flow
    ? "flow-field w-full flex-1 rounded-xl px-4 py-3 text-sm md:py-2.5"
    : "w-full flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 md:py-2";
  const secondaryBtnClass = flow
    ? "flow-btn-secondary shrink-0 rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-60 md:py-2.5"
    : "btn-secondary shrink-0 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-wait disabled:opacity-60 md:py-2";

  return (
    <div className={embedded && !flow ? "md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none" : ""}>
      {!embedded && !flow && (
        <h2 className="text-base font-bold text-slate-900 md:text-lg">在哪？拍一张</h2>
      )}
      {!embedded && flow && (
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
          路名
        </p>
      )}

      {embedded && !flow && (
        <p className="mb-2 hidden text-xs font-semibold text-slate-700 md:block">
          路名
          {flags.locationRequired && <span className="ml-0.5 text-red-600">*</span>}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className={`${embedded ? "md:mt-0" : flow || embedded ? "mt-0" : "mt-3"} space-y-3`}
      >
        <label htmlFor="mixed-home-location" className="sr-only">
          路名
        </label>
        <div className={`flex flex-col gap-2 sm:flex-row ${embedded ? "md:items-center" : ""}`}>
          <input
            id="mixed-home-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="路名或地标"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => void handleGeo()}
            disabled={geoLoading}
            className={secondaryBtnClass}
          >
            {geoLoading ? "定位中…" : "当前位置"}
          </button>
          {embedded && (
            <button
              type="submit"
              disabled={!canProceed}
              className="btn-primary hidden shrink-0 rounded-xl px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 md:inline-flex"
            >
              拍照
            </button>
          )}
        </div>
        {locationHint && (
          <p className={`text-xs md:pt-1 ${flow ? "text-amber-200" : "text-amber-800"}`} role="alert">
            {locationHint}
          </p>
        )}

        <div className={`flex flex-col gap-2 pt-1 sm:flex-row ${embedded ? "md:hidden" : ""}`}>
          <button
            type="submit"
            disabled={!canProceed}
            className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            拍照上报
          </button>
        </div>
      </form>

      {geoNote && (
        <p
          className={`mt-2 text-xs md:mt-1 ${
            geoError
              ? flow
                ? "text-amber-200"
                : "text-amber-800"
              : flow
                ? "text-emerald-200"
                : "text-emerald-800"
          }`}
          role="status"
        >
          {geoNote}
        </p>
      )}
    </div>
  );
}
