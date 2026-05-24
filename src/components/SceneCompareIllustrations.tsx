/** 内联 SVG 示意图，避免外链 SVG 在部分环境下无法作为 background 加载 */

export function SceneClearIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 900"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="scene-clear-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
        <filter id="scene-clear-blur">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <rect width="1200" height="900" fill="url(#scene-clear-bg)" />
      <g filter="url(#scene-clear-blur)" opacity="0.55">
        <rect x="80" y="60" width="220" height="320" fill="#64748B" rx="8" />
        <rect x="360" y="100" width="180" height="280" fill="#475569" rx="8" />
        <rect x="620" y="40" width="260" height="360" fill="#64748B" rx="8" />
        <rect x="920" y="120" width="200" height="240" fill="#475569" rx="8" />
        <circle cx="200" cy="520" r="70" fill="#059669" />
        <circle cx="980" cy="500" r="85" fill="#10B981" />
      </g>
      <rect x="0" y="520" width="1200" height="380" fill="#94A3B8" />
      <rect x="0" y="560" width="1200" height="340" fill="#CBD5E1" />
      <rect x="120" y="580" width="960" height="140" fill="#FBBF24" rx="4" />
      <g fill="#F59E0B">
        {[150, 210, 270, 330, 390, 450, 510, 570, 630, 690, 750, 810, 870, 930, 990].map(
          (x) => (
            <rect key={x} x={x} y="610" width="28" height="80" rx="3" />
          ),
        )}
      </g>
      <rect x="480" y="480" width="240" height="48" fill="#059669" rx="24" />
      <text
        x="600"
        y="512"
        textAnchor="middle"
        fill="white"
        fontFamily="system-ui,sans-serif"
        fontSize="22"
        fontWeight="700"
      >
        畅通 · 示意图
      </text>
    </svg>
  );
}

export function SceneBlockedIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 900"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="scene-blocked-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
        <filter id="scene-blocked-blur">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <rect width="1200" height="900" fill="url(#scene-blocked-bg)" />
      <g filter="url(#scene-blocked-blur)" opacity="0.55">
        <rect x="80" y="60" width="220" height="320" fill="#64748B" rx="8" />
        <rect x="360" y="100" width="180" height="280" fill="#475569" rx="8" />
        <rect x="620" y="40" width="260" height="360" fill="#64748B" rx="8" />
        <rect x="920" y="120" width="200" height="240" fill="#475569" rx="8" />
        <circle cx="200" cy="520" r="70" fill="#059669" />
        <circle cx="980" cy="500" r="85" fill="#10B981" />
      </g>
      <rect x="0" y="520" width="1200" height="380" fill="#94A3B8" />
      <rect x="0" y="560" width="1200" height="340" fill="#CBD5E1" />
      <rect x="120" y="580" width="960" height="140" fill="#FBBF24" rx="4" />
      <g fill="#F59E0B" opacity="0.45">
        {[150, 330, 510, 690, 870].map((x) => (
          <rect key={x} x={x} y="610" width="28" height="80" rx="3" />
        ))}
      </g>
      <g>
        <circle cx="340" cy="700" r="42" fill="#F97316" stroke="#C2410C" strokeWidth="4" />
        <circle cx="430" cy="700" r="42" fill="#F97316" stroke="#C2410C" strokeWidth="4" />
        <rect x="310" y="655" width="150" height="14" fill="#374151" rx="5" />
      </g>
      <g>
        <circle cx="560" cy="705" r="40" fill="#22C55E" stroke="#15803D" strokeWidth="4" />
        <circle cx="645" cy="705" r="40" fill="#22C55E" stroke="#15803D" strokeWidth="4" />
        <rect x="535" y="662" width="135" height="12" fill="#374151" rx="4" />
      </g>
      <g>
        <circle cx="780" cy="700" r="38" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="4" />
        <circle cx="860" cy="700" r="38" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="4" />
        <rect x="758" y="658" width="122" height="12" fill="#374151" rx="4" />
      </g>
      <line
        x1="120"
        y1="650"
        x2="1080"
        y2="650"
        stroke="#DC2626"
        strokeWidth="4"
        strokeDasharray="16 10"
      />
      <rect x="0" y="0" width="1200" height="900" fill="#DC2626" fillOpacity="0.06" />
      <rect x="480" y="480" width="240" height="48" fill="#DC2626" rx="24" />
      <text
        x="600"
        y="512"
        textAnchor="middle"
        fill="white"
        fontFamily="system-ui,sans-serif"
        fontSize="22"
        fontWeight="700"
      >
        占用 · 示意图
      </text>
    </svg>
  );
}
