import { formatCoordinates, savePrefillCoords } from "@/lib/geolocation";

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

/** 去掉省市区前缀，保留更易读的路段描述 */
function shortenChineseAddress(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(
    /(?:省|自治区|特别行政区|市)(.+)/,
  );
  if (match?.[1] && match[1].length >= 6) return match[1].trim();
  return trimmed;
}

async function reverseGeocodeAmap(
  lat: number,
  lng: number,
  key: string,
): Promise<string | null> {
  const url = new URL("https://restapi.amap.com/v3/geocode/regeo");
  url.searchParams.set("key", key);
  url.searchParams.set("location", `${lng},${lat}`);
  url.searchParams.set("extensions", "base");

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = (await res.json()) as {
    status?: string;
    regeocode?: { formatted_address?: string };
  };

  if (data.status !== "1" || !data.regeocode?.formatted_address) return null;
  return shortenChineseAddress(data.regeocode.formatted_address);
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
    };
  };

  const parts = [
    data.address?.road,
    data.address?.neighbourhood ?? data.address?.suburb,
    data.address?.city,
  ].filter(Boolean);

  if (parts.length > 0) return parts.join("");
  if (data.display_name) return shortenChineseAddress(data.display_name.split(",")[0] ?? data.display_name);
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
  if (result.address) {
    return `已填入：${result.address}（可继续编辑）`;
  }
  return `已定位 ${formatCoordinates(result.lat, result.lng)}，请手动补充具体路名。`;
}
