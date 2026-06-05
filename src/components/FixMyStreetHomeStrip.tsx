"use client";

import AnchorLink from "@/components/AnchorLink";
import { isCoordinatePlaceholder, sanitizeLocationForStorage } from "@/lib/locationValidation";
import { applyUserLocationToInput } from "@/lib/userLocation";
import { persistLocationPrefill } from "@/lib/prefillLocation";
import { scrollToAnchor } from "@/lib/scrollAnchor";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function FixMyStreetHomeStrip() {
  const [location, setLocation] = useState("");
  const [geoNote, setGeoNote] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(false);
  const router = useRouter();

  const goReport = (place?: string) => {
    const value = sanitizeLocationForStorage(place ?? location);
    if (value) persistLocationPrefill(value);
    scrollToAnchor("#tool");
    router.replace("/?nav=fixmystreet#tool", { scroll: false });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    goReport();
  };

  const handleGeo = async () => {
    setGeoLoading(true);
    setGeoError(false);
    setGeoNote("正在获取位置并解析路名…");
    const { note, isError } = await applyUserLocationToInput(setLocation);
    setGeoLoading(false);
    setGeoError(isError);
    setGeoNote(note);
  };

  return (
    <section className="relative z-10 -mt-6 px-4 sm:-mt-10 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-lg backdrop-blur-sm sm:p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          报告无障碍通行问题
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
          输入路名或地标，或通过照片开始
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          如盲道占用、入口坡道受阻、通行链断点——生成可跟进的公开记录。
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="text"
            value={location}
            onChange={(e) => {
              const next = e.target.value;
              setLocation(isCoordinatePlaceholder(next) ? "" : next);
            }}
            placeholder="例如：XX 路南侧便道、XX 地铁 3 号口东侧"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" className="btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold">
              定位并继续
            </button>
            <button
              type="button"
              disabled={geoLoading}
              onClick={() => void handleGeo()}
              className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              {geoLoading ? "定位中…" : "使用当前位置"}
            </button>
            <AnchorLink
              href="/#tool"
              onClick={() => goReport()}
              className="btn-secondary rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
            >
              直接拍照报告
            </AnchorLink>
          </div>
        </form>
        {geoNote && (
          <p
            className={`mt-2 text-xs ${geoError ? "text-amber-800" : "text-emerald-800"}`}
            role="status"
          >
            {geoNote}
          </p>
        )}
      </div>
    </section>
  );
}
