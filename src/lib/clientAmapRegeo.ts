import { parseAmapRegeocodePayload } from "@/lib/reverseGeocode";

type AmapJsonpPayload = Parameters<typeof parseAmapRegeocodePayload>[0];

/** 浏览器 JSONP 逆地理（国内用户首选；不依赖 Vercel 服务端访问高德） */
export function reverseGeocodeAmapJsonp(
  lat: number,
  lng: number,
  key: string,
): Promise<{ address: string | null; error: string | null }> {
  if (typeof window === "undefined") {
    return Promise.resolve({ address: null, error: "jsonp_ssr" });
  }

  return new Promise((resolve) => {
    const callbackName = `amapRegeo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const script = document.createElement("script");
    const timeoutMs = 12000;

    const cleanup = () => {
      window.clearTimeout(timer);
      delete (window as unknown as Record<string, unknown>)[callbackName];
      script.remove();
    };

    const timer = window.setTimeout(() => {
      cleanup();
      resolve({ address: null, error: "jsonp_timeout" });
    }, timeoutMs);

    (window as unknown as Record<string, (payload: AmapJsonpPayload) => void>)[
      callbackName
    ] = (payload) => {
      cleanup();
      resolve(parseAmapRegeocodePayload(payload));
    };

    const url = new URL("https://restapi.amap.com/v3/geocode/regeo");
    url.searchParams.set("key", key);
    url.searchParams.set("location", `${lng},${lat}`);
    url.searchParams.set("extensions", "all");
    url.searchParams.set("radius", "800");
    url.searchParams.set("roadlevel", "0");
    url.searchParams.set("output", "json");
    url.searchParams.set("callback", callbackName);

    script.src = url.toString();
    script.onerror = () => {
      cleanup();
      resolve({ address: null, error: "jsonp_script_error" });
    };
    document.head.appendChild(script);
  });
}
