import { formatCoordinates, savePrefillCoords } from "@/lib/geolocation";
import { isLocationUsable } from "@/lib/locationValidation";

export type UserLocationResult =
  | {
      ok: true;
      lat: number;
      lng: number;
      address: string | null;
    }
  | {
      ok: false;
      message: string;
    };

function geolocationErrorMessage(code: number): string {
  if (code === 1) {
    return "定位被拒绝：请在浏览器地址栏或系统设置中允许本网站使用位置信息，然后重试。";
  }
  if (code === 2) {
    return "无法获取位置（设备 GPS/Wi‑Fi 不可用），请手动输入路名。";
  }
  if (code === 3) {
    return "定位超时，请到开阔处或检查网络后重试。";
  }
  return "无法获取定位，请手动输入路名或地标。";
}

/** 去掉省/市前缀，保留区镇路 */
function shortenChineseAddress(raw: string): string {
  const trimmed = raw.trim();
  const withoutProvince = trimmed.replace(/^[^省]+省/, "").replace(/^[^市]+市/, "").trim();
  if (withoutProvince.length >= 6) return withoutProvince;
  return trimmed;
}

type AmapAddressComponent = {
  district?: string;
  township?: string;
  street?: string;
  streetNumber?: { street?: string; number?: string };
};

function formatAmapAddress(regeocode: {
  formatted_address?: string;
  addressComponent?: AmapAddressComponent;
}): string | null {
  const component = regeocode.addressComponent;
  if (component) {
    const district = component.district?.trim() ?? "";
    const township = component.township?.trim() ?? "";
    const street =
      component.streetNumber?.street?.trim() ||
      component.street?.trim() ||
      "";
    const number = component.streetNumber?.number?.trim() ?? "";
    const composed = `${district}${township}${street}${number}`.replace(/\s+/g, "");
    if (isLocationUsable(composed)) return composed;
  }

  if (regeocode.formatted_address) {
    const shortened = shortenChineseAddress(regeocode.formatted_address);
    if (isLocationUsable(shortened)) return shortened;
    const trimmed = regeocode.formatted_address.replace(/^.*?市/, "").trim();
    if (isLocationUsable(trimmed)) return trimmed;
    if (trimmed.length > shortened.length) return trimmed;
    return shortened || trimmed || null;
  }

  return null;
}

async function reverseGeocodeAmap(
  lat: number,
  lng: number,
  key: string,
): Promise<string | null> {
  const url = new URL("https://restapi.amap.com/v3/geocode/regeo");
  url.searchParams.set("key", key);
  url.searchParams.set("location", `${lng},${lat}`);
  url.searchParams.set("extensions", "all");

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = (await res.json()) as {
    status?: string;
    regeocode?: {
      formatted_address?: string;
      addressComponent?: AmapAddressComponent;
    };
  };

  if (data.status !== "1" || !data.regeocode) return null;
  return formatAmapAddress(data.regeocode);
}

async function reverseGeocodeNominatim(
  lat: number,
  lng: number,
): Promise<string | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "json");
  url.searchParams.set("accept-language", "zh");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    display_name?: string;
    address?: {
      road?: string;
      neighbourhood?: string;
      suburb?: string;
      city?: string;
      county?: string;
      state?: string;
    };
  };

  const parts = [
    data.address?.county ?? data.address?.state,
    data.address?.suburb ?? data.address?.neighbourhood,
    data.address?.road,
  ].filter(Boolean);

  const joined = parts.join("");
  if (isLocationUsable(joined)) return joined;

  if (data.display_name) {
    const first = shortenChineseAddress(data.display_name.split(",")[0] ?? data.display_name);
    if (isLocationUsable(first)) return first;
    return first || null;
  }
  return null;
}

export async function reverseGeocodeAddress(
  lat: number,
  lng: number,
): Promise<string | null> {
  const amapKey = process.env.NEXT_PUBLIC_AMAP_KEY?.trim();
  if (amapKey) {
    try {
      const address = await reverseGeocodeAmap(lat, lng, amapKey);
      if (address) return address;
    } catch {
      /* fallback */
    }
  }

  try {
    return await reverseGeocodeNominatim(lat, lng);
  } catch {
    return null;
  }
}

function readCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60_000,
    });
  });
}

/** 获取 GPS + 逆地理编码路名，并写入 session 供分析页复用 */
export async function requestUserLocation(): Promise<UserLocationResult> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return { ok: false, message: "当前浏览器不支持定位，请手动输入路名。" };
  }

  try {
    const position = await readCurrentPosition();
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    savePrefillCoords(lat, lng);

    const address = await reverseGeocodeAddress(lat, lng);
    return { ok: true, lat, lng, address };
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
  if (result.address && isLocationUsable(result.address)) {
    return `已填入：${result.address}（可继续编辑）`;
  }
  if (result.address) {
    return `定位到「${result.address}」，仍不够具体，请补全路名后再点「继续」。`;
  }
  return `已定位 ${formatCoordinates(result.lat, result.lng)}，请手动补充具体路名。`;
}

export function userLocationNoteReady(
  result: Extract<UserLocationResult, { ok: true }>,
): boolean {
  return Boolean(result.address && isLocationUsable(result.address));
}
