"use client";

import SectionHeader from "@/components/SectionHeader";
import { useCallback, useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import TargetSelector from "@/components/TargetSelector";
import AnalysisResultView from "@/components/AnalysisResult";
import ReportCard from "@/components/ReportCard";
import { downloadMarkdownReport } from "@/lib/exportMarkdown";
import type { AnalysisResult, TargetDepartment } from "@/types/analysis";

type WorkflowStatus = "idle" | "loading" | "success" | "error";

export default function AnalysisWorkflow() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetDepartment, setTargetDepartment] =
    useState<TargetDepartment>("物业");
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [mockMode, setMockMode] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleImageSelect = useCallback((selected: File, url: string) => {
    setFile(selected);
    setPreviewUrl(url);
    setResult(null);
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setStatus("idle");
    setErrorMessage(null);
    setCopySuccess(false);
  }, [previewUrl]);

  const handleAnalyze = async () => {
    if (!file) {
      setErrorMessage("请先上传现场照片");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("targetDepartment", targetDepartment);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "分析失败");
      }

      setResult(data as AnalysisResult);
      setMockMode(Boolean(data.mockMode));
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "分析失败，请稍后重试",
      );
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.reportText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setErrorMessage("复制失败，请手动选择文本复制");
    }
  };

  const handleExport = () => {
    if (!result) return;
    const date = new Date().toISOString().slice(0, 10);
    downloadMarkdownReport(result, `无碍-反馈报告-${date}.md`);
  };

  const isLoading = status === "loading";
  const canGenerate = Boolean(file) && !isLoading;

  return (
    <div className="space-y-8">
      <div className="glass-card p-4 sm:p-6 lg:p-8">
        <SectionHeader
          eyebrow="Tool"
          title="上传并分析"
          description="上传盲道占用现场照片，选择反馈对象，一键生成结构化报告"
        />

        <div className="-mt-2 space-y-6">
          <ImageUploader
            previewUrl={previewUrl}
            onImageSelect={handleImageSelect}
            disabled={isLoading}
          />

          <TargetSelector
            value={targetDepartment}
            onChange={setTargetDepartment}
            disabled={isLoading}
          />

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!canGenerate}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                正在生成反馈报告…
              </>
            ) : (
              "生成反馈报告"
            )}
          </button>

          {errorMessage && (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {mockMode && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>演示模式：</strong>
          未配置 GEMMA_API_KEY，当前使用 Mock 数据模拟 Gemma 4
          结构化分析结果。配置环境变量后将自动切换为真实 API。
        </div>
      )}

      {result && status === "success" && (
        <div className="space-y-6">
          <div className="glass-card p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-slate-900">分析结果</h2>
            <p className="mt-1 text-sm text-slate-500">
              Gemma 4 无障碍场景理解与结构化反馈
            </p>
            <div className="mt-6">
              <AnalysisResultView result={result} />
            </div>
            <div className="mt-6">
              <ReportCard reportText={result.reportText} />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={handleCopy}
              className="btn-primary flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-white sm:flex-none sm:min-w-[140px]"
            >
              {copySuccess ? "已复制 ✓" : "复制反馈文本"}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="btn-secondary flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 sm:flex-none sm:min-w-[140px]"
            >
              导出 Markdown
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 sm:flex-none sm:min-w-[140px]"
            >
              重新上传
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
