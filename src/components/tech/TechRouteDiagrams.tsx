import type { ReactNode } from "react";

const TONE_STYLES = {
  sky: {
    lane: "border-sky-200 bg-sky-50/80",
    badge: "bg-sky-100 text-sky-800",
    node: "border-sky-200/80 bg-white text-sky-950",
  },
  violet: {
    lane: "border-violet-200 bg-violet-50/80",
    badge: "bg-violet-100 text-violet-800",
    node: "border-violet-200/80 bg-white text-violet-950",
  },
  emerald: {
    lane: "border-emerald-200 bg-emerald-50/80",
    badge: "bg-emerald-100 text-emerald-800",
    node: "border-emerald-200/80 bg-white text-emerald-950",
  },
  blue: {
    lane: "border-blue-200 bg-blue-50/80",
    badge: "bg-blue-100 text-blue-800",
    node: "border-blue-200/80 bg-white text-blue-950",
  },
  slate: {
    lane: "border-slate-200 bg-slate-50/80",
    badge: "bg-slate-100 text-slate-700",
    node: "border-slate-200/80 bg-white text-slate-800",
  },
} as const;

type Tone = keyof typeof TONE_STYLES;

function FlowArrow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center text-slate-300 ${className}`}
      aria-hidden
    >
      <span className="hidden md:inline text-lg">→</span>
      <span className="md:hidden text-base">↓</span>
    </div>
  );
}

function FlowNode({ label, mono = false }: { label: string; mono?: boolean }) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-lg border px-2.5 py-1.5 text-center text-[11px] font-semibold leading-snug shadow-sm md:text-xs ${
        mono ? "font-mono font-medium" : ""
      }`}
    >
      {label}
    </span>
  );
}

const DATA_FLOW_PHASES: {
  label: string;
  tone: Tone;
  steps: readonly string[];
}[] = [
  {
    label: "输入",
    tone: "sky",
    steps: ["现场照片", "前端压缩与表单校验"],
  },
  {
    label: "Gemma 4",
    tone: "violet",
    steps: ["/api/analyze", "Gemma 4 多模态分析", "结构化 JSON"],
  },
  {
    label: "证据闭环",
    tone: "emerald",
    steps: [
      "报告展示",
      "本机 localStorage 归档",
      "可选 Supabase 公开案例",
      "复查状态更新",
    ],
  },
];

