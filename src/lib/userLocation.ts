import { flushSync } from "react-dom";
import { savePrefillCoords, loadPrefillCoords } from "@/lib/geolocation";
import { reverseGeocodeAmapJsonp } from "@/lib/clientAmapRegeo";
import { locationPreviewHostHint } from "@/lib/locationHost";
import { persistLocationPrefill } from "@/lib/prefillLocation";
import { getPublicAmapKey } from "@/lib/reverseGeocode";
import {
  AUTO_FALLBACK_ADDRESS,
  isCoordinatePlaceholder,
  isLocationUsable,
  locationTextForAutoFill,
  sanitizeLocationForStorage,
} from "@/lib/locationValidation";

export type UserLocationResult =
  | {
      ok: true;
      lat: number;
      lng: number;
      address: string | null;
      amapConfigured: boolean;
      amapError: string | null;
    }
  | {
      ok: false;
      message: string;
    };

/** 定位结果转成可写入输入框的中文路名（绝不写入经纬度） */
export function resolveAddressForInput(address: string | null | undefined): string {
  const preferred = locationTextForAutoFill(address);
  if (preferred) return preferred;

  const trimmed = sanitizeLocationForStorage(address);
  if (trimmed && /[\u4e00-\u9fa5]/.test(trimmed) && !isCoordinatePlaceholder(trimmed)) {
    return trimmed;
  }

  return AUTO_FALLBACK_ADDRESS;
}

function geolocationErrorMessage(code: number): string {
  if (code === 1) {
    return "定位被拒绝：请点击地址栏左侧锁图标 → 允许「位置」，或在系统设置中为浏览器开启定位后重试。";
  }
  if (code === 2) {
    return "浏览器未能返回坐标（Mac/台式机常见）。请开启系统定位权限、换用手机 4G 打开本站，或直接手动输入路名。";
  }
  if (code === 3) {
    return "定位超时，请到开阔处、关闭 VPN 后重试，或直接手动输入路名。";
  }
  return "无法获取定位，请手动输入路名或地标。";
}

const GEOCODE_FETCH_MS = 18_000;

const CLIENT_GEOCODE_ERRORS = new Set([
  "amap_key_missing",
  "INVALID_USER_KEY",
  "USERKEY_PLAT_NOMATCH",
  "jsonp_script_error",
  "jsonp_timeout",
  "amap_no_chinese_address",
]);

function mergeGeocodeErrors(
  apiError: string | null,
  jsonpError: string | null,
): string | null {
  if (jsonpError && CLIENT_GEOCODE_ERRORS.has(jsonpError)) return jsonpError;
  return apiError ?? jsonpError;
}

async function reverseGeocodeViaJsonp(
  lat: number,
  lng: number,
): Promise<{
  address: string | null;
  amapConfigured: boolean;
  amapError: string | null;
} | null> {
  const clientKey = getPublicAmapKey();
  if (!clientKey) return null;

  const jsonp = await reverseGeocodeAmapJsonp(lat, lng, clientKey);
  const clientAddress = resolveAddressForInput(jsonp.address);
  if (clientAddress !== AUTO_FALLBACK_ADDRESS) {
    return {
      address: clientAddress,
      amapConfigured: true,
      amapError: null,
    };
  }

  return {
    address: null,
    amapConfigured: true,
    amapError: jsonp.error ?? "amap_no_chinese_address",
  };
}

