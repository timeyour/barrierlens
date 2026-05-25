/** 固定顶栏高度 + 间距，与 globals.css scroll-padding-top 一致 */
export const NAV_SCROLL_OFFSET = 80;

const ALIASES: Record<string, string> = {
  timeline: "records",
};

export function resolveAnchorId(hashOrId: string): string {
  const id = hashOrId.replace(/^#/, "");
  return ALIASES[id] ?? id;
}

export function scrollToAnchor(
  hashOrId: string,
  behavior: ScrollBehavior = "smooth",
): boolean {
  if (typeof window === "undefined") return false;

  const id = resolveAnchorId(hashOrId);
  const el = document.getElementById(id);
  if (!el) return false;

  const top =
    el.getBoundingClientRect().top + window.scrollY - NAV_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

export function bindHashScrollOnLoad(): () => void {
  const run = () => {
    const hash = window.location.hash;
    if (hash) {
      window.requestAnimationFrame(() => scrollToAnchor(hash, "auto"));
    }
  };
  run();
  window.addEventListener("hashchange", run);
  return () => window.removeEventListener("hashchange", run);
}
