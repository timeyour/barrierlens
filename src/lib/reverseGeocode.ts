import { isCoordinatePlaceholder, isLocationUsable } from "@/lib/locationValidation";

type AmapAddressComponent = {
  province?: string;
  city?: string;
  district?: string;
  township?: string;
  street?: string;
  neighborhood?: { name?: string; type?: string };
  building?: { name?: string; type?: string };
  businessAreas?: Array<{ name?: string }>;
  streetNumber?: { street?: string; number?: string; distance?: string };
};

type AmapNamedNearby = { name?: string; distance?: string };
type AmapRoadInter = { first_name?: string; second_name?: string; distance?: string };

function getAmapKey(): string | undefined {
  const key =
    process.env.AMAP_WEB_KEY?.trim() ||
    process.env.NEXT_PUBLIC_AMAP_KEY?.trim() ||
    "";
  return key.length >= 16 ? key : undefined;
}

export function getPublicAmapKey(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const key = process.env.NEXT_PUBLIC_AMAP_KEY?.trim() ?? "";
  return key.length >= 16 ? key : undefined;
}

function normalizeAddressText(raw: string): string {
  return raw
    .replace(/^中国/, "")
    .replace(/\s+/g, "")
    .replace(/[,，;；]+/g, "")
    .trim();
}

function dedupeCityProvince(province: string, city: string): string {
  const p = province.trim();
  const c = city.trim();
  if (!p && !c) return "";
  if (!p) return c;
  if (!c) return p;
  if (p === c || p.replace(/省$/, "") === c.replace(/市$/, "")) return c;
  if (c.startsWith(p.replace(/省$/, ""))) return c;
  return `${p}${c}`;
}

/** 组装：省市 + 区 + 镇/街道 + 路名 */
function buildStructuredAddress(
  component: AmapAddressComponent,
  road?: string,
  number?: string,
): string | null {
  const region = dedupeCityProvince(component.province ?? "", component.city ?? "");
  const district = component.district?.trim() ?? "";
  const township = component.township?.trim() ?? "";
  const street =
    road?.trim() ||
    component.streetNumber?.street?.trim() ||
    component.street?.trim() ||
    "";
  const streetNo = number?.trim() || component.streetNumber?.number?.trim() || "";

  const parts: string[] = [];
  if (region) parts.push(region);
  if (district && !region.includes(district)) parts.push(district);
  if (township) parts.push(township);
  if (street) parts.push(`${street}${streetNo}`);

  const composed = normalizeAddressText(parts.join(""));
  if (!composed || isCoordinatePlaceholder(composed)) return null;
  return composed;
}

function pickNearestNamed(
  items: AmapNamedNearby[] | undefined,
  maxDistanceM = 400,
): string | undefined {
  if (!items?.length) return undefined;
  for (const item of items) {
    const name = item.name?.trim();
    if (!name) continue;
    const distance = Number(item.distance);
    if (!Number.isFinite(distance) || distance <= maxDistanceM) return name;
  }
  return items[0]?.name?.trim() || undefined;
}

function scoreLocationSpecificity(raw: string): number {
  let score = raw.length;
  if (/[省市]/.test(raw)) score += 8;
  if (/[区县]/.test(raw)) score += 10;
  if (/[镇街道]/.test(raw)) score += 8;
  if (/路|街|大道/.test(raw)) score += 24;
  if (/号|口|站|地铁|广场|公园|医院|学校|交叉口|附近/.test(raw)) score += 12;
  return score;
}

function pickBestUsableAddress(candidates: string[]): string | null {
  const normalized = [...new Set(candidates.map(normalizeAddressText).filter(Boolean))];
  const usable = normalized.filter(
    (item) => isLocationUsable(item) && !isCoordinatePlaceholder(item),
  );
  if (!usable.length) return null;
  return usable.sort((a, b) => scoreLocationSpecificity(b) - scoreLocationSpecificity(a))[0];
}

