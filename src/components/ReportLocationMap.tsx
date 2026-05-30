"use client";

import LocationSchematicMap from "@/components/LocationSchematicMap";

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
  const hasCoords = lat != null && lng != null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">大致位置</h3>
      <p className="mt-1 text-sm text-slate-600">{location}</p>

      {hasCoords ? (
        <div className="mt-3">
          <LocationSchematicMap location={location} />
        </div>
      ) : (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
          未获取定位。可在上报时点击「使用当前位置」，或补充文字路名描述。
        </p>
      )}
    </div>
  );
}
