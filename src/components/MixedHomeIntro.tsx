/** 混合首页：证据链品牌条 */
import { EVIDENCE_CHAIN_TAGLINE } from "@/lib/evidenceFields";

export default function MixedHomeIntro() {
  return (
    <div className="mb-4 px-0.5 pt-1 text-center sm:mb-5 md:text-left">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600">
        看见问题不难，留下证据才难
      </p>
      <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        基于 Gemma 4 的无障碍证据记录工具
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        {EVIDENCE_CHAIN_TAGLINE} · AI 辅助识别 · 建议人工复核
      </p>
    </div>
  );
}
