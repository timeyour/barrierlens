"use client";

import AnchorLink from "@/components/AnchorLink";
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

function TabLink({
  item,
  href,
  active,
}: {
  item: MobileTabItem;
  href: string;
  active: boolean;
}) {
  const className = [
    "relative flex min-h-[3rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-xs font-semibold tracking-wide transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-500",
    active
      ? "text-blue-700"
      : item.primary
        ? "text-slate-700"
        : "text-slate-600",
    item.primary && !active ? "font-bold" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {active ? (
        <span
          className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-blue-600"
          aria-hidden
        />
      ) : null}
      <span>{item.label}</span>
    </>
  );

  if (item.anchor) {
    return (
      <AnchorLink href={href} className={className} aria-label={item.ariaLabel ?? item.label}>
        {content}
      </AnchorLink>
    );
  }

  return (
    <Link href={href} className={className} aria-label={item.ariaLabel ?? item.label}>
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
      className="mobile-tab-bar fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 bg-white/96 backdrop-blur-md md:hidden"
      aria-label="手机快捷导航"
    >
      <ul className="mx-auto flex max-w-lg">
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
    </nav>
  );
}
