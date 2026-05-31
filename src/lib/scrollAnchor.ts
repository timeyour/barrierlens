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

/** 生成结果后滚动：内容较短时居中，较长时留出顶栏间距 */
export function scrollResultsIntoView(
  hashOrId: string,
  behavior: ScrollBehavior = "smooth",
): boolean {
  if (typeof window === "undefined") return false;

  const id = resolveAnchorId(hashOrId);
  const el = document.getElementById(id);
  if (!el) return false;

  const rect = el.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  const viewportRoom = window.innerHeight - NAV_SCROLL_OFFSET - 32;

  let top: number;
  if (rect.height <= viewportRoom) {
    top = absoluteTop - (window.innerHeight - rect.height) / 2;
  } else {
    top = absoluteTop - NAV_SCROLL_OFFSET - 16;
  }

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
