interface LocationSchematicMapProps {
  location: string;
}

/** 不依赖外网的位置示意图（国内网络 fallback） */
export default function LocationSchematicMap({
  location,
}: LocationSchematicMapProps) {
  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 640 320"
        aria-hidden
      >
        <defs>
          <pattern id="loc-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="640" height="320" fill="url(#loc-grid)" />
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
      <p className="absolute bottom-2 left-3 right-3 truncate rounded-md bg-white/90 px-2 py-1 text-[10px] text-slate-600 shadow-sm">
        {location}
      </p>
    </div>
  );
}
