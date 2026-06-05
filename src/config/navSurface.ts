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
  "backdrop-blur-xl transition-[background,box-shadow,border-color] duration-300";

const SURFACES: Record<NavSurfaceVariant, NavSurfaceStyle> = {
  hero: {
    variant: "hero",
    tone: "onDark",
    header: `${GLASS_BASE} border-b border-white/12 bg-slate-950/28 shadow-none`,
  },
  mixed: {
    variant: "mixed",
    tone: "onLight",
    header: `${GLASS_BASE} border-b border-slate-200/55 bg-slate-50/72 shadow-[0_8px_28px_-14px_rgba(15,23,42,0.1)]`,
  },
  paper: {
    variant: "paper",
    tone: "onLight",
    header: `${GLASS_BASE} border-b border-slate-200/60 bg-[#f8fafc]/78 shadow-[0_8px_28px_-14px_rgba(15,23,42,0.08)]`,
  },
  fix: {
    variant: "fix",
    tone: "onLight",
    header: `${GLASS_BASE} border-b border-slate-200/65 bg-white/76 shadow-[0_8px_28px_-14px_rgba(15,23,42,0.09)]`,
  },
};

export function resolveNavSurface(input: {
  pathname: string;
  layout: NavLayout;
  /** 首页 Hero 视频区顶部（未滚动） */
  overHero: boolean;
}): NavSurfaceStyle {
  const { pathname, layout, overHero } = input;

  if (pathname !== "/") {
    return SURFACES.paper;
  }

  if (layout === "fixmystreet") {
    return SURFACES.fix;
  }

  if (overHero) {
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
