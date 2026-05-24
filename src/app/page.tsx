import HackathonBrief from "@/components/HackathonBrief";
import AnalysisWorkflow from "@/components/AnalysisWorkflow";
import BentoMetrics from "@/components/BentoMetrics";
import HowItWorks from "@/components/HowItWorks";
import OverlayShowcase from "@/components/OverlayShowcase";
import PageBackground from "@/components/PageBackground";
import ParallaxVideoHero from "@/components/ParallaxVideoHero";
import RecordTimeline from "@/components/RecordTimeline";
import ScrollProgressBar from "@/components/ScrollProgress";
import ScrollReveal from "@/components/ScrollReveal";
import SiteNav from "@/components/SiteNav";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <ScrollProgressBar />
      <SiteNav />
      <ParallaxVideoHero />

      <main className="relative mx-auto flex max-w-5xl flex-col px-4 py-4 md:px-6 md:py-10 lg:py-16">
        <ScrollReveal delay={0.05} className="order-1 md:order-3">
          <div id="tool" className="scroll-mt-20 md:scroll-mt-28">
            <AnalysisWorkflow />
          </div>
        </ScrollReveal>

        <div id="story" className="order-2 md:order-1">
          <OverlayShowcase />
        </div>

        <div className="order-3 hidden md:order-2 md:block">
          <HowItWorks />
        </div>

        <div className="order-4 md:order-4">
          <RecordTimeline />
        </div>

        <div id="metrics" className="order-5 hidden md:order-5 md:block">
          <BentoMetrics />
          <HackathonBrief />
        </div>
      </main>

      <ScrollReveal>
        <footer className="border-t border-slate-200/60 bg-white/60 py-8 backdrop-blur-md md:py-12">
          <div className="mx-auto max-w-5xl px-4 text-center text-xs text-slate-500 sm:px-6">
            <p className="font-medium text-slate-700">
              小马过河 · Gemma 4 Hackathon 上海站
            </p>
            <p className="mt-2 hidden md:block">
              无碍让分散的无障碍发现变成可被看见、被汇总的记录——反馈给社会，而不只是某一次投诉。
            </p>
            <p className="mt-2 md:hidden">无碍 · 让无障碍问题被看见、被记录</p>
          </div>
        </footer>
      </ScrollReveal>
    </div>
  );
}
