"use client";

import AnchorLink from "@/components/AnchorLink";
import AuthNavButton from "@/components/AuthNavButton";
import Link from "next/link";
import { navLayoutQuery, useNavLayout, type NavLayout } from "@/hooks/useNavLayout";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CLASSIC_LINKS = [
  { href: "/#story", label: "闭环" },
  { href: "/#scenes", label: "场景" },
  { href: "/#tool", label: "记录" },
  { href: "/#records", label: "时间线" },
  { href: "/reports", label: "公开上报", route: true },
] as const;

/** 混合版：与底部三栏对齐，不重复 Hero 下方已有区块 */
const MIXED_LINKS = [
  { href: "/#tool", label: "记录" },
  { href: "/reports", label: "公开", route: true },
  { href: "/#records", label: "我的" },
] as const;

const FIXMYSTREET_LINKS = [
  { href: "/reports", label: "最近上报", route: true },
  { href: "/#records", label: "我的记录", route: false },
  { href: "/#how", label: "怎么运作", route: false },
] as const;

interface SiteNavProps {
  initialLayout?: NavLayout;
}

function withNavQuery(href: string, layout: NavLayout, isRoute: boolean): string {
  if (layout === "classic" || !isRoute) return href;
  const q = navLayoutQuery(layout);
  return href.includes("?") ? `${href}&nav=${layout}` : `${href}${q}`;
}

export default function SiteNav({ initialLayout }: SiteNavProps) {
  const layout = useNavLayout(initialLayout);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const onSubPage = pathname !== "/";
  const isFix = layout === "fixmystreet";
  const isMixed = layout === "mixed";

  useEffect(() => {
    const onScroll = () => setScrolled(onSubPage || window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onSubPage]);

  const navScrolled = onSubPage || scrolled || isFix;
  const links = isFix ? FIXMYSTREET_LINKS : isMixed ? MIXED_LINKS : CLASSIC_LINKS;
  const ctaLabel = isFix ? "报告" : "拍照";
  const homeHref =
    isFix ? "/?nav=fixmystreet" : isMixed ? "/" : "/?nav=classic";
  const closeMenu = () => setMenuOpen(false);

  const linkClass = (active = false) =>
    `text-xs font-medium transition-colors ${
      active
        ? navScrolled
          ? "text-blue-700"
          : "text-sky-200"
        : navScrolled
          ? "text-slate-600 hover:text-slate-900"
          : "text-white/85 hover:text-white"
    }`;

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 px-4 py-3 transition-[background,box-shadow,border-color] duration-300 sm:px-6 ${
        navScrolled
          ? "border-b border-slate-200/80 bg-white/92 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] backdrop-blur-xl"
          : "border-b border-white/10 bg-slate-950/20"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link
          href={homeHref}
          className={`text-sm font-semibold transition-colors ${navScrolled ? "text-slate-900" : "text-white"}`}
        >
          无碍{" "}
          <span className={navScrolled ? "text-blue-600" : "text-blue-300"}>BarrierLens</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {links.map((link) => {
            const isRoute = "route" in link && link.route;
            const href = withNavQuery(link.href, layout, isRoute);
            const active =
              isRoute && pathname.startsWith(link.href.replace(/\?.*$/, ""));

            if (isRoute) {
              return (
                <Link key={link.href} href={href} className={linkClass(active)}>
                  {link.label}
                </Link>
              );
            }

            return (
              <AnchorLink key={link.href} href={link.href} className={linkClass()}>
                {link.label}
              </AnchorLink>
            );
          })}
          {isFix && (
            <Link href="/?nav=classic" className={linkClass()} title="撤回预览布局">
              经典版
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <AuthNavButton navScrolled={navScrolled} />
          {(isFix || isMixed) && (
            <button
              type="button"
              className={`rounded-lg px-2 py-1 text-xs font-medium md:hidden ${
                navScrolled ? "text-slate-600" : "text-white/90"
              }`}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              菜单
            </button>
          )}
          <AnchorLink
            href="/#tool"
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${
              navScrolled ? "btn-primary" : "bg-white/92 text-slate-900 shadow-sm hover:bg-white"
            }`}
          >
            {ctaLabel}
          </AnchorLink>
        </div>
      </div>

      {(isFix || isMixed) && menuOpen && (
        <nav
          id="mobile-nav-menu"
          className="mx-auto mt-2 max-w-6xl rounded-xl border border-slate-200 bg-white p-3 shadow-lg md:hidden"
        >
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                {"route" in link && link.route ? (
                  <Link
                    href={withNavQuery(link.href, layout, true)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <AnchorLink
                    href={link.href}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </AnchorLink>
                )}
              </li>
            ))}
            <li>
              <Link
                href="/?nav=classic"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
                onClick={closeMenu}
              >
                返回经典版
              </Link>
            </li>
            {isFix && (
              <li>
                <Link
                  href="/"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
                  onClick={closeMenu}
                >
                  混合首页
                </Link>
              </li>
            )}
            {isMixed && (
              <li>
                <Link
                  href="/?nav=fixmystreet"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
                  onClick={closeMenu}
                >
                  FixMyStreet 预览
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/login"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
                onClick={closeMenu}
              >
                团队登录
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
