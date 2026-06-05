"use client";

import AnchorLink from "@/components/AnchorLink";

const CAPS = "BARRIERLENS";

function KineticCaps() {
  return (
    <p
      className="hero-kinetic-caps mt-3 font-mono text-[clamp(1.35rem,4.2vw,2.75rem)] font-semibold uppercase leading-none tracking-[0.22em] text-white/95"
      aria-label="BarrierLens"
    >
      {CAPS.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="hero-kinetic-letter inline-block"
          style={{ animationDelay: `${index * 0.11}s` }}
        >
          {char}
        </span>
      ))}
    </p>
  );
}

export default function HeroKineticType() {
  return (
    <div className="hero-kinetic relative mx-auto w-full max-w-3xl text-center">
      <p className="hero-kinetic-zh relative text-[clamp(3.5rem,14vw,7.5rem)] font-bold leading-[0.92] tracking-tight text-white">
        <span className="hero-kinetic-zh-main inline-block">无碍</span>
      </p>

      <KineticCaps />

      <p className="relative mx-auto mt-4 max-w-[16rem] text-sm leading-snug text-white/75 md:max-w-xs md:text-[15px]">
        拍照留证，AI 快速生成报告
      </p>

      <div className="relative mt-7 md:mt-8">
        <AnchorLink
          href="#tool"
          className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-5 text-sm font-semibold tracking-wide text-white transition hover:border-white/55 hover:bg-white/15 md:rounded-none md:border-0 md:border-b md:border-white/40 md:bg-transparent md:px-0 md:pb-1 md:font-medium"
        >
          <span className="hero-kinetic-cta-arrow inline-block">↓</span>
          拍照记录
        </AnchorLink>
      </div>
    </div>
  );
}
