"use client";

import {
  buildAmapStaticUrl,
  buildOsmEmbedUrl,
  formatCoordinates,
} from "@/lib/geolocation";

interface ReportLocationMapProps {
  location: string;
  lat: number | null;
  lng: number | null;
}

export default function ReportLocationMap({
  location,
  lat,
  lng,
}: ReportLocationMapProps) {
  const amapKey = process.env.NEXT_PUBLIC_AMAP_KEY;
  const hasCoords = lat != null && lng != null;
  const amapUrl =
    hasCoords && amapKey ? buildAmapStaticUrl(lat, lng, amapKey) : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">大致位置</h3>
      <p className="mt-1 text-sm text-slate-600">{location}</p>

      {hasCoords ? (
        <>
          <p className="mt-2 text-[11px] text-slate-500">
            坐标 {formatCoordinates(lat, lng)} · 供属地分派参考，非精确导航
          </p>
          {amapUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={amapUrl}
              alt={`${location} 地图位置`}
              className="mt-3 aspect-[2/1] w-full rounded-xl border border-slate-200 object-cover"
            />
          ) : (
            <iframe
              title={`${location} 地图`}
              src={buildOsmEmbedUrl(lat, lng)}
              className="mt-3 aspect-[2/1] w-full rounded-xl border border-slate-200"
              loading="lazy"
            />
          )}
        </>
      ) : (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
          未获取 GPS 坐标。可在上报时允许浏览器定位，或补充文字地点描述。
        </p>
      )}
    </div>
  );
}