function pickBestPartialAddress(candidates: string[]): string | null {
  const normalized = [...new Set(candidates.map(normalizeAddressText).filter(Boolean))];
  const filtered = normalized.filter((item) => !isCoordinatePlaceholder(item));
  if (!filtered.length) return null;
  return filtered.sort((a, b) => scoreLocationSpecificity(b) - scoreLocationSpecificity(a))[0];
}

function extractRoadFromText(raw: string): string | null {
  const match =
    raw.match(/([\u4e00-\u9fa5]{2,10}路(?:[\d\-]+号?)?)/) ??
    raw.match(/([\u4e00-\u9fa5]{2,10}[街大道])/);
  return match?.[1] ?? null;
}

function formatRoadIntersection(
  inter: AmapRoadInter | undefined,
  prefix: string,
): string | null {
  if (!inter?.first_name?.trim()) return null;
  const a = inter.first_name.trim();
  const b = inter.second_name?.trim();
  const cross = b ? `${a}与${b}交叉口` : `${a}交叉口`;
  const composed = normalizeAddressText(`${prefix}${cross}`);
  return isLocationUsable(composed) ? composed : null;
}

export function formatAmapAddress(regeocode: {
  formatted_address?: string;
  addressComponent?: AmapAddressComponent;
  pois?: AmapNamedNearby[];
  roads?: AmapNamedNearby[];
  aois?: AmapNamedNearby[];
  roadinters?: AmapRoadInter[];
}): string | null {
  const component = regeocode.addressComponent;
  const candidates: string[] = [];

  if (regeocode.formatted_address) {
    candidates.push(normalizeAddressText(regeocode.formatted_address));
  }

  if (component) {
    const structured = buildStructuredAddress(component);
    if (structured) candidates.push(structured);

    const roadName = pickNearestNamed(regeocode.roads, 200);
    if (roadName) {
      const withRoad = buildStructuredAddress(component, roadName);
      if (withRoad) candidates.push(withRoad);
      candidates.push(normalizeAddressText(`${withRoad ?? ""}${roadName}附近`));
    }

    const building = component.building?.name?.trim();
    if (building) {
      const withBuilding = buildStructuredAddress(component, building);
      if (withBuilding) candidates.push(withBuilding);
    }

    const business = component.businessAreas?.[0]?.name?.trim();
    if (business) {
      const withBusiness = buildStructuredAddress(component, business);
      if (withBusiness) candidates.push(withBusiness);
    }
  }

  if (component) {
    const prefix = buildStructuredAddress(component) ?? dedupeCityProvince(
      component.province ?? "",
      component.city ?? "",
    ) + (component.district ?? "") + (component.township ?? "");

    for (const poi of regeocode.pois ?? []) {
      const poiName = poi.name?.trim();
      if (!poiName) continue;
      const withPoi = buildStructuredAddress(component, poiName);
      if (withPoi) candidates.push(withPoi);
      if (candidates.length > 14) break;
    }

    const aoiName = pickNearestNamed(regeocode.aois, 350);
    if (aoiName) {
      const withAoi = buildStructuredAddress(component, aoiName);
      if (withAoi) candidates.push(withAoi);
    }

    const inter = formatRoadIntersection(regeocode.roadinters?.[0], prefix);
    if (inter) candidates.push(inter);
  }

  if (regeocode.formatted_address && component) {
    const road =
      extractRoadFromText(regeocode.formatted_address) ??
      extractRoadFromText(normalizeAddressText(regeocode.formatted_address));
    if (road) {
      const withRoad = buildStructuredAddress(component, road);
      if (withRoad) candidates.push(withRoad);
    }
  }

  const best =
    pickBestUsableAddress(candidates) ?? pickBestPartialAddress(candidates);
  if (best) return best;

  const fallback = normalizeAddressText(regeocode.formatted_address ?? "");
  if (
    fallback &&
    /[\u4e00-\u9fa5]{2,}/.test(fallback) &&
    !isCoordinatePlaceholder(fallback)
  ) {
    return fallback;
  }
  return null;
}

export type ReverseGeocodeResult = {
  address: string | null;
  source: "amap" | "nominatim" | null;
  amapConfigured: boolean;
  amapError: string | null;
};

