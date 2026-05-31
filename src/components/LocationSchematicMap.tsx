"use client";

import { useId, useState } from "react";
import MediaLightbox from "@/components/MediaLightbox";

interface LocationSchematicMapProps {
  location: string;
  dense?: boolean;
}

function SchematicSvg({ patternId }: { patternId: string }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 640 320"
      aria-hidden
    >
      <defs>
        <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="0.6"
          />
        </pattern>
      </defs>
      <rect width="640" height="320" fill={`url(#${patternId})`} />
      <path
        d="M0 180 Q160 160 320 175 T640 165"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M120 0 L120 320 M400 0 L400 320"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="320" cy="172" r="28" fill="#2563eb" opacity="0.12" />
      <circle cx="320" cy="172" r="9" fill="#2563eb" stroke="#fff" strokeWidth="3" />
      <path
        d="M320 148 L330 172 L320 166 L310 172 Z"
        fill="#1d4ed8"
        stroke="#fff"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** 不依赖外网的位置示意图（国内网络 fallback） */
export default function LocationSchematicMap({
  location,
  dense = false,
}: LocationSchematicMapProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const patternId = useId().replace(/:/g, "");

  const mapBody = (
    <>
      <SchematicSvg patternId={patternId} />
      <p className="absolute bottom-2 left-3 right-3 truncate rounded-md bg-white/90 px-2 py-1 text-[10px] text-slate-600 shadow-sm">
        {location}
      </p>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className={`group relative w-full overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 text-left transition hover:ring-2 hover:ring-blue-400/60 ${
          dense ? "aspect-[4/3] max-h-44" : "aspect-[2/1] rounded-xl"
        }`}
        aria-label="放大查看大致位置"
      >
        {mapBody}
        <span className="absolute right-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
          点击放大
        </span>
      </button>

      <MediaLightbox
        open={lightboxOpen}
        title="大致位置"
        zoomable
        onClose={() => setLightboxOpen(false)}
      >
        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
          {mapBody}
        </div>
      </MediaLightbox>
    </>
  );
}
