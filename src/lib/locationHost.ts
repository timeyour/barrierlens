/** 生产主域名（与 Vercel Production 别名一致） */
export const LOCATION_PRODUCTION_HOST = "barrierlens.vercel.app";

export function isVercelPreviewHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  return host.endsWith(".vercel.app") && host !== LOCATION_PRODUCTION_HOST;
}

export function locationPreviewHostHint(hostname?: string): string | null {
  const host =
    hostname?.trim().toLowerCase() ??
    (typeof window !== "undefined" ? window.location.hostname : "");
  if (!host || !isVercelPreviewHostname(host)) return null;
  return `当前是 Vercel 预览域名（${host}），高德 JSONP 需在白名单加入该域名或改用 https://${LOCATION_PRODUCTION_HOST}`;
}