type AmapRegeocodePayload = {
  status?: string;
  info?: string;
  infocode?: string;
  regeocode?: {
    formatted_address?: string;
    addressComponent?: AmapAddressComponent;
    pois?: AmapNamedNearby[];
    roads?: AmapNamedNearby[];
    aois?: AmapNamedNearby[];
    roadinters?: AmapRoadInter[];
  };
};

function parseAmapRegeocodePayload(data: AmapRegeocodePayload): {
  address: string | null;
  error: string | null;
} {
  if (data.status !== "1" || !data.regeocode) {
    return { address: null, error: data.info?.trim() || "amap_regeo_failed" };
  }
  const address = formatAmapAddress(data.regeocode);
  if (address && !isCoordinatePlaceholder(address)) {
    return { address, error: null };
  }
  const raw = normalizeAddressText(data.regeocode.formatted_address ?? "");
  if (raw && /[\u4e00-\u9fa5]{2,}/.test(raw) && !isCoordinatePlaceholder(raw)) {
    return { address: raw, error: null };
  }
  return { address: null, error: data.info?.trim() || "amap_no_chinese_address" };
}

function amapFetchErrorCode(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return "amap_request_timeout";
    }
    return `amap_request_failed:${error.name}`;
  }
  return "amap_request_failed";
}

async function reverseGeocodeAmap(
  lat: number,
  lng: number,
  key: string,
): Promise<{ address: string | null; error: string | null }> {
  const url = new URL("https://restapi.amap.com/v3/geocode/regeo");
  url.searchParams.set("key", key);
  url.searchParams.set("location", `${lng},${lat}`);
  url.searchParams.set("extensions", "all");
  url.searchParams.set("radius", "800");
  url.searchParams.set("roadlevel", "0");

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "BarrierLens/1.0",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) return { address: null, error: `amap_http_${res.status}` };

  const data = (await res.json()) as AmapRegeocodePayload;
  return parseAmapRegeocodePayload(data);
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
      house_number?: string;
      neighbourhood?: string;
      suburb?: string;
      city?: string;
      county?: string;
      state?: string;
      town?: string;
    };
  };

  const addr = data.address;
  if (addr) {
    const parts = [
      addr.state ?? addr.county,
      addr.city ?? addr.town,
      addr.suburb ?? addr.neighbourhood,
      addr.road,
      addr.house_number,
    ].filter(Boolean);
    const joined = normalizeAddressText(parts.join(""));
    if (isLocationUsable(joined) && !isCoordinatePlaceholder(joined)) return joined;
  }

  if (data.display_name) {
    const segments = data.display_name
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 4);
    const joined = normalizeAddressText(segments.join(""));
    if (isLocationUsable(joined) && !isCoordinatePlaceholder(joined)) return joined;
  }
  return null;
}

export async function reverseGeocodeAddress(
  lat: number,
  lng: number,
): Promise<string | null> {
  const result = await reverseGeocodeAddressDetailed(lat, lng);
  return result.address;
}

export async function reverseGeocodeAddressDetailed(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult> {
  const amapConfigured = Boolean(getAmapKey());
  const amapKey = getAmapKey();
  let amapError: string | null = amapConfigured ? null : "amap_key_missing";

  if (amapKey) {
    try {
      const amap = await reverseGeocodeAmap(lat, lng, amapKey);
      if (amap.address) {
        return {
          address: amap.address,
          source: "amap",
          amapConfigured: true,
          amapError: null,
        };
      }
      amapError = amap.error;
    } catch (error) {
      amapError = amapFetchErrorCode(error);
    }
  }

  try {
    const address = await reverseGeocodeNominatim(lat, lng);
    if (address && !isCoordinatePlaceholder(address)) {
      return {
        address,
        source: "nominatim",
        amapConfigured,
        amapError,
      };
    }
  } catch {
    /* ignore */
  }

  return {
    address: null,
    source: null,
    amapConfigured,
    amapError,
  };
}

export function reverseGeocodeConfigured(): boolean {
  return Boolean(getAmapKey());
}

export { parseAmapRegeocodePayload };
