"use client";

import AnchorLink from "@/components/AnchorLink";

const CAPS = "BARRIERLENS";
const RHYTHM = ["拍", "·", "留", "·", "证"] as const;

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

function RhythmLine() {
  return (
    <p className="hero-kinetic-rhythm mt-5 text-[11px] font-medium uppercase tracking-[0.35em] text-white/55 md:text-xs">
      {RHYTHM.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`hero-kinetic-rhythm-item inline-block ${item === "·" ? "mx-1 opacity-40" : ""}`}
          style={{ animationDelay: `${index * 0.18}s` }}
        >
          {item}
        </span>
      ))}
    </p>
  );
}

function ConductorArcs() {
  return (
    <svg
      className="hero-kinetic-arcs pointer-events-none absolute left-1/2 top-1/2 h-[min(92vw,520px)] w-[min(92vw,520px)] -translate-x-1/2 -translate-y-[58%] text-white/25"
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden
    >
      <path
        className="hero-kinetic-arc hero-kinetic-arc-a"
        d="M 40 220 Q 120 80 200 120 T 360 180"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        className="hero-kinetic-arc hero-kinetic-arc-b"
        d="M 60 260 Q 160 140 240 200 T 340 240"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        className="hero-kinetic-arc hero-kinetic-arc-c"
        d="M 80 300 Q 200 180 320 280"
        stroke="url(#heroArcGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="heroArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function HeroKineticType() {
  return (
    <div className="hero-kinetic relative mx-auto w-full max-w-3xl text-center">
      <ConductorArcs />

      <p className="hero-kinetic-zh relative text-[clamp(3.5rem,14vw,7.5rem)] font-bold leading-[0.92] tracking-tight text-white">
        <span className="hero-kinetic-zh-main inline-block">无碍</span>
      </p>

      <KineticCaps />
      <RhythmLine />

      <p className="relative mx-auto mt-4 max-w-[16rem] text-sm leading-snug text-white/75 md:max-w-xs md:text-[15px]">
        拍无障碍现场
        <br className="md:hidden" />
        <span className="hidden md:inline"> · </span>
        AI 写成可复查证据
      </p>

      <div className="relative mt-7 md:mt-8">
        <AnchorLink
          href="#tool"
          className="group inline-flex items-center gap-2 border-b border-white/40 pb-1 text-sm font-medium tracking-wide text-white transition hover:border-white"
        >
          <span className="hero-kinetic-cta-arrow inline-block">↓</span>
          拍照记录
        </AnchorLink>
      </div>
    </div>
  );
}
