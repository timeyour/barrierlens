import type { MobileTabMatch } from "@/config/mobileNav";

export function isMobileTabActive(
  match: MobileTabMatch,
  pathname: string,
  hash: string,
): boolean {
  const normalized = hash.toLowerCase();

  if (match === "reports") return pathname.startsWith("/reports");
  if (match === "tech") return pathname.startsWith("/tech");

  if (pathname !== "/") return false;

  if (match === "story") return normalized === "#story" || normalized === "";
  if (match === "tool") return normalized === "#tool" || normalized === "#tool-results";
  if (match === "records") return normalized === "#records";
  if (match === "how") return normalized === "#how";

  return false;
}
