"use client";

import AnchorLink from "@/components/AnchorLink";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/#story", label: "闭环" },
  { href: "/#scenes", label: "场景" },
  { href: "/#tool", label: "记录" },
  { href: "/#records", label: "时间线" },
  { href: "/reports", label: "公开上报", route: true },
];

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const onSubPage = pathname !== "/";

  useEffect(() => {
    const onScroll = () => setScrolled(onSubPage || window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onSubPage]);

  const navScrolled = onSubPage || scrolled;

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 px-4 py-3 transition-[background,box-shadow,border-color] duration-300 sm:px-6 ${
        navScrolled
          ? "border-b border-slate-200/80 bg-white/92 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] backdrop-blur-xl [box-shadow:inset_0_1px_0_rgba(255,255,255,0.95)]"
          : "border-b border-white/10 bg-slate-950/20"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link
          href="/"
          className={`text-sm font-semibold transition-colors ${navScrolled ? "text-slate-900" : "text-white"}`}
        >
          无碍 <span className={navScrolled ? "text-blue-600" : "text-blue-300"}>BarrierLens</span>
        </Link>
        <nav className="hidden items-center gap-5 sm:flex">
          {LINKS.map((link) =>
            link.route ? (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-medium transition-colors ${
                  navScrolled
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-white/85 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <AnchorLink
                key={link.href}
                href={link.href}
                className={`text-xs font-medium transition-colors ${
                  navScrolled
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-white/85 hover:text-white"
                }`}
              >
                {link.label}
              </AnchorLink>
            ),
          )}
        </nav>
        <AnchorLink
          href="/#tool"
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${
            navScrolled
              ? "btn-primary"
              : "bg-white/92 text-slate-900 shadow-sm hover:bg-white"
          }`}
        >
          开始记录
        </AnchorLink>
      </div>
    </header>
  );
}
