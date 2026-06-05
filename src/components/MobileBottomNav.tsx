"use client";

import AnchorLink from "@/components/AnchorLink";
import { MobileTabBarIcon } from "@/components/mobile/MobileTabBarIcons";
import {
  resolveMobileTabHref,
  resolveMobileTabs,
  type MobileTabItem,
} from "@/config/mobileNav";
import { useMobileHomeTab } from "@/hooks/useMobileHomeTab";
import { useNavLayout, type NavLayout } from "@/hooks/useNavLayout";
import { isMobileTabActive } from "@/lib/mobileTabActive";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileBottomNavProps {
  layout?: NavLayout;
}

function tabSurfaceClass(active: boolean, primary: boolean): string {
  if (active) {
    return "bg-blue-600 text-white shadow-sm shadow-blue-900/20";
  }
  if (primary) {
    return "bg-blue-50/90 text-blue-800 ring-1 ring-blue-200/80";
  }
  return "text-slate-500 hover:bg-slate-50/90 hover:text-slate-700";
}

function TabLink({
  item,
  href,
  active,
}: {
  item: MobileTabItem;
  href: string;
  active: boolean;
}) {
  const primary = Boolean(item.primary);
  const surface = tabSurfaceClass(active, primary && !active);

  const className = [
    "relative mx-0.5 flex min-h-[3.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition-colors duration-200",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
    surface,
  ].join(" ");

  const labelClass = [
    "max-w-full truncate text-[13px] leading-none tracking-wide",
    active || primary ? "font-semibold" : "font-medium",
  ].join(" ");

  const content = (
    <>
      <MobileTabBarIcon match={item.match} />
      <span className={labelClass}>{item.label}</span>
    </>
  );

  const aria = item.ariaLabel ?? item.label;

  if (item.anchor) {
    return (
      <AnchorLink
        href={href}
        className={className}
        aria-label={aria}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </AnchorLink>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      aria-label={aria}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </Link>
  );
}

export default function MobileBottomNav({ layout: layoutProp }: MobileBottomNavProps) {
  const pathname = usePathname();
  const homeTab = useMobileHomeTab();
  const layout = useNavLayout(layoutProp);
  const tabs = resolveMobileTabs(layout);

  if (!tabs) return null;

  function tabIsActive(item: MobileTabItem): boolean {
    if (pathname === "/") return homeTab === item.match;
    return isMobileTabActive(item.match, pathname, "");
  }

  return (
    <nav
      className="mobile-tab-bar fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 bg-[#f8fafc]/98 backdrop-blur-lg md:hidden"
      aria-label="手机快捷导航"
    >
      <div className="mx-auto w-full max-w-lg px-1.5 pt-1">
        <ul className="flex items-stretch">
          {tabs.map((item) => {
            const href = resolveMobileTabHref(item, layout);
            const active = tabIsActive(item);

            return (
              <li key={`${item.match}-${item.label}`} className="flex min-w-0 flex-1">
                <TabLink item={item} href={href} active={active} />
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
