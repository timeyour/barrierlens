/** 混合首页：轻量品牌条，替代全屏 Hero，避免与表单区粘在一起 */
export default function MixedHomeIntro() {
  return (
    <div className="mb-4 px-0.5 pt-1 text-center sm:mb-5 md:text-left">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600">
        BarrierLens
      </p>
      <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        无碍
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        拍现场 · AI 写成可提交报告
      </p>
    </div>
  );
}
