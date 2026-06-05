"use client";

import HomeRecentReportsPanel from "@/components/HomeRecentReportsPanel";
import MixedWorkbenchToolCard from "@/components/MixedWorkbenchToolCard";
import type { WorkbenchLayout } from "@/config/workbenchLayout";

interface MixedHomeWorkbenchProps {
  layout?: WorkbenchLayout;
}

/** 工作台主卡片始终占满内容轨；近期案例仅移动端条带展示，避免挤窄表单 */
export default function MixedHomeWorkbench({
  layout = "default",
}: MixedHomeWorkbenchProps) {
  const isCompact = layout === "compact";

  return (
    <section
      aria-label="记录工作台"
      className="mobile-no-snap relative z-30 isolate w-full scroll-mt-4"
    >
      <div className="mb-4 lg:hidden">
        <HomeRecentReportsPanel variant="strip" limit={4} />
      </div>

      <MixedWorkbenchToolCard compact={isCompact} />
    </section>
  );
}
