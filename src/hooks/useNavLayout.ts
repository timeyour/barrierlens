"use client";

import {
  resolveNavLayoutFromSearchParam,
  type NavLayout,
} from "@/config/navLayout";
import { useState } from "react";

export type { NavLayout };

export { navLayoutQuery } from "@/config/navLayout";

function resolveClientLayout(initialLayout?: NavLayout): NavLayout {
  if (typeof window !== "undefined") {
    const fromUrl = new URLSearchParams(window.location.search).get("nav");
    if (fromUrl) return resolveNavLayoutFromSearchParam(fromUrl);
  }
  if (initialLayout) return initialLayout;
  return resolveNavLayoutFromSearchParam(undefined);
}

/** URL ?nav= 优先于 env；默认 mixed（?nav=classic 可退回） */
export function useNavLayout(initialLayout?: NavLayout): NavLayout {
  return useState(() => resolveClientLayout(initialLayout))[0];
}
