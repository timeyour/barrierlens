import { isLocationUsable } from "@/lib/locationValidation";
import { reverseGeocodeAddressDetailed } from "@/lib/reverseGeocode";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json(
      { ok: false, message: "缺少有效坐标 lat/lng" },
      { status: 400 },
    );
  }

  const result = await reverseGeocodeAddressDetailed(lat, lng);

  return Response.json({
    ok: true,
    address: result.address,
    usable: isLocationUsable(result.address),
    amapConfigured: result.amapConfigured,
    amapError: result.amapError,
    source: result.source,
  });
}
