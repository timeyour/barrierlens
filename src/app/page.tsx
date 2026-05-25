import AnalysisWorkflow from "@/components/AnalysisWorkflow";
import HowItWorks from "@/components/HowItWorks";
import OverlayShowcase from "@/components/OverlayShowcase";
import HashScrollHandler from "@/components/HashScrollHandler";
import PageBackground from "@/components/PageBackground";
import ParallaxVideoHero from "@/components/ParallaxVideoHero";
import RecordTimeline from "@/components/RecordTimeline";
import ScrollProgressBar from "@/components/ScrollProgress";
import ScrollReveal from "@/components/ScrollReveal";
import SiteNav from "@/components/SiteNav";
import V2ScenarioCards from "@/components/V2ScenarioCards";
import { getModeLabel, resolveUiMode, type ModeSource } from "@/config/featureFlags";

function ModeBadge({ modeSourceLabel, modeLabel }: { modeSourceLabel: string; modeLabel: string }) {
  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-50 rounded-full border border-slate-200/90 bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur">
      当前模式：{modeLabel}（{modeSourceLabel}）
    </div>
  );
}

function firstValue(raw?: string | string[]): string | undefined {
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

function modeSourceToLabel(source: ModeSource): string {
  return source === "url" ? "URL 覆盖" : "环境变量";
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = (await searchParams) ?? {};
  const { mode, source } = resolveUiMode(firstValue(resolvedParams.mode));
  const showMvpPanels = mode === "mvp";
  const modeLabel = getModeLabel(mode);
  const modeSourceLabel = modeSourceToLabel(source);

  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <HashScrollHandler />
      <ScrollProgressBar />
      <SiteNav />
      <ParallaxVideoHero />
      <ModeBadge modeSourceLabel={modeSourceLabel} modeLabel={modeLabel} />

      <main className="relative mx-auto flex max-w-5xl flex-col px-4 py-4 md:px-6 md:py-10 lg:py-16">
        <ScrollReveal delay={0.05} className="order-1">
          <div id="tool" className="scroll-mt-20" aria-hidden="true" />
          <AnalysisWorkflow />
        </ScrollReveal>

        <div className="order-2">
          <RecordTimeline />
        </div>

        {!showMvpPanels && (
          <div className="order-3">
            <V2ScenarioCards />
          </div>
        )}

        {showMvpPanels && (
          <>
            <div id="story" className="order-3 scroll-mt-20" aria-hidden="true" />
            <div className="order-3 scroll-mt-0">
              <OverlayShowcase />
            </div>
          </>
        )}

        {showMvpPanels && (
          <div className="order-4 hidden md:block">
            <HowItWorks />
          </div>
        )}
      </main>

      <ScrollReveal>
        <footer className="border-t border-slate-200/60 bg-white/60 py-8 backdrop-blur-md md:py-12">
          <div className="mx-auto max-w-5xl px-4 text-center text-xs text-slate-500 sm:px-6">
            <p className="font-medium text-slate-700">无碍 BarrierLens</p>
            <p className="mt-2 hidden md:block">
              让分散的无障碍发现变成可被看见、被汇总的记录——可归档、可复查、可导出。
            </p>
            <p className="mt-2 md:hidden">让无障碍问题被看见、被记录</p>
          </div>
        </footer>
      </ScrollReveal>
    </div>
  );
}