export function TechDataFlowDiagram() {
  return (
    <div className="space-y-4" role="img" aria-label="核心数据流：输入、Gemma 4 分析、证据闭环三阶段">
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        {DATA_FLOW_PHASES.map((phase, phaseIndex) => {
          const styles = TONE_STYLES[phase.tone];
          return (
            <div key={phase.label} className="flex min-w-0 flex-1 flex-col md:flex-row md:items-center">
              <div
                className={`flex min-w-0 flex-1 flex-col rounded-xl border p-3 md:p-4 ${styles.lane}`}
              >
                <span
                  className={`mb-3 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles.badge}`}
                >
                  {phase.label}
                </span>
                <div className="flex flex-col gap-2 md:gap-2.5">
                  {phase.steps.map((step, stepIndex) => (
                    <div key={step} className="flex flex-col items-center gap-2 md:items-stretch">
                      <div className={`w-full rounded-lg border px-1 py-1 ${styles.node}`}>
                        <FlowNode label={step} mono={step.startsWith("/")} />
                      </div>
                      {stepIndex < phase.steps.length - 1 && (
                        <FlowArrow className="py-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {phaseIndex < DATA_FLOW_PHASES.length - 1 && (
                <FlowArrow className="px-2 py-2 md:px-3 md:py-0" />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500">
        从左到右（手机自上而下）：现场输入 → Gemma 4 结构化分析 → 本机归档与可选公开、复查闭环。
      </p>
    </div>
  );
}

const GEMMA_LAYERS = [
  {
    layer: "浏览器",
    title: "#tool 工作台",
    subtitle: "AnalysisWorkflow · 图片 + 地点 FormData",
    path: null as string | null,
    tone: "sky" as Tone,
    highlight: false,
  },
  {
    layer: "API 入口",
    title: "POST /api/analyze",
    subtitle: "统一分析入口 · 返回 analysisSource + model",
    path: "src/app/api/analyze/route.ts",
    tone: "blue" as Tone,
    highlight: false,
  },
  {
    layer: "Gemma 4",
    title: "src/lib/gemma.ts",
    subtitle: "Google REST generateContent · gemma-4-26b-a4b-it",
    path: "src/lib/gemma.ts",
    tone: "violet" as Tone,
    highlight: true,
  },
  {
    layer: "本地 / 降级",
    title: "复现与演示分支",
    subtitle: "ollama.ts · mockAnalysis.ts（非 Production 主路径）",
    path: null,
    tone: "slate" as Tone,
    highlight: false,
    branches: [
      { path: "src/lib/ollama.ts", label: "Ollama 本地复现" },
      { path: "src/lib/mockAnalysis.ts", label: "mock / mock_fallback" },
    ],
  },
  {
    layer: "结构化输出",
    title: "AnalysisResult JSON",
    subtitle: "风险 · 障碍 · 建议 · 复查状态",
    path: "src/types/analysis.ts",
    tone: "emerald" as Tone,
    highlight: false,
  },
] as const;

export function TechGemmaChainDiagram() {
  return (
    <div className="relative space-y-0" role="img" aria-label="Gemma 4 调用分层：浏览器、API、模型、降级分支、JSON 输出">
      {GEMMA_LAYERS.map((item, index) => {
        const styles = TONE_STYLES[item.tone];
        return (
          <div key={item.layer} className="relative flex gap-3 pb-4 last:pb-0">
            <div className="flex w-16 shrink-0 flex-col items-center md:w-20">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${styles.badge}`}
              >
                {item.layer}
              </span>
              {index < GEMMA_LAYERS.length - 1 && (
                <div
                  className="mt-2 w-px flex-1 bg-gradient-to-b from-slate-300 to-slate-200"
                  aria-hidden
                />
              )}
            </div>
            <div
              className={`min-w-0 flex-1 rounded-xl border p-3 md:p-4 ${
                item.highlight
                  ? "border-violet-300 bg-violet-50/90 ring-2 ring-violet-200/60"
                  : `${styles.lane}`
              }`}
            >
              <p className="text-sm font-bold text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.subtitle}</p>
              {item.path && (
                <code className="mt-2 inline-block rounded bg-white/80 px-2 py-0.5 text-[10px] text-slate-800">
                  {item.path}
                </code>
              )}
              {"branches" in item && item.branches && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.branches.map((branch) => (
                    <div
                      key={branch.path}
                      className="rounded-lg border border-slate-200 bg-white/90 px-2.5 py-2 text-[10px]"
                    >
                      <span className="font-semibold text-slate-800">{branch.label}</span>
                      <code className="mt-1 block text-slate-600">{branch.path}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const SOURCE_BADGES: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  gemma: {
    label: "真实推理",
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    dot: "bg-emerald-500",
  },
  ollama: {
    label: "本地复现",
    className: "border-blue-200 bg-blue-50 text-blue-900",
    dot: "bg-blue-500",
  },
  mock: {
    label: "演示数据",
    className: "border-amber-200 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
  },
  mock_fallback: {
    label: "降级演示",
    className: "border-orange-200 bg-orange-50 text-orange-900",
    dot: "bg-orange-500",
  },
};

export function TechAnalysisSourceTable({
  rows,
}: {
  rows: readonly { value: string; meaning: string }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] text-left text-xs md:text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="pb-2 pr-4 font-semibold">值</th>
            <th className="pb-2 pr-4 font-semibold">类型</th>
            <th className="pb-2 font-semibold">含义</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const badge = SOURCE_BADGES[row.value];
            return (
              <tr key={row.value} className="border-b border-slate-100 last:border-0">
                <td className="py-2.5 pr-4 align-top">
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                    {row.value}
                  </code>
                </td>
                <td className="py-2.5 pr-4 align-top">
                  {badge && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  )}
                </td>
                <td className="py-2.5 text-slate-700">{row.meaning}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TechVerifyTimeline({
  steps,
}: {
  steps: readonly { step: string; text: ReactNode }[];
}) {
  return (
    <ol className="relative space-y-0 border-l-2 border-emerald-200 pl-6">
      {steps.map((item, index) => (
        <li key={item.step} className={`relative ${index < steps.length - 1 ? "pb-6" : ""}`}>
          <span
            className="absolute -left-[1.65rem] flex h-7 w-7 items-center justify-center rounded-full border-2 border-emerald-200 bg-white text-xs font-bold text-emerald-800 shadow-sm"
            aria-hidden
          >
            {item.step}
          </span>
          <p className="text-sm leading-relaxed text-slate-700">{item.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function TechStorageDiagram() {
  const items = [
    { label: "默认", value: "localStorage 本机归档", tone: "sky" as Tone },
    { label: "可选", value: "Supabase 公开案例（用户确认）", tone: "emerald" as Tone },
    { label: "隐私", value: "公开位置模糊 · Key 不入库", tone: "slate" as Tone },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3" role="img" aria-label="存储与隐私三要点">
      {items.map((item) => {
        const styles = TONE_STYLES[item.tone];
        return (
          <div
            key={item.label}
            className={`rounded-xl border p-3 text-center ${styles.lane}`}
          >
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${styles.badge}`}
            >
              {item.label}
            </span>
            <p className="mt-2 text-xs font-semibold leading-snug text-slate-800">
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
