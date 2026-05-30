export function getBrowserLocation(): Promise<{ lat: number; lng: number } | null> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  const cached = loadPrefillCoords();
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        savePrefillCoords(coords.lat, coords.lng);
        resolve(coords);
      },
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120_000 },
    );
  });
}

const PREFILL_COORDS_KEY = "barrierlens_prefill_coords";

export function savePrefillCoords(lat: number, lng: number): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    PREFILL_COORDS_KEY,
    JSON.stringify({ lat, lng, savedAt: Date.now() }),
  );
}

export function loadPrefillCoords(): { lat: number; lng: number } | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PREFILL_COORDS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { lat?: number; lng?: number; savedAt?: number };
    if (typeof parsed.lat !== "number" || typeof parsed.lng !== "number") return null;
    if (parsed.savedAt && Date.now() - parsed.savedAt > 30 * 60_000) {
      sessionStorage.removeItem(PREFILL_COORDS_KEY);
      return null;
    }
    return { lat: parsed.lat, lng: parsed.lng };
  } catch {
    return null;
  }
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function buildOsmEmbedUrl(lat: number, lng: number): string {
  const delta = 0.004;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

/** 静态示意图，无 iframe 底部链接栏 */
export function buildOsmStaticMapUrl(
  lat: number,
  lng: number,
  size = "640x320",
): string {
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: "14",
    size,
    markers: `${lat},${lng},lightblue1`,
  });
  return `https://staticmap.openstreetmap.de/staticmap.php?${params.toString()}`;
}

export function buildAmapStaticUrl(
  lat: number,
  lng: number,
  key?: string,
): string | null {
  if (!key) return null;
  const params = new URLSearchParams({
    location: `${lng},${lat}`,
    zoom: "16",
    size: "640*320",
    markers: `mid,0x2563eb,1:${lng},${lat}`,
    key,
  });
  return `https://restapi.amap.com/v3/staticmap?${params.toString()}`;
}
