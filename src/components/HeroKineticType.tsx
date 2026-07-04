"use client";

import AnchorLink from "@/components/AnchorLink";
import { EVIDENCE_CHAIN_TAGLINE } from "@/lib/evidenceFields";

export default function HeroKineticType() {
  return (
    <div className="hero-kinetic relative mx-auto w-full max-w-2xl text-center">
      <p className="relative text-[clamp(1.25rem,3.5vw,1.75rem)] font-semibold leading-snug tracking-tight text-white">
        看见问题不难，留下证据才难
      </p>

      <p className="hero-kinetic-zh relative mt-5 text-[clamp(1.75rem,6vw,3.25rem)] font-bold leading-tight tracking-tight text-white">
        无碍 BarrierLens
      </p>

      <p className="relative mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/75">
        基于 Gemma 4 的无障碍证据记录工具
      </p>
      <p className="relative mx-auto mt-2 font-mono text-[11px] tracking-wide text-white/55 md:text-xs">
        {EVIDENCE_CHAIN_TAGLINE}
      </p>

      <div className="relative mt-8 md:mt-9">
        <AnchorLink
          href="#tool"
          className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 text-sm font-semibold text-white transition hover:border-white/55 hover:bg-white/15"
        >
          <span className="hero-kinetic-cta-arrow inline-block">↓</span>
          开始记录
        </AnchorLink>
      </div>
    </div>
  );
}
