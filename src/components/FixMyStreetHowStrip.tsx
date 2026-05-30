import AnchorLink from "@/components/AnchorLink";

const STEPS = [
  { title: "输入地点", desc: "路名、地标或当前位置" },
  { title: "拍照 + AI 分析", desc: "Gemma 生成结构化报告" },
  { title: "公开记录", desc: "可查看、可分享、可跟进" },
  { title: "发帖人确认整改", desc: "标记已整改并可选复拍" },
];

export default function FixMyStreetHowStrip() {
  return (
    <section id="how" className="scroll-mt-24 border-y border-slate-200/80 bg-slate-50/80 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-sm font-bold text-slate-900">如何报告问题</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <p className="text-[11px] font-semibold text-blue-700">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{step.title}</p>
              <p className="mt-0.5 text-xs text-slate-600">{step.desc}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          我们<strong className="font-semibold text-slate-700">不</strong>代您向政府部门提交投诉；生成报告后由您自行递出。AI 输出须人工核对。
        </p>
        <AnchorLink
          href="/#tool"
          className="mt-3 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          开始第一次报告 →
        </AnchorLink>
      </div>
    </section>
  );
}
