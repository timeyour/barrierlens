import AnalysisWorkflow from "@/components/AnalysisWorkflow";
import BentoMetrics from "@/components/BentoMetrics";
import HowItWorks from "@/components/HowItWorks";
import OverlayShowcase from "@/components/OverlayShowcase";
import PageBackground from "@/components/PageBackground";
import ParallaxVideoHero from "@/components/ParallaxVideoHero";
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

      <main className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <div id="story">
          <OverlayShowcase />
        </div>

        <HowItWorks />

        <ScrollReveal delay={0.05}>
          <div id="tool" className="scroll-mt-28">
            <AnalysisWorkflow />
          </div>
        </ScrollReveal>

        <div id="metrics">
          <BentoMetrics />
        </div>
      </main>

      <ScrollReveal>
        <footer className="border-t border-slate-200/60 bg-white/60 py-12 backdrop-blur-md">
          <div className="mx-auto max-w-5xl px-4 text-center text-xs text-slate-500 sm:px-6">
            <p className="font-medium text-slate-700">
              小马过河 · Gemma 4 Hackathon 上海站
            </p>
            <p className="mt-2">
              无碍不是替代监管，而是降低公众参与无障碍反馈的门槛。
            </p>
          </div>
        </footer>
      </ScrollReveal>
    </div>
  );
}
