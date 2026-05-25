"use client";

import { bindHashScrollOnLoad } from "@/lib/scrollAnchor";
import { ensureGsapPlugins, ScrollTrigger } from "@/lib/gsapClient";
import { useEffect } from "react";

ensureGsapPlugins();

/** 修正带 hash 进入页面时锚点被顶栏遮挡 */
export default function HashScrollHandler() {
  useEffect(() => {
    const cleanup = bindHashScrollOnLoad();
    const refresh = () => {
      window.requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    window.addEventListener("load", refresh);
    return () => {
      cleanup();
      window.removeEventListener("load", refresh);
    };
  }, []);
  return null;
}
