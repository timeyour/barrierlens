/** Production origin for auth redirects; falls back to current page in the browser. */
export function getSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function getAuthCallbackUrl(): string {
  const origin = getSiteOrigin();
  return origin ? `${origin}/auth/callback` : "/auth/callback";
}
