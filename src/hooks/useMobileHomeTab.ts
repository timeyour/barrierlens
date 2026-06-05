"use client";

import type { MobileTabMatch } from "@/config/mobileNav";
import { useSyncExternalStore } from "react";

const PROBE_Y = 88;

function readHashTab(): MobileTabMatch | null {
  const hash = window.location.hash.toLowerCase();
  if (hash === "#tool" || hash === "#tool-results") return "tool";
  if (hash === "#records") return "records";
  if (hash === "#story") return "story";
  if (hash === "#how") return "how";
  return null;
}

function readScrollTab(): MobileTabMatch | null {
  const sections: { id: string; match: MobileTabMatch }[] = [
    { id: "records", match: "records" },
    { id: "tool", match: "tool" },
    { id: "story", match: "story" },
  ];

  for (const { id, match } of sections) {
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.top <= PROBE_Y && rect.bottom >= PROBE_Y) return match;
  }

  const hero = document.querySelector('[data-nav-surface="hero"]');
  if (hero) {
    const rect = hero.getBoundingClientRect();
    if (rect.top <= PROBE_Y && rect.bottom >= PROBE_Y) return null;
  }

  return null;
}

function getActiveHomeTab(): MobileTabMatch | null {
  return readHashTab() ?? readScrollTab();
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("scroll", onStoreChange, { passive: true });
  window.addEventListener("hashchange", onStoreChange);
  window.addEventListener("resize", onStoreChange);
  return () => {
    window.removeEventListener("scroll", onStoreChange);
    window.removeEventListener("hashchange", onStoreChange);
    window.removeEventListener("resize", onStoreChange);
  };
}

/** 首页滚动 / hash 同步底部 Tab 高亮 */
export function useMobileHomeTab(): MobileTabMatch | null {
  return useSyncExternalStore(subscribe, getActiveHomeTab, () => null);
}
