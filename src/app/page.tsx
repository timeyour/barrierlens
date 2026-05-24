import AnalysisWorkflow from "@/components/AnalysisWorkflow";
import OverlayShowcase from "@/components/OverlayShowcase";
import ParallaxVideoHero from "@/components/ParallaxVideoHero";

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
      <ParallaxVideoHero />

      <main className="relative mx-auto max-w-4xl px-3 py-8 sm:px-6 sm:py-14">
        <OverlayShowcase />

        <AnalysisWorkflow />

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40 sm:mt-12 sm:rounded-3xl sm:p-8">
          <h2 className="text-sm font-semibold text-slate-900">量化目标（参赛）</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {METRICS.map((item, index) => (
              <li
                key={item.label}
                className="metric-item flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/50 px-4 py-3 text-sm ring-1 ring-slate-100"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span className="text-slate-600">{item.label}</span>
                <span className="font-semibold text-emerald-700">{item.target}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-4xl px-4 text-center text-xs text-slate-500 sm:px-6">
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
