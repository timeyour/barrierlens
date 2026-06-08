import {
  buildReportHtml,
  defaultPdfFileName,
  getEffectiveMode,
  type ExportReportOptions,
} from "@/lib/exportReportContent";
import { resolveImageDataUrlForExport } from "@/lib/imageUtils";
import type { AnalysisResult } from "@/types/analysis";

export async function downloadPdfReport(
  result: AnalysisResult,
  options?: ExportReportOptions,
): Promise<void> {
  if (typeof window === "undefined") return;

  const mode = getEffectiveMode(result, options?.mode);
  const imageDataUrl = await resolveImageDataUrlForExport(options?.imageDataUrl);
  const html = buildReportHtml(result, mode, imageDataUrl);
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "210mm";
  document.body.appendChild(container);

  const reportNode = container.querySelector(".report");
  if (!reportNode) {
    document.body.removeChild(container);
    throw new Error("无法生成 PDF 报告内容");
  }

  try {
    const mod = await import("html2pdf.js");
    const html2pdf = mod.default ?? mod;
    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: options?.fileName ?? defaultPdfFileName(mode),
        image: { type: "jpeg", quality: 0.92 },
        html2canvas: {
          scale: 2,
          useCORS: false,
          allowTaint: true,
          logging: false,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(reportNode)
      .save();
  } catch (error) {
    const detail =
      error instanceof Error && error.message ? error.message : "html2pdf 渲染失败";
    throw new Error(`PDF 导出失败：${detail}`);
  } finally {
    document.body.removeChild(container);
  }
}
