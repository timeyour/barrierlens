import {
  buildMarkdownReport,
  getEffectiveMode,
  type ExportReportOptions,
} from "@/lib/exportReportContent";
import type { AnalysisResult } from "@/types/analysis";

export { buildMarkdownReport } from "@/lib/exportReportContent";

export function downloadMarkdownReport(
  result: AnalysisResult,
  fileName?: string,
  mode?: ExportReportOptions["mode"],
): void {
  const effectiveMode = getEffectiveMode(result, mode);
  const markdown = buildMarkdownReport(result, effectiveMode);
  const date = new Date().toISOString().slice(0, 10);
  const defaultName =
    effectiveMode === "inspection"
      ? `无碍-合规诊断建议书-${date}.md`
      : `无碍-证据报告-${date}.md`;
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName ?? defaultName;
  link.click();
  URL.revokeObjectURL(url);
}
