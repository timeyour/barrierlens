"use client";

import ScrollReveal from "@/components/ScrollReveal";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const SCENES = ["盲道占用", "入口坡道受阻", "通行链断点"];

export default function V2ScenarioCards({
  compact: compactProp,
  embedded = false,
  className = "",
}: {
  compact?: boolean;
  embedded?: boolean;
  className?: string;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const compact = compactProp ?? isMobile;
  const showEmbedded = embedded && isMobile;

  return (
    <ScrollReveal>
      <section
        id="scenes"
        className={`scroll-mt-20 ${
          showEmbedded
            ? "border-0 bg-transparent p-0 shadow-none"
            : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
        } ${compact ? "mb-0" : "mb-6 md:mb-10"} ${className}`}
      >
        <h2 className="text-center text-base font-bold text-slate-900 md:text-lg">
          三类场景
        </h2>
        <div
          className={`flex flex-wrap justify-center gap-2 ${
            compact ? "mt-2" : "mt-3"
          }`}
        >
          {SCENES.map((scene) => (
            <span
              key={scene}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              {scene}
            </span>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
