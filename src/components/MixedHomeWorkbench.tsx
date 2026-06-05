"use client";

import HomeRecentReportsPanel from "@/components/HomeRecentReportsPanel";
import MixedWorkbenchToolCard from "@/components/MixedWorkbenchToolCard";
import type { WorkbenchLayout } from "@/config/workbenchLayout";
import {
  WORKFLOW_PHASE_EVENT,
  type WorkflowPhase,
} from "@/lib/workflowPhase";
import { useEffect, useState } from "react";

/** 进入步骤 2 / 加载 / 结果时收起右侧栏，让表单占满宽；idle 与步骤 1 保留公开案例 */
const SIDEBAR_HIDE_PHASES: WorkflowPhase[] = ["step2", "loading", "success"];

interface MixedHomeWorkbenchProps {
  layout?: WorkbenchLayout;
}

export default function MixedHomeWorkbench({
  layout = "default",
}: MixedHomeWorkbenchProps) {
  const isCompact = layout === "compact";
  const [sidebarHidden, setSidebarHidden] = useState(false);

  useEffect(() => {
    const onPhase = (event: Event) => {
      const detail = (event as CustomEvent<WorkflowPhase>).detail;
      if (detail) setSidebarHidden(SIDEBAR_HIDE_PHASES.includes(detail));
    };
    window.addEventListener(WORKFLOW_PHASE_EVENT, onPhase);
    return () => window.removeEventListener(WORKFLOW_PHASE_EVENT, onPhase);
  }, []);

  const showDesktopSidebar = !sidebarHidden;

  return (
    <section
      aria-label="记录工作台"
      className="mobile-no-snap relative z-30 isolate w-full scroll-mt-4"
    >
      <div className="mb-4 lg:hidden">
        <HomeRecentReportsPanel variant="strip" limit={4} />
      </div>

      <div
        className={`grid gap-4 lg:items-start lg:gap-5 ${
          showDesktopSidebar
            ? "lg:grid-cols-[minmax(0,1fr)_272px]"
            : "lg:grid-cols-1"
        }`}
      >
        <MixedWorkbenchToolCard compact={isCompact} />

        {showDesktopSidebar && (
          <div className="hidden min-w-0 lg:block lg:sticky lg:top-24">
            <HomeRecentReportsPanel variant="sidebar" limit={4} />
          </div>
        )}
      </div>
    </section>
  );
}
