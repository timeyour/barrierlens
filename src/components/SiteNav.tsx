"use client";

import AnchorLink from "@/components/AnchorLink";
import AuthSyncButton from "@/components/AuthSyncButton";
import Link from "next/link";
import {
  navAuthDividerClasses,
  navBrandClasses,
  navLinkTierClasses,
  navMobileMenuClasses,
  resolveNavSurface,
} from "@/config/navSurface";
import { readNavSurfaceZone } from "@/lib/navSurfaceZone";
import { resolveMobileTabs } from "@/config/mobileNav";
import { navLayoutQuery, useNavLayout, type NavLayout } from "@/hooks/useNavLayout";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** 三区顶栏：左品牌 · 中 Hero 缓冲 · 右导航（宽度不超过视口，避免登录被裁切） */
const NAV_SHELL =
  "relative z-10 mx-auto grid w-full max-w-full grid-cols-[minmax(0,auto)_minmax(0,1fr)_minmax(0,auto)] items-center gap-x-2 px-4 sm:gap-x-3 sm:px-5 md:px-6 lg:gap-x-4 lg:px-8 xl:px-10 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] box-border";

type NavLinkDef = {
  href: string;
  label: string;
  route?: boolean;
  ariaLabel?: string;
  tier?: "primary" | "secondary";
};

const CLASSIC_LINKS: NavLinkDef[] = [
  { href: "/#story", label: "闭环", tier: "secondary" },
  { href: "/#scenes", label: "场景", tier: "secondary" },
  { href: "/#tool", label: "记录", tier: "primary" },
  { href: "/#records", label: "时间线", tier: "secondary" },
  { href: "/reports", label: "公开", route: true, ariaLabel: "公开上报", tier: "secondary" },
  { href: "/tech", label: "技术", route: true, ariaLabel: "技术路线说明", tier: "secondary" },
];

/** 混合版：Hero + 流程 + #tool 工作台 */
const MIXED_LINKS: NavLinkDef[] = [
  { href: "/#story", label: "流程", tier: "primary" },
  { href: "/#tool", label: "记录", tier: "primary" },
  { href: "/reports", label: "公开", route: true, tier: "secondary" },
  { href: "/tech", label: "技术", route: true, ariaLabel: "技术路线说明", tier: "secondary" },
  { href: "/#records", label: "我的", tier: "secondary" },
];

const FIXMYSTREET_LINKS: NavLinkDef[] = [
  { href: "/reports", label: "公开", route: true, ariaLabel: "最近上报", tier: "primary" },
  { href: "/tech", label: "技术", route: true, ariaLabel: "技术路线说明", tier: "secondary" },
  { href: "/#records", label: "我的", route: false, tier: "secondary" },
  { href: "/#how", label: "运作", route: false, ariaLabel: "怎么运作", tier: "secondary" },
];