async function reverseGeocodeViaApi(
  lat: number,
  lng: number,
  fallbackError: string | null,
): Promise<{
  address: string | null;
  amapConfigured: boolean;
  amapError: string | null;
} | null> {
  try {
    const res = await fetch(
      `/api/geocode?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
      { signal: AbortSignal.timeout(GEOCODE_FETCH_MS) },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as {
      address?: string | null;
      amapConfigured?: boolean;
      amapError?: string | null;
    };
    if (data.address?.trim()) {
      return {
        address: resolveAddressForInput(data.address),
        amapConfigured: Boolean(data.amapConfigured),
        amapError: data.amapError ?? null,
      };
    }
    return {
      address: null,
      amapConfigured: Boolean(data.amapConfigured),
      amapError: mergeGeocodeErrors(data.amapError ?? null, fallbackError),
    };
  } catch {
    return null;
  }
}

/** 有 NEXT_PUBLIC_AMAP_KEY 时 JSONP 优先；否则仅 /api/geocode（服务端 AMAP_WEB_KEY） */
async function reverseGeocodeAddress(lat: number, lng: number): Promise<{
  address: string | null;
  amapConfigured: boolean;
  amapError: string | null;
}> {
  const hasPublicKey = Boolean(getPublicAmapKey());
  let jsonpError: string | null = null;

  if (hasPublicKey) {
    const jsonp = await reverseGeocodeViaJsonp(lat, lng);
    if (jsonp?.address) return jsonp;
    jsonpError = jsonp?.amapError ?? null;
  }

  const api = await reverseGeocodeViaApi(lat, lng, jsonpError);
  if (api?.address) return api;
  if (api) return api;

  return {
    address: null,
    amapConfigured: hasPublicKey,
    amapError: hasPublicKey
      ? mergeGeocodeErrors("amap_no_chinese_address", jsonpError)
      : "amap_key_missing",
  };
}

function readCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }

    const attempt = (enableHighAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          const retryWithLowAccuracy =
            enableHighAccuracy && (error.code === 2 || error.code === 3);
          if (retryWithLowAccuracy) {
            attempt(false);
            return;
          }
          reject(error);
        },
        {
          enableHighAccuracy,
          timeout: enableHighAccuracy ? 15_000 : 25_000,
          maximumAge: enableHighAccuracy ? 0 : 120_000,
        },
      );
    };

    attempt(true);
  });
}

function applyToInput(onApply: ((text: string) => void) | undefined, text: string): void {
  if (!onApply) return;
  flushSync(() => onApply(text));
}

/** 获取 GPS + 逆地理编码路名，并写入 session 供分析页复用 */
export async function requestUserLocation(
  onApply?: (text: string) => void,
): Promise<UserLocationResult> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return { ok: false, message: "当前浏览器不支持定位，请手动输入路名。" };
  }

  try {
    const position = await readCurrentPosition();
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    savePrefillCoords(lat, lng);

    const geocode = await reverseGeocodeAddress(lat, lng);
    const inputText = resolveAddressForInput(geocode.address);
    applyToInput(onApply, inputText);
    persistLocationPrefill(inputText);
    return {
      ok: true,
      lat,
      lng,
      address: inputText,
      amapConfigured: geocode.amapConfigured,
      amapError: geocode.amapError,
    };
  } catch (error) {
    if (error instanceof GeolocationPositionError) {
      return { ok: false, message: geolocationErrorMessage(error.code) };
    }
    if (error instanceof Error && error.message === "unsupported") {
      return { ok: false, message: "当前浏览器不支持定位，请手动输入路名。" };
    }
    return { ok: false, message: "无法获取定位，请手动输入路名或地标。" };
  }
}

export function userLocationSuccessNote(
  result: Extract<UserLocationResult, { ok: true }>,
): string {
  const previewHint = locationPreviewHostHint();
  if (result.address === AUTO_FALLBACK_ADDRESS) {
    if (previewHint) {
      return previewHint;
    }
    if (!result.amapConfigured || result.amapError === "amap_key_missing") {
      return "已获取 GPS，但无法解析中文路名：请在 Vercel 配置 NEXT_PUBLIC_AMAP_KEY（高德 Web 服务）并重新部署，或直接在框内输入路名。";
    }
    if (
      result.amapError === "INVALID_USER_KEY" ||
      result.amapError === "USERKEY_PLAT_NOMATCH" ||
      result.amapError === "jsonp_script_error"
    ) {
      return "高德 Key 无效、平台类型不对，或域名未加入白名单（需 Web 服务 + 白名单含 barrierlens.vercel.app）。请修正后 Redeploy，或手动输入路名。";
    }
    if (result.amapError === "jsonp_timeout") {
      return "解析路名超时，请检查网络后重试，或直接手动输入路名。";
    }
    if (result.amapError === "amap_key_missing") {
      return "当前页面未载入高德 Key：请在 Vercel 项目 barrierlens 配置 NEXT_PUBLIC_AMAP_KEY 后 Redeploy。";
    }
    if (
      result.amapError === "amap_request_failed" ||
      result.amapError === "amap_request_timeout" ||
      result.amapError?.startsWith("amap_request_failed:") ||
      result.amapError?.startsWith("amap_http_")
    ) {
      const hasPublic = Boolean(getPublicAmapKey());
      if (!hasPublic) {
        return "服务端访问高德失败，且页面未载入 NEXT_PUBLIC_AMAP_KEY。请在 Vercel → barrierlens 添加该变量并 Redeploy，或手动输入路名。";
      }
      return "服务端访问高德失败（Vercel 海外常见）。请改用 https://barrierlens.vercel.app 打开，或在高德白名单加入当前域名后重试。";
    }
    return `未能解析具体路名${result.amapError ? `（${result.amapError}）` : ""}。请手动填写路名后重试定位。`;
  }
  if (result.address && isLocationUsable(result.address)) {
    return `已填入：${result.address}（可继续编辑）`;
  }
  if (result.address) {
    return `定位到「${result.address}」，请补全路名（如「${result.address}XX路南侧便道」）后再继续。`;
  }
  if (!result.amapConfigured) {
    return "GPS 已获取，但服务端未配置高德 Web 服务 Key（NEXT_PUBLIC_AMAP_KEY）。请在 .env.local 与 Vercel 填入 Key 后重新部署，或手动填写：省市 + 区 + 镇/街道 + 路名。";
  }
  if (result.amapError === "INVALID_USER_KEY" || result.amapError === "USERKEY_PLAT_NOMATCH") {
    return "GPS 已获取，但高德 Key 无效或平台类型不对（需勾选「Web服务」）。请检查 Key 后重新部署，或手动填写路名。";
  }
  return "已获取 GPS，但未能解析为中文路名，请手动填写：省市 + 区 + 镇/街道 + 路名。";
}

export function userLocationNoteReady(
  result: Extract<UserLocationResult, { ok: true }>,
): boolean {
  return Boolean(result.address && isLocationUsable(result.address));
}

/** 点击「当前位置」：获取 GPS、解析路名、填入回调并同步 session */
export async function applyUserLocationToInput(
  onApply: (text: string) => void,
): Promise<{ note: string; isError: boolean }> {
  const result = await requestUserLocation(onApply);
  if (!result.ok) {
    return { note: result.message, isError: true };
  }
  return {
    note: userLocationSuccessNote(result),
    isError: !userLocationNoteReady(result),
  };
}

/** 若已定位过但输入框为空，用缓存坐标再次解析并填入 */
export async function refillLocationFromCachedCoords(): Promise<string | null> {
  const coords = loadPrefillCoords();
  if (!coords) return null;

  const geocode = await reverseGeocodeAddress(coords.lat, coords.lng);
  const text = resolveAddressForInput(geocode.address);
  persistLocationPrefill(text);
  return text;
}
