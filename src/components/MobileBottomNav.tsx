"use client";

import AnchorLink from "@/components/AnchorLink";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLayoutQuery, type NavLayout } from "@/hooks/useNavLayout";

const ITEMS = [
  { href: "/#tool", label: "记录", anchor: true, match: "report" },
  { href: "/reports", label: "公开", anchor: false, match: "reports" },
  { href: "/#records", label: "我的", anchor: true, match: "records" },
] as const;

interface MobileBottomNavProps {
  layout: NavLayout;
}

export default function MobileBottomNav({ layout }: MobileBottomNavProps) {
  const pathname = usePathname();

  if (layout === "classic") return null;

  const suffix =
    layout === "fixmystreet" ? navLayoutQuery("fixmystreet") : "";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="快捷导航"
    >
      <ul className="mx-auto flex max-w-lg">
        {ITEMS.map((item) => {
          const href = item.anchor ? item.href : `${item.href}${suffix}`;
          const active =
            (item.match === "reports" && pathname.startsWith("/reports")) ||
            (item.match === "report" && pathname === "/");

          const className = `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold ${
            active ? "text-blue-700" : "text-slate-600"
          }`;

          return (
            <li key={item.label} className="flex-1">
              {item.anchor ? (
                <AnchorLink href={href} className={className}>
                  {item.label}
                </AnchorLink>
              ) : (
                <Link href={href} className={className}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
