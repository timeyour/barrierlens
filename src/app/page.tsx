import ReportToolIntro from "@/components/ReportToolIntro";
import AnalysisWorkflow from "@/components/AnalysisWorkflow";
import EvidenceStory from "@/components/EvidenceStory";
import HomeFlowShowcase from "@/components/HomeFlowShowcase";
import FixMyStreetHomeStrip from "@/components/FixMyStreetHomeStrip";
import FixMyStreetHowStrip from "@/components/FixMyStreetHowStrip";
import FixMyStreetRecentReports from "@/components/FixMyStreetRecentReports";
import HowItWorks from "@/components/HowItWorks";
import MixedHomeWorkbench from "@/components/MixedHomeWorkbench";
import WorkflowFocusGate from "@/components/WorkflowFocusGate";
import MobileBottomNav from "@/components/MobileBottomNav";
import OverlayShowcase from "@/components/OverlayShowcase";
import HashScrollHandler from "@/components/HashScrollHandler";
import PageBackground from "@/components/PageBackground";
import ParallaxVideoHero from "@/components/ParallaxVideoHero";
import RecordTimeline from "@/components/RecordTimeline";
import ScrollProgressBar from "@/components/ScrollProgress";
import ScrollReveal from "@/components/ScrollReveal";
import SiteNav from "@/components/SiteNav";
import V2ScenarioCards from "@/components/V2ScenarioCards";
import { resolveNavLayoutFromSearchParam, type NavLayout } from "@/config/navLayout";
import { resolveWorkbenchLayout } from "@/config/workbenchLayout";
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
  const navLayout: NavLayout = resolveNavLayoutFromSearchParam(
    firstValue(resolvedParams.nav),
  );
  const workbenchLayout = resolveWorkbenchLayout(firstValue(resolvedParams.layout));
  const showMvpPanels = mode === "mvp";
  const isClassic = navLayout === "classic";
  const isMixed = navLayout === "mixed";
  const isFixMyStreet = navLayout === "fixmystreet";
  const mobileNavPad = isMixed || isFixMyStreet;

  return (
    <div className={`relative min-h-screen ${isMixed ? "mixed-home-layout" : ""}`}>
      <PageBackground />
      <HashScrollHandler />
      <ScrollProgressBar />
      <SiteNav initialLayout={navLayout} />
      <ParallaxVideoHero variant="full" singleViewport={isMixed} />
      {isMixed && <HomeFlowShowcase snapScreen={false} />}

      {isFixMyStreet && <FixMyStreetHomeStrip />}
      {isFixMyStreet && <FixMyStreetRecentReports />}
      {isFixMyStreet && <FixMyStreetHowStrip />}

      <main
        className={`relative z-20 isolate mx-auto flex max-w-6xl flex-col px-4 pb-4 md:px-6 md:py-10 lg:py-16 ${mobileNavPad ? "pb-24 md:pb-16" : ""} pt-0`}
      >
        {isMixed ? (
          <>
            <MixedHomeWorkbench layout={workbenchLayout} />
            <WorkflowFocusGate>
              <div className="mobile-no-snap scroll-mt-20 border-t border-slate-200/90 bg-slate-50/40 pt-10 md:scroll-mt-24 md:pt-14">
                <RecordTimeline />
              </div>
            </WorkflowFocusGate>
          </>
        ) : (
          <>
            {(isClassic || isFixMyStreet) && (
              <div className="mobile-snap-screen order-0 flex flex-col gap-3 bg-[var(--background)] px-0 py-5 md:contents md:min-h-0 md:bg-transparent md:py-0">
                {isClassic && (
                  <>
                    <EvidenceStory />
                    {!showMvpPanels && <V2ScenarioCards embedded />}
                  </>
                )}
              </div>
            )}

            <ScrollReveal
              delay={0.05}
              className="mobile-no-snap order-2 scroll-mt-20 pt-6 md:min-h-0 md:scroll-mt-20 md:py-0"
            >
              <div id="tool" className="scroll-mt-20" aria-hidden="true" />
              {isClassic && <ReportToolIntro />}
              {isFixMyStreet && (
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900">报告问题</h2>
                </div>
              )}
              <AnalysisWorkflow />
            </ScrollReveal>

            <div className="mobile-no-snap order-3 scroll-mt-16 pt-10 md:min-h-0 md:pt-0">
              <RecordTimeline />
            </div>

            {showMvpPanels && isClassic && (
              <>
                <div className="order-4 scroll-mt-0">
                  <OverlayShowcase />
                </div>
                <div className="order-5 hidden md:block">
                  <HowItWorks />
                </div>
              </>
            )}
          </>
        )}
      </main>

      <MobileBottomNav layout={navLayout} />

      <ScrollReveal>
        <footer className="border-t border-slate-200/60 bg-white/60 py-8 backdrop-blur-md md:py-12">
          <div className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-500 sm:px-6">
            <p className="font-medium text-slate-700">无碍 BarrierLens</p>
            {process.env.VERCEL_GIT_COMMIT_SHA && (
              <p className="mt-1 font-mono text-[10px] text-slate-400">
                构建 {process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)}
              </p>
            )}
          </div>
        </footer>
      </ScrollReveal>
    </div>
  );
}
