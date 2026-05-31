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
      <div className="mx-auto max-w-6xl px-0">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_272px] lg:items-start lg:gap-5">
          <MixedWorkbenchToolCard compact={isCompact} />

          <WorkflowFocusGate>
            <div className="hidden min-w-0 lg:block lg:sticky lg:top-24">
              <HomeRecentReportsPanel variant="sidebar" limit={4} />
            </div>
          </WorkflowFocusGate>
        </div>

        <WorkflowFocusGate>
          <div className="mt-4 lg:hidden">
            <HomeRecentReportsPanel variant="inline" limit={3} />
          </div>
        </WorkflowFocusGate>
      </div>
    </section>
  );
}
