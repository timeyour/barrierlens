import {
  isAutoFallbackLocation,
  sanitizeLocationForStorage,
} from "@/lib/locationValidation";

export const PREFILL_LOCATION_KEY = "barrierlens_prefill_location";
export const FOCUS_UPLOAD_KEY = "barrierlens_focus_upload";
export const PREFILL_LOCATION_EVENT = "barrierlens-prefill-location";
export const LOCATION_APPLIED_EVENT = "barrierlens-location-applied";

/** 写入 session 并通知工作台输入框同步路名 */
export function persistLocationPrefill(raw: string): void {
  if (typeof window === "undefined") return;
  if (isAutoFallbackLocation(raw)) return;
  const value = sanitizeLocationForStorage(raw);
  if (!value) return;
  try {
    sessionStorage.setItem(PREFILL_LOCATION_KEY, value);
  } catch {
    /* 隐私模式可能禁用 storage；仍通过事件同步 */
  }
  window.dispatchEvent(new Event(PREFILL_LOCATION_EVENT));
  window.dispatchEvent(new CustomEvent(LOCATION_APPLIED_EVENT, { detail: value }));
}

export function readPrefillLocation(): string {
  if (typeof window === "undefined") return "";
  try {
    return sanitizeLocationForStorage(sessionStorage.getItem(PREFILL_LOCATION_KEY));
  } catch {
    return "";
  }
}
