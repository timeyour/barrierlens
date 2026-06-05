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
      <div className="flex flex-col gap-4">
        <MixedWorkbenchToolCard compact={isCompact} />

        <WorkflowFocusGate>
          <HomeRecentReportsPanel variant="inline" limit={4} />
        </WorkflowFocusGate>
      </div>
    </section>
  );
}
