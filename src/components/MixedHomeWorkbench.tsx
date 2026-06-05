import HomeRecentReportsPanel from "@/components/HomeRecentReportsPanel";
import MixedWorkbenchToolCard from "@/components/MixedWorkbenchToolCard";
import WorkflowFocusGate from "@/components/WorkflowFocusGate";
import type { WorkbenchLayout } from "@/config/workbenchLayout";

interface MixedHomeWorkbenchProps {
  layout?: WorkbenchLayout;
}

export default function MixedHomeWorkbench({
  layout = "default",
}: MixedHomeWorkbenchProps) {
  const isCompact = layout === "compact";

  return (
    <section
      aria-label="记录工作台"
      className="mobile-no-snap relative z-30 isolate scroll-mt-4"
    >
      <div className="mb-4 lg:hidden">
        <HomeRecentReportsPanel variant="strip" limit={4} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start lg:gap-5">
        <MixedWorkbenchToolCard compact={isCompact} />

        <WorkflowFocusGate>
          <div className="hidden min-w-0 lg:block lg:sticky lg:top-24">
            <HomeRecentReportsPanel variant="sidebar" limit={4} />
          </div>
        </WorkflowFocusGate>
      </div>
    </section>
  );
}
