"use client";

import AnchorLink from "@/components/AnchorLink";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#story", label: "闭环" },
  { href: "#scenes", label: "场景" },
  { href: "#tool", label: "记录" },
  { href: "#records", label: "时间线" },
];

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 px-4 py-3 transition-colors duration-300 sm:px-6 ${
        scrolled
          ? "border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm"
          : "border-b border-white/10 bg-slate-950/20"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <span
          className={`text-sm font-semibold transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}
        >
          无碍 <span className={scrolled ? "text-blue-600" : "text-blue-300"}>BarrierLens</span>
        </span>
        <nav className="hidden items-center gap-5 sm:flex">
          {LINKS.map((link) => (
            <AnchorLink
              key={link.href}
              href={link.href}
              className={`text-xs font-medium transition-colors ${
                scrolled
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-white/85 hover:text-white"
              }`}
            >
              {link.label}
            </AnchorLink>
          ))}
        </nav>
        <AnchorLink
          href="#tool"
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            scrolled
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-white/90 text-slate-900 hover:bg-white"
          }`}
        >
          开始记录
        </AnchorLink>
      </div>
    </header>
  );
}
