export function getBrowserLocation(): Promise<{ lat: number; lng: number } | null> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120_000 },
    );
  });
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function buildOsmEmbedUrl(lat: number, lng: number): string {
  const delta = 0.004;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
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
