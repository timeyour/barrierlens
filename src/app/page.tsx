import AnalysisWorkflow from "@/components/AnalysisWorkflow";

const TAGS = [
  "Gemma 4 Hackathon",
  "AI for Social Good",
  "Accessibility Feedback",
];

const METRICS = [
  { label: "真实测试照片", target: "≥ 30 张" },
  { label: "盲道占用识别准确率", target: "≥ 85%" },
  { label: "误报率", target: "≤ 15%" },
  { label: "报告生成成功率", target: "≥ 95%" },
  { label: "平均生成时间", target: "≤ 8 秒" },
  { label: "用户操作步骤", target: "≤ 4 步" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-blue-100 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
            Gemma 4 开发者大赛 2026 · 赛道 D
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            无碍 <span className="text-blue-600">BarrierLens</span>
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            让无障碍问题被看见、被记录、被反馈
          </p>
          <p className="mt-2 text-sm text-slate-500">
            基于 Gemma 4 的公众无障碍反馈生成工具
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">为什么需要无碍？</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            很多人看到无障碍问题，但不知道怎么描述、归谁管、怎么反馈。
          </p>
          <p className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900">
            我们把公众表达转成治理语言。
          </p>
          <p className="mt-4 text-xs text-slate-500">
            例如：「这里过不去」→「该处盲道连续性被占用物阻断，影响视障人士连续、安全通行…」
          </p>
        </section>

        <AnalysisWorkflow />

        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">量化目标（参赛）</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {METRICS.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="text-slate-600">{item.label}</span>
                <span className="font-medium text-emerald-700">{item.target}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-3xl px-4 text-center text-xs text-slate-500 sm:px-6">
          <p className="font-medium text-slate-700">小马过河 · Gemma 4 Hackathon 上海站</p>
          <p className="mt-2">
            无碍不是替代监管，而是降低公众参与无障碍反馈的门槛。
          </p>
          <p className="mt-1">
            BarrierLens is not designed to replace regulation, but to lower the
            barrier for public participation in accessibility feedback.
          </p>
        </div>
      </footer>
    </div>
  );
}
