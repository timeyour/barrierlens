import type { NavLayout } from "@/config/navLayout";

/** 导航文字对比度：压在深色 Hero 上 / 压在浅色内容区上 */
export type NavSurfaceTone = "onDark" | "onLight";

export type NavSurfaceVariant = "hero" | "mixed" | "paper" | "fix";

export type NavSurfaceStyle = {
  variant: NavSurfaceVariant;
  tone: NavSurfaceTone;
  header: string;
};

const GLASS_BASE =
  "backdrop-blur-md transition-[background,box-shadow,border-color] duration-300";

const SURFACES: Record<NavSurfaceVariant, NavSurfaceStyle> = {
  hero: {
    variant: "hero",
    tone: "onDark",
    header: `${GLASS_BASE} border-0 bg-transparent shadow-none`,
  },
  mixed: {
    variant: "mixed",
    tone: "onLight",
    header: `${GLASS_BASE} border-0 bg-white/30 shadow-none`,
  },
  paper: {
    variant: "paper",
    tone: "onLight",
    header: `${GLASS_BASE} border-0 bg-[#f8fafc]/40 shadow-none`,
  },
  fix: {
    variant: "fix",
    tone: "onLight",
    header: `${GLASS_BASE} border-0 bg-white/45 shadow-none`,
  },
};

export function resolveNavSurface(input: {
  pathname: string;
  layout: NavLayout;
  /** 当前顶栏下方的页面分区（由 data-nav-surface 标记） */
  zone?: "hero" | "dark" | "light" | null;
}): NavSurfaceStyle {
  const { pathname, layout, zone } = input;

  if (pathname !== "/") {
    return SURFACES.paper;
  }

  if (layout === "fixmystreet") {
    return SURFACES.fix;
  }

  if (zone === "hero" || zone === "dark") {
    return SURFACES.hero;
  }

  if (layout === "mixed") {
    return SURFACES.mixed;
  }

  return SURFACES.paper;
}

export function navLinkClasses(tone: NavSurfaceTone, active = false): string {
  if (tone === "onDark") {
    return active
      ? "text-sky-200"
      : "text-white/85 hover:text-white";
  }
  return active
    ? "text-blue-700"
    : "text-slate-600 hover:text-slate-900";
}

export function navBrandClasses(tone: NavSurfaceTone): {
  title: string;
  accent: string;
} {
  if (tone === "onDark") {
    return { title: "text-white", accent: "text-blue-300" };
  }
  return { title: "text-slate-900", accent: "text-blue-600" };
}

export function navMobileMenuClasses(variant: NavSurfaceVariant): string {
  if (variant === "hero") {
    return "border-slate-200/80 bg-white/94";
  }
  if (variant === "mixed") {
    return "border-slate-200/70 bg-slate-50/92";
  }
  if (variant === "fix") {
    return "border-slate-200/75 bg-white/92";
  }
  return "border-slate-200/80 bg-[#f8fafc]/94";
}
