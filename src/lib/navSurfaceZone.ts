"use client";

import type { NavSurfaceVariant } from "@/config/navSurface";

type NavSurfaceZone = "hero" | "dark" | "light";

function zoneToVariant(
  zone: NavSurfaceZone,
  layout: "classic" | "mixed" | "fixmystreet",
): NavSurfaceVariant {
  if (zone === "hero" || zone === "dark") return "hero";
  if (layout === "mixed") return "mixed";
  if (layout === "fixmystreet") return "fix";
  return "paper";
}

/** 顶栏下沿采样线（与 fixed header 高度对齐） */
const NAV_ZONE_LINE = 56;

/** 读取顶栏下方当前分区，配合 [data-nav-surface] 实现随页面变色 */
export function readNavSurfaceZone(): NavSurfaceZone | null {
  if (typeof document === "undefined") return null;

  const navLine = NAV_ZONE_LINE;
  const markers = document.querySelectorAll<HTMLElement>("[data-nav-surface]");
  if (markers.length === 0) return null;

  for (const el of markers) {
    const rect = el.getBoundingClientRect();
    if (rect.top <= navLine && rect.bottom >= navLine) {
      const raw = el.dataset.navSurface;
      if (raw === "hero" || raw === "dark" || raw === "light") return raw;
    }
  }

  const hero = document.querySelector('[data-nav-surface="hero"]');
  if (hero && hero.getBoundingClientRect().bottom < navLine) {
    for (const el of markers) {
      if (el.dataset.navSurface !== "dark") continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= navLine && rect.bottom >= navLine) return "dark";
    }
    return "light";
  }

  return "hero";
}

export function resolveHomeNavVariant(
  layout: "classic" | "mixed" | "fixmystreet",
): NavSurfaceVariant {
  const zone = readNavSurfaceZone();
  if (!zone) {
    return layout === "fixmystreet" ? "fix" : "hero";
  }
  return zoneToVariant(zone, layout);
}
