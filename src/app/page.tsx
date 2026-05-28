import ReportToolIntro from "@/components/ReportToolIntro";
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
import StoryFold from "@/components/StoryFold";
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

      <main className="relative mx-auto flex max-w-6xl flex-col px-0 pb-4 md:px-6 md:py-6 lg:py-10">
        <ScrollReveal
          delay={0.02}
          className="mobile-no-snap order-1 scroll-mt-20 md:scroll-mt-20"
        >
          <section id="tool" className="tool-rail scroll-mt-20">
            <div className="mx-auto max-w-6xl px-4 md:px-0">
              <ReportToolIntro />
              <AnalysisWorkflow />
            </div>
          </section>
        </ScrollReveal>

        <div className="mobile-no-snap order-2 scroll-mt-12 px-4 md:px-0">
          <RecordTimeline />
        </div>

        <div className="order-3 px-4 md:px-0">
          <StoryFold />
        </div>

        {showMvpPanels && (
          <div className="order-4 mt-10 scroll-mt-0 px-4 md:px-0">
            <OverlayShowcase />
          </div>
        )}

        {showMvpPanels && (
          <div className="order-5 mt-10 hidden px-4 md:block md:px-0">
            <HowItWorks />
          </div>
        )}
      </main>

      <ScrollReveal>
        <footer className="mt-12 border-t border-slate-200/60 bg-white/80 py-8 backdrop-blur-md md:py-12">
          <div className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-500 sm:px-6">
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
