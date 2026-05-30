import MixedHomeActionStrip from "@/components/MixedHomeActionStrip";
import HomeRecentReportsPanel from "@/components/HomeRecentReportsPanel";
import AnalysisWorkflow from "@/components/AnalysisWorkflow";
import type { WorkbenchLayout } from "@/config/workbenchLayout";

interface MixedHomeWorkbenchProps {
  layout?: WorkbenchLayout;
}

function WorkbenchSidebar() {
  return (
    <aside className="sticky top-24 hidden self-start md:block">
      <HomeRecentReportsPanel variant="sidebar" limit={5} layout="mixed" />
    </aside>
  );
}

/** 双卡片：取证条 + wizard 分开（默认） */
function DefaultWorkbench() {
  return (
    <div className="min-w-0 space-y-4 md:space-y-5">
      <MixedHomeActionStrip />
      <div className="md:hidden">
        <HomeRecentReportsPanel variant="inline" limit={2} layout="mixed" />
      </div>
      <div id="tool" className="scroll-mt-24">
        <AnalysisWorkflow />
      </div>
    </div>
  );
}

/** 单卡片：路名一行 + 紧凑上传（?layout=compact） */
function CompactWorkbench() {
  return (
    <div className="min-w-0">
      <div
        id="tool"
        className="scroll-mt-24 space-y-4 md:space-y-0 md:overflow-hidden md:rounded-2xl md:border md:border-slate-200 md:bg-white md:shadow-lg"
      >
        <div className="md:border-b md:border-slate-100 md:px-4 md:py-3 lg:px-5">
          <MixedHomeActionStrip embedded />
        </div>
        <div className="md:px-4 md:pb-4 lg:px-5 lg:pb-5">
          <AnalysisWorkflow compact embedded />
        </div>
      </div>
      <div className="mt-3 md:hidden">
        <HomeRecentReportsPanel variant="inline" limit={2} layout="mixed" />
      </div>
    </div>
  );
}

export default function MixedHomeWorkbench({
  layout = "default",
}: MixedHomeWorkbenchProps) {
  const isCompact = layout === "compact";

  return (
    <section
      aria-label="记录工作台"
      className="relative z-10 bg-[var(--background)] pt-4 md:-mt-14 md:bg-transparent md:pt-0 lg:-mt-16"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,300px)] md:gap-6 lg:gap-8">
        {isCompact ? <CompactWorkbench /> : <DefaultWorkbench />}
        <WorkbenchSidebar />
      </div>
    </section>
  );
}
