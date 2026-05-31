import {
  buildReportHtml,
  defaultPdfFileName,
  getEffectiveMode,
  type ExportReportOptions,
} from "@/lib/exportReportContent";
import type { AnalysisResult } from "@/types/analysis";

export async function downloadPdfReport(
  result: AnalysisResult,
  options?: ExportReportOptions,
): Promise<void> {
  if (typeof window === "undefined") return;

  const mode = getEffectiveMode(result, options?.mode);
  const html = buildReportHtml(result, mode, options?.imageDataUrl);
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  document.body.appendChild(container);

  const reportNode = container.querySelector(".report");
  if (!reportNode) {
    document.body.removeChild(container);
    throw new Error("无法生成 PDF 报告内容");
  }

  try {
    const html2pdf = (await import("html2pdf.js")).default;
    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: options?.fileName ?? defaultPdfFileName(mode),
        image: { type: "jpeg", quality: 0.92 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(reportNode)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
