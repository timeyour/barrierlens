"use client";

import Link from "next/link";
import { useNavLayout, type NavLayout } from "@/hooks/useNavLayout";
import type { WorkbenchLayout } from "@/config/workbenchLayout";

interface NavLayoutPreviewBannerProps {
  initialLayout?: NavLayout;
  initialWorkbenchLayout?: WorkbenchLayout;
}

export default function NavLayoutPreviewBanner({
  initialLayout,
}: NavLayoutPreviewBannerProps) {
  const layout = useNavLayout(initialLayout);

  if (layout === "classic") return null;

  return (
    <div className="fixed bottom-16 left-3 right-3 z-40 md:bottom-4 md:left-auto md:right-4">
      <div className="rounded-lg border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[10px] text-slate-600 shadow-sm backdrop-blur-sm">
        预览布局 ·{" "}
        <Link href="/?nav=classic" className="font-medium text-blue-700 underline">
          经典
        </Link>
      </div>
    </div>
  );
}
