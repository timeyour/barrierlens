export type NavLayout = "classic" | "mixed" | "fixmystreet";

const FIXMYSTREET_LEGACY_ENV = /^(1|true|yes|on)$/i.test(
  process.env.NEXT_PUBLIC_FIXMYSTREET_NAV?.trim() ?? "",
);

function layoutFromParam(raw: string | undefined): NavLayout | null {
  if (!raw) return null;
  const value = raw.trim().toLowerCase();
  if (value === "fixmystreet" || value === "fix") return "fixmystreet";
  if (value === "classic" || value === "legacy") return "classic";
  if (value === "mixed") return "mixed";
  return null;
}

function parseHomeNavEnv(): NavLayout | null {
  const raw = process.env.NEXT_PUBLIC_HOME_NAV?.trim().toLowerCase();
  if (!raw) return null;
  return layoutFromParam(raw);
}

function defaultNavLayout(): NavLayout {
  const fromEnv = parseHomeNavEnv();
  if (fromEnv) return fromEnv;
  if (FIXMYSTREET_LEGACY_ENV) return "fixmystreet";
  return "mixed";
}

/** 服务端 / 客户端共用：URL ?nav= 优先于 env，默认 mixed */
export function resolveNavLayoutFromSearchParam(navRaw?: string): NavLayout {
  const fromUrl = layoutFromParam(navRaw);
  if (fromUrl) return fromUrl;
  return defaultNavLayout();
}

export function navLayoutQuery(layout: NavLayout): string {
  if (layout === "fixmystreet") return "?nav=fixmystreet";
  if (layout === "classic") return "?nav=classic";
  return "?nav=mixed";
}

/** @deprecated 使用 NEXT_PUBLIC_HOME_NAV=mixed|classic|fixmystreet */
export function isFixMyStreetNavEnabled(): boolean {
  return FIXMYSTREET_LEGACY_ENV;
}

export function isMixedHomeDefault(): boolean {
  return defaultNavLayout() === "mixed";
}
