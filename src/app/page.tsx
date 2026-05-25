import AnalysisWorkflow from "@/components/AnalysisWorkflow";
import EvidenceStory from "@/components/EvidenceStory";
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
import { resolveUiMode } from "@/config/featureFlags";

function firstValue(raw?: string | string[]): string | undefined {
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = (await searchParams) ?? {};
  const { mode } = resolveUiMode(firstValue(resolvedParams.mode));
  const showMvpPanels = mode === "mvp";

  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <HashScrollHandler />
      <ScrollProgressBar />
      <SiteNav />
      <ParallaxVideoHero />

      <main className="relative mx-auto flex max-w-5xl flex-col px-4 pb-4 pt-0 md:px-6 md:py-10 lg:py-16">
        <div className="mobile-page-panel order-0 flex min-h-[100svh] flex-col justify-center gap-3 py-16 md:contents md:min-h-0 md:py-0">
          <EvidenceStory />
          {!showMvpPanels && <V2ScenarioCards embedded />}
        </div>

        <div className="mobile-page-break md:hidden" aria-hidden />

        <ScrollReveal
          delay={0.05}
          className="mobile-page-panel order-2 min-h-[100svh] py-16 md:min-h-0 md:py-0"
        >
          <div id="tool" className="scroll-mt-20" aria-hidden="true" />
          <AnalysisWorkflow />
        </ScrollReveal>

        <div className="mobile-page-break md:hidden" aria-hidden />

        <div className="mobile-page-panel order-3 min-h-[100svh] py-16 md:min-h-0 md:py-0">
          <RecordTimeline />
        </div>

        {showMvpPanels && (
          <div className="order-4 scroll-mt-0">
            <OverlayShowcase />
          </div>
        )}

        {showMvpPanels && (
          <div className="order-5 hidden md:block">
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
