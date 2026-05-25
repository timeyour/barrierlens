"use client";

import { bindHashScrollOnLoad } from "@/lib/scrollAnchor";
import { useEffect } from "react";

/** 修正带 hash 进入页面时锚点被顶栏遮挡 */
export default function HashScrollHandler() {
  useEffect(() => bindHashScrollOnLoad(), []);
  return null;
}
