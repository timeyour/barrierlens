"use client";

import AnchorLink from "@/components/AnchorLink";
import AuthSyncButton from "@/components/AuthSyncButton";
import Link from "next/link";
import {
  navBrandClasses,
  navLinkClasses,
  navMobileMenuClasses,
  resolveNavSurface,
} from "@/config/navSurface";
import { readNavSurfaceZone } from "@/lib/navSurfaceZone";
import { navLayoutQuery, useNavLayout, type NavLayout } from "@/hooks/useNavLayout";
import { HOME_CONTENT_RAIL } from "@/config/homeLayout";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CLASSIC_LINKS = [
  { href: "/#story", label: "闭环" },
  { href: "/#scenes", label: "场景" },
  { href: "/#tool", label: "记录" },
  { href: "/#records", label: "时间线" },
  { href: "/reports", label: "公开上报", route: true },
] as const;

/** 混合版：Hero + 流程 + #tool 工作台 */
const MIXED_LINKS = [
  { href: "/#story", label: "流程" },
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
  const [navZone, setNavZone] = useState<ReturnType<typeof readNavSurfaceZone>>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const onSubPage = pathname !== "/";
  const isFix = layout === "fixmystreet";
  const isMixed = layout === "mixed";

  useEffect(() => {
    if (onSubPage) return;

    const sync = () => setNavZone(readNavSurfaceZone());
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [onSubPage, pathname]);

  const surface = onSubPage
    ? resolveNavSurface({ pathname, layout, zone: "light" })
    : resolveNavSurface({
        pathname,
        layout,
        zone: navZone ?? (layout === "fixmystreet" ? "light" : "hero"),
      });
  const brand = navBrandClasses(surface.tone);
  const links = isFix ? FIXMYSTREET_LINKS : isMixed ? MIXED_LINKS : CLASSIC_LINKS;
  const homeHref =
    isFix ? "/?nav=fixmystreet" : isMixed ? "/" : "/?nav=classic";
  const closeMenu = () => setMenuOpen(false);

  const linkClass = (active = false) =>
    `text-xs font-medium transition-colors ${navLinkClasses(surface.tone, active)}`;

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 py-3 ${surface.header}`}
    >
      <div className={`flex items-center justify-between gap-3 ${HOME_CONTENT_RAIL}`}>
        <Link
          href={homeHref}
          className={`text-sm font-semibold transition-colors ${brand.title}`}
        >
          无碍 <span className={brand.accent}>BarrierLens</span>
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
          <AuthSyncButton tone={surface.tone} />
          {(isFix || isMixed) && (
            <button
              type="button"
              className={`rounded-lg px-2 py-1 text-xs font-medium md:hidden ${
                surface.tone === "onLight" ? "text-slate-600" : "text-white/90"
              }`}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              菜单
            </button>
          )}
        </div>
      </div>

      {(isFix || isMixed) && menuOpen && (
        <nav
          id="mobile-nav-menu"
          className={`mx-auto mt-2 max-w-6xl rounded-xl border p-3 shadow-lg backdrop-blur-xl md:hidden ${navMobileMenuClasses(surface.variant)}`}
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
                同步记录
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
