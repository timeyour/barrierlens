import type { NavLayout } from "@/config/navLayout";
import { navLayoutQuery } from "@/config/navLayout";

export type MobileTabMatch =
  | "story"
  | "tool"
  | "reports"
  | "tech"
  | "records"
  | "how";

export type MobileTabItem = {
  href: string;
  label: string;
  anchor: boolean;
  match: MobileTabMatch;
  /** 主操作 Tab（记录）略强调 */
  primary?: boolean;
  ariaLabel?: string;
};

const MIXED_TABS: MobileTabItem[] = [
  { href: "/#story", label: "流程", anchor: true, match: "story" },
  {
    href: "/#tool",
    label: "记录",
    anchor: true,
    match: "tool",
    primary: true,
    ariaLabel: "拍照记录",
  },
  { href: "/reports", label: "公开", anchor: false, match: "reports" },
  { href: "/tech", label: "技术", anchor: false, match: "tech", ariaLabel: "技术路线" },
  { href: "/#records", label: "我的", anchor: true, match: "records" },
];

const FIX_TABS: MobileTabItem[] = [
  {
    href: "/reports",
    label: "公开",
    anchor: false,
    match: "reports",
    ariaLabel: "最近上报",
  },
  { href: "/tech", label: "技术", anchor: false, match: "tech", ariaLabel: "技术路线" },
  { href: "/#records", label: "我的", anchor: false, match: "records" },
  { href: "/#how", label: "运作", anchor: false, match: "how", ariaLabel: "怎么运作" },
];

export function resolveMobileTabs(layout: NavLayout): MobileTabItem[] | null {
  if (layout === "classic") return null;
  if (layout === "fixmystreet") return FIX_TABS;
  return MIXED_TABS;
}

export function resolveMobileTabHref(item: MobileTabItem, layout: NavLayout): string {
  if (item.anchor || layout === "classic") return item.href;
  const suffix = layout === "fixmystreet" ? navLayoutQuery("fixmystreet") : "";
  return `${item.href}${suffix}`;
}