function linkAriaLabel(link: NavLinkDef): string | undefined {
  return link.ariaLabel;
}

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
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("hashchange", sync);
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
  const mobileTabs = resolveMobileTabs(layout);
  const showMobileMenu = mobileTabs === null;
  /** 首页第一屏 Hero 已有大标题；滚到第二/三/四屏再显示顶栏 logo */
  const hideHomeBrand = !onSubPage && (navZone === "hero" || navZone === null);
  const homeHref =
    isFix ? "/?nav=fixmystreet" : isMixed ? "/" : "/?nav=classic";
  const closeMenu = () => setMenuOpen(false);
  const authDivider = navAuthDividerClasses(surface.tone);

  const linkClass = (tier: "primary" | "secondary" = "secondary", active = false) =>
    [
      "rounded-md px-0.5 py-1 text-[13px] font-medium tracking-wide transition-colors md:text-sm xl:text-[15px]",
      tier === "primary" ? "font-semibold" : "",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400/70",
      navLinkTierClasses(surface.tone, tier, active),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <header
      className={`mobile-header-safe fixed left-0 right-0 top-0 z-50 box-border max-w-[100vw] py-3 md:py-4 ${surface.header}`}
    >
      {surface.tone === "onDark" ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/85 via-slate-950/45 to-transparent"
          aria-hidden
        />
      ) : null}
      <div
        className={
          hideHomeBrand
            ? "relative z-10 flex w-full max-w-full items-center justify-end gap-1.5 px-4 sm:gap-3 sm:px-5 md:gap-2 md:px-6 lg:gap-3 lg:px-8 xl:px-10 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] box-border"
            : NAV_SHELL
        }
      >
        {!hideHomeBrand ? (
          <Link
            href={homeHref}
            className={`group flex shrink-0 flex-col gap-0.5 transition-colors sm:flex-row sm:items-baseline sm:gap-2 ${brand.title}`}
          >
            <span className="text-[17px] font-bold leading-none tracking-tight md:text-lg">
              无碍
            </span>
            <span
              className={`hidden font-mono text-[11px] font-semibold uppercase tracking-[0.14em] sm:inline sm:text-xs ${brand.accent}`}
            >
              BarrierLens
            </span>
          </Link>
        ) : null}

        {!hideHomeBrand ? (
          <div
            className="hidden min-w-[2rem] md:block md:min-w-[4rem] lg:min-w-[8rem] xl:min-w-[11rem]"
            aria-hidden
          />
        ) : null}

        <div className="flex min-w-0 shrink items-center justify-end gap-1.5 md:gap-2 lg:gap-3">
          <nav
            className="hidden min-w-0 items-center md:flex md:gap-3.5 lg:gap-5 xl:gap-6"
            aria-label="站点导航"
          >
            {links.map((link) => {
              const isRoute = Boolean(link.route);
              const href = withNavQuery(link.href, layout, isRoute);
              const active =
                isRoute && pathname.startsWith(link.href.replace(/\?.*$/, ""));
              const tier = link.tier ?? "secondary";
              const className = linkClass(tier, active);

              if (isRoute) {
                return (
                  <Link
                    key={link.href}
                    href={href}
                    className={className}
                    aria-current={active ? "page" : undefined}
                    aria-label={linkAriaLabel(link)}
                  >
                    {link.label}
                  </Link>
                );
              }

              return (
                <AnchorLink
                  key={link.href}
                  href={link.href}
                  className={className}
                  aria-label={linkAriaLabel(link)}
                >
                  {link.label}
                </AnchorLink>
              );
            })}
          </nav>

          <div
            className={`hidden h-5 w-px shrink-0 md:block ${authDivider}`}
            aria-hidden
          />

          <AuthSyncButton tone={surface.tone} />
          {showMobileMenu ? (
            <button
              type="button"
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl px-3 text-sm font-semibold md:hidden ${
                surface.tone === "onLight"
                  ? "border border-slate-200 bg-white/80 text-slate-700"
                  : "border border-white/25 bg-white/10 text-white"
              }`}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
              aria-label="打开导航菜单"
              onClick={() => setMenuOpen((open) => !open)}
            >
              菜单
            </button>
          ) : null}
        </div>
      </div>

      {showMobileMenu && menuOpen && (
        <nav
          id="mobile-nav-menu"
          className={`mx-auto mt-2 max-w-6xl rounded-xl border p-3 shadow-lg backdrop-blur-xl md:hidden ${navMobileMenuClasses(surface.variant)}`}
          aria-label="移动端导航"
        >
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                {link.route ? (
                  <Link
                    href={withNavQuery(link.href, layout, true)}
                    className="flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    aria-label={linkAriaLabel(link)}
                    aria-current={
                      pathname.startsWith(link.href.replace(/\?.*$/, ""))
                        ? "page"
                        : undefined
                    }
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <AnchorLink
                    href={link.href}
                    className="flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    aria-label={linkAriaLabel(link)}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </AnchorLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
