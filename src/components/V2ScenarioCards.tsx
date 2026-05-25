"use client";

import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const SCENES = [
  {
    title: "盲道占用",
    desc: "识别共享单车、电瓶车、杂物对盲道连续通行的阻断风险。",
    tag: "tactile_paving_blocked",
  },
  {
    title: "入口 / 坡道受阻",
    desc: "识别无障碍入口净宽受阻、坡道被挡、入口可达性下降问题。",
    tag: "accessible_entrance_blocked",
  },
  {
    title: "通行链断点",
    desc: "识别路缘坡道缺失、门槛高差、围挡绕行等连续路径断裂风险。",
    tag: "access_route_discontinuity",
  },
];

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
        <SectionHeader
          eyebrow="Scope"
          title="公共空间无障碍通行风险"
          description={
            compact
              ? "三类核心场景"
              : "从单点识别升级为三类核心场景：盲道占用、入口受阻、通行链断点。"
          }
          align="center"
          titleClassName={compact ? "text-lg" : undefined}
          descriptionClassName={compact ? "text-xs" : undefined}
        />
        <div className={`grid gap-2 ${compact ? "mt-2" : "mt-3 md:grid-cols-3 md:gap-3"}`}>
          {SCENES.map((scene) => (
            <div
              key={scene.tag}
              className={`rounded-xl border border-slate-200 bg-slate-50 ${
                compact ? "px-3 py-2.5" : "p-4"
              }`}
            >
              <p className={`font-semibold text-slate-900 ${compact ? "text-xs" : "text-sm"}`}>
                {scene.title}
              </p>
              {!compact && (
                <>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{scene.desc}</p>
                  <p className="mt-2 font-mono text-[11px] text-slate-400">{scene.tag}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
