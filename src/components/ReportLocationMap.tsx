"use client";

import LocationSchematicMap from "@/components/LocationSchematicMap";

interface ReportLocationMapProps {
  location: string;
  lat: number | null;
  lng: number | null;
  /** 与现场照片并排时使用 */
  dense?: boolean;
}

export default function ReportLocationMap({
  location,
  lat,
  lng,
  dense = false,
}: ReportLocationMapProps) {
  const hasCoords = lat != null && lng != null;

  return (
    <div className={dense ? "flex h-full min-h-0 flex-col" : "rounded-2xl border border-slate-200 bg-white p-5"}>
      <h3 className={`font-semibold text-slate-900 ${dense ? "text-xs" : "text-sm"}`}>
        大致位置
      </h3>
      {!dense && (
        <p className="mt-1 text-sm text-slate-600">{location}</p>
      )}

      {hasCoords ? (
        <div className={dense ? "mt-2 min-h-0 flex-1" : "mt-3"}>
          <LocationSchematicMap location={location} dense={dense} />
        </div>
      ) : (
        <p
          className={`rounded-lg bg-slate-50 text-slate-500 ${
            dense ? "mt-2 px-2 py-1.5 text-[10px] leading-snug" : "mt-3 px-3 py-2 text-[11px]"
          }`}
        >
          {dense
            ? "未获取定位"
            : "未获取定位。可在上报时点击「使用当前位置」，或补充文字路名描述。"}
        </p>
      )}
    </div>
  );
}
